import config from '@config';
import { ETradeOfferEvents, ITradeOffer } from '@entities/steam-tradeoffer-manager';
import { ESteamUserEvents, ISteamUserError } from '@entities/steam-user';
import { ESteamCommunityEvents } from '@entities/steamcommunity';
import SteamTotp from '@services/steam-totp';
import { autobind } from 'core-decorators';
import { EventEmitter } from 'events';
import { first, get, isEmpty, isUndefined } from 'lodash';
import TradeOfferManager from 'steam-tradeoffer-manager';
import SteamUser from 'steam-user';
import SteamCommunity from 'steamcommunity';
import { setInterval } from 'timers';
import { EBotEvents } from './EBotEvents';
import { EBotStatus } from './EBotStatus';

export class Bot extends EventEmitter {
  private static readonly RELOGIN_TIMEOUT = 60 * 60 * 1000 + 500; // 60.5 mins
  private static readonly HEALTHCHECK_INTERVAL = 1000; // 1 sec
  private status = EBotStatus.IDLE;
  private readonly client = new SteamUser();
  private readonly totp = new SteamTotp();
  private readonly community = new SteamCommunity();
  private readonly manager = new TradeOfferManager({
    steam: this.client,
    community: this.community,
    language: config.app.language,
    pollInterval: config.app.pollInterval,
    cancelTime: config.app.createCancelTime,
    cancelOfferCount: config.app.acceptOfferMaxAttempts,
  });

  constructor() {
    super();
    this.init();
    this.healthcheck();
  }

  private init(): void {
    this.login();
    this.client.setOption('promptSteamGuardCode', false);
    this.client.on(ESteamUserEvents.ERROR, this.onClientError);
    this.client.on(ESteamUserEvents.LOGGED_ON, this.onClientLogOn);
    this.client.on(ESteamUserEvents.DISCONNECTED, this.onClientDisconnect);
    this.client.on(ESteamUserEvents.STEAM_GUARD, this.onClientSteamGuard);
    this.client.on(ESteamUserEvents.WEB_SESSION, this.onClientWebSession);
    this.community.on(ESteamCommunityEvents.SESSION_EXPIRED, this.onCommunitySessionExpired);
    this.manager.on(ETradeOfferEvents.NEW_OFFER, this.onManagerNewOffer);
    this.manager.on(ETradeOfferEvents.SENT_OFFER_CHANGED, this.onManagerSentOfferChanged);
  }

  @autobind
  private onManagerSentOfferChanged(offer: ITradeOffer, _: unknown): void {
    if (offer.state === TradeOfferManager.ETradeState.Accepted) {
      offer.getExchangeDetails((...args) => this.onOfferGetExchangeDetails(offer, ...args));
    }
    this.emit(
      EBotEvents.SEND_OFFER_STATE,
      offer.id,
      offer.partner.getSteamID64(),
      offer.message,
      offer.data('data'),
    );
  }

  @autobind
  private onOfferGetExchangeDetails(
    offer: ITradeOffer,
    error: Error | null,
    _status: unknown,
    _tradeInitTime: unknown,
    receivedItems: object[],
    _sentItems: unknown,
  ): void {
    if (error) {
      this.emit(
        EBotEvents.ERROR,
        new Error('SteamTradeOfferManager error while getting exchange details'),
        error,
      );
      return;
    }
    const nextReceivedItems = receivedItems
      .map(item => {
        if (!config.bot.steamId) {
          this.emit(EBotEvents.ERROR, new Error('No `steamId` specified for bot!'));
          return;
        }
        return {
          asset_id: get(item, 'new_assetid'),
          app_id: get(item, 'appid'),
          classid: get(item, 'classid'),
          market_hash_name: get(item, 'market_hash_name'),
          link:
            get(item, 'actions') && first(get(item, 'actions'))
              ? first<string>(get(item, 'actions'))!
                  .replace('%owner_steamid%', config.bot.steamId)
                  .replace('%assetid%', get(item, 'assetid'))
              : '',
        };
      })
      .filter(item => !isUndefined(item));
    if (!isEmpty(nextReceivedItems)) {
      this.emit(
        EBotEvents.SEND_OFFER_ITEMS,
        offer.id,
        offer.partner.getSteamID64(),
        offer.message,
        offer.data('data'),
        nextReceivedItems,
      );
    }
  }

  @autobind
  private onManagerNewOffer(offer: ITradeOffer): void {
    this.emit(EBotEvents.NEW_OFFER, offer);
    offer.decline(this.onOfferDecline);
  }

  @autobind
  private onOfferDecline(error: Error | null): void {
    if (error) {
      this.emit(
        EBotEvents.ERROR,
        new Error('SteamTradeOfferManager error while declining offer'),
        error,
      );
    }
    this.emit(EBotEvents.OFFER_DECLINED);
  }

  @autobind
  private onCommunitySessionExpired(error: Error): void {
    this.status = EBotStatus.SESSION_EXPIRED;
    this.emit(EBotEvents.ERROR, new Error('SteamCommunity session has expired'), error);
    this.login();
  }

  @autobind
  private onClientWebSession(_: unknown, cookies: object[]): void {
    this.manager.setCookies(cookies, this.onManagerSetCookies);
    this.community.setCookies(cookies);
    const [time, confKey, allowKey] = this.totp.getConfirmationKeys();
    this.community.acceptAllConfirmations(time, confKey, allowKey, this.onCommunityConfirmations);
  }

  @autobind
  private onCommunityConfirmations(error: Error | null, confs: object[]): void {
    if (error) {
      this.emit(EBotEvents.ERROR, new Error('SteamCommunity confirmations error!'), error);
      return;
    }
    this.emit(EBotEvents.CONFIRMATION, confs);
  }

  @autobind
  private onManagerSetCookies(error: Error | null): void {
    if (error) {
      this.emit(EBotEvents.ERROR, new Error("TradeOfferManager can't set cookies!"), error);
      return this.manager.doPoll();
    }
    this.emit(EBotEvents.SET_COOKIES);
    this.status = EBotStatus.WEB_SESSION;
  }

  @autobind
  private onClientSteamGuard(_: unknown, callback: (code: string) => void): void {
    if (!config.bot.sharedSecret) {
      this.emit(EBotEvents.ERROR, new Error('No `sharedSecret` specified for bot!'));
      return;
    }
    const code = this.totp.getAuthCode(config.bot.sharedSecret);
    callback(code);
    this.emit(EBotEvents.STEAM_GUARD);
  }

  @autobind
  private onClientDisconnect(): void {
    this.emit(EBotEvents.DISCONNECT);
    this.status = EBotStatus.DISCONNECTED;
  }

  @autobind
  private onClientLogOn(): void {
    this.client.setPersona(SteamUser.EPersonaState.Online);
    this.emit(EBotEvents.LOGIN);
  }

  @autobind
  private onClientError(error: ISteamUserError): void {
    this.emit(EBotEvents.ERROR, error);
    if (error.eresult === SteamUser.EErrorResult.RateLimitExceeded) {
      this.emit(EBotEvents.LIMIT, new Error('Steam Limit! Will try re-login in 1 hour!'), error);
      setTimeout(() => this.login(), Bot.RELOGIN_TIMEOUT);
    }
  }

  private login(): void {
    if (this.client.steamID) {
      this.client.webLogOn();
    } else {
      if (!config.bot.sharedSecret) {
        this.emit(EBotEvents.ERROR, new Error('No `sharedSecret` specified for bot!'));
        return;
      }
      const tfa = this.totp.getAuthCode(config.bot.sharedSecret);
      if (!config.bot.accountName) {
        this.emit(EBotEvents.ERROR, new Error('No `accountName` specified for bot!'));
        return;
      }
      if (!config.bot.password) {
        this.emit(EBotEvents.ERROR, new Error('No `accountName` specified for bot!'));
        return;
      }
      this.client.logOn({
        accountName: config.bot.accountName,
        password: config.bot.password,
        twoFactorCode: tfa,
      });
    }
  }

  private healthcheck(): void {
    this.emit(EBotEvents.HEALTHCHECK, this.status);
    setInterval(() => this.emit(EBotEvents.HEALTHCHECK, this.status), Bot.HEALTHCHECK_INTERVAL);
  }
}

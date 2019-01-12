// tslint:disable:no-duplicate-string
import config from '@config';
import { EGlobalOffensiveEvents } from '@entities/globaloffensive/EGlobalOffensiveEvents';
import { ETradeOfferEvents, ITradeOffer } from '@entities/steam-tradeoffer-manager';
import { ESteamUserEvents, ISteamUserError } from '@entities/steam-user';
import { ESteamCommunityEvents } from '@entities/steamcommunity';
import SteamTotp from '@services/steam-totp';
import { autobind } from 'core-decorators';
import { EventEmitter } from 'events';
import GlobalOffensive from 'globaloffensive';
import _ from 'lodash';
import TradeOfferManager from 'steam-tradeoffer-manager';
import SteamUser from 'steam-user';
import SteamCommunity from 'steamcommunity';
import { setInterval } from 'timers';
import { EBotEvents } from './EBotEvents';
import { EBotStatuses } from './EBotStatuses';

export class Bot extends EventEmitter {
  // Timers
  private static readonly USER_TIMEOUT = 2500; // 1 sec
  private static readonly PERSONAS_TIMEOUT = 5000; // 1 sec
  private static readonly RELOGIN_TIMEOUT = 60 * 60 * 1000 + 500; // 60.5 mins
  private static readonly HEALTHCHECK_INTERVAL = 1000; // 1 sec
  // Flags
  private statuses = {
    [EBotStatuses.WEB_SESSION]: false,
    [EBotStatuses.DISCONNECTED]: false,
    [EBotStatuses.GC_CONNECTED]: false,
    [EBotStatuses.SESSION_EXPIRED]: false,
    [EBotStatuses.BLOCKED]: false,
  };
  // Libs
  private readonly client = new SteamUser();
  private readonly totp = new SteamTotp();
  private readonly community = new SteamCommunity();
  private readonly coordinator = new GlobalOffensive(this.client);
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
    // Client handlers
    this.client.setOption('promptSteamGuardCode', false);
    this.client.on(ESteamUserEvents.ERROR, this.onClientError);
    this.client.on(ESteamUserEvents.LOGGED_ON, this.onClientLogOn);
    this.client.on(ESteamUserEvents.DISCONNECTED, this.onClientDisconnect);
    this.client.on(ESteamUserEvents.STEAM_GUARD, this.onClientSteamGuard);
    this.client.on(ESteamUserEvents.WEB_SESSION, this.onClientWebSession);
    this.client.on(ESteamUserEvents.PLAYING_STATE, this.onClientPlayingState);
    // Community handlers
    this.community.on(ESteamCommunityEvents.SESSION_EXPIRED, this.onCommunitySessionExpired);
    // Manager handlers
    this.manager.on(ETradeOfferEvents.NEW_OFFER, this.onManagerNewOffer);
    this.manager.on(ETradeOfferEvents.SENT_OFFER_CHANGED, this.onManagerSentOfferChanged);
    // Coordinator handlers
    this.coordinator.on(EGlobalOffensiveEvents.CONNECTED_TO_GC, this.onCoordinatorConnected);
  }

  // Client handler

  @autobind
  private onClientPlayingState(blocked: boolean, playingApp: string): void {
    if (blocked) {
      this.statuses[EBotStatuses.BLOCKED] = true;
    }
    this.emit(EBotEvents.PLAYING_STATE, blocked, playingApp);
  }

  @autobind
  private onClientWebSession(_sessionId: unknown, cookies: object[]): void {
    this.manager.setCookies(cookies, this.onManagerSetCookies);
    this.community.setCookies(cookies);
    const [time, confKey, allowKey] = this.totp.getConfirmationKeys();
    this.community.acceptAllConfirmations(time, confKey, allowKey, this.onCommunityConfirmations);
  }

  @autobind
  private onClientSteamGuard(_domain: unknown, callback: (code: string) => void): void {
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
    this.statuses[EBotStatuses.DISCONNECTED] = true;
  }

  @autobind
  private onClientLogOn(): void {
    this.client.setPersona(SteamUser.EPersonaState.Online);
    setTimeout(() => {
      if (!config.bot.steamId) {
        this.emit(EBotEvents.ERROR, new Error('No `steamId` specified for bot!'));
        return;
      }
      this.client.getPersonas([config.bot.steamId], this.onClientUser);
    }, Bot.USER_TIMEOUT);
    this.emit(EBotEvents.LOGIN);
  }

  @autobind
  private onClientUser(): void {
    if (!this.statuses[EBotStatuses.BLOCKED]) {
      this.client.gamesPlayed([config.app.game]);
    } else {
      this.emit(EBotEvents.ERROR, new Error('Bot got `blocked` state!'));
      return;
    }
    setTimeout(() => {
      if (!config.bot.steamId) {
        this.emit(EBotEvents.ERROR, new Error('No `steamId` specified for bot!'));
        return;
      }
      this.client.getPersonas([config.bot.steamId], this.onClientGetPersonas);
    }, Bot.PERSONAS_TIMEOUT);
  }

  @autobind
  private onClientGetPersonas(personas: object): void {
    this.emit(EBotEvents.USER, personas);
  }

  @autobind
  private onClientError(error: ISteamUserError): void {
    this.emit(EBotEvents.ERROR, error);
    if (error.eresult === SteamUser.EResult.RateLimitExceeded) {
      this.emit(EBotEvents.LIMIT, new Error('Steam Limit! Will try re-login in 1 hour!'), error);
      setTimeout(() => this.login(), Bot.RELOGIN_TIMEOUT);
    }
  }

  // Community handler

  @autobind
  private onCommunitySessionExpired(error: Error): void {
    this.statuses[EBotStatuses.SESSION_EXPIRED] = true;
    this.emit(EBotEvents.ERROR, new Error('SteamCommunity session has expired'), error);
    this.login();
  }

  @autobind
  private onCommunityConfirmations(error: Error | null, confs: object[]): void {
    if (error) {
      this.emit(EBotEvents.ERROR, new Error('SteamCommunity confirmations error!'), error);
      return;
    }
    this.emit(EBotEvents.CONFIRMATION, confs);
  }

  // Manager handlers

  @autobind
  private onManagerSentOfferChanged(offer: ITradeOffer, _reason: unknown): void {
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
  private onManagerNewOffer(offer: ITradeOffer): void {
    this.emit(EBotEvents.NEW_OFFER, offer);
    offer.decline(this.onOfferDecline);
  }

  @autobind
  private onManagerSetCookies(error: Error | null): void {
    if (error) {
      this.emit(EBotEvents.ERROR, new Error("TradeOfferManager can't set cookies!"), error);
      return this.manager.doPoll();
    }
    this.emit(EBotEvents.SET_COOKIES);
    this.statuses[EBotStatuses.WEB_SESSION] = true;
  }

  // Offer handler

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
          asset_id: _.get(item, 'new_assetid'),
          app_id: _.get(item, 'appid'),
          classid: _.get(item, 'classid'),
          market_hash_name: _.get(item, 'market_hash_name'),
          link:
            _.get(item, 'actions') && _.first(_.get(item, 'actions'))
              ? _.first<string>(_.get(item, 'actions'))!
                  .replace('%owner_steamid%', config.bot.steamId)
                  .replace('%assetid%', _.get(item, 'assetid'))
              : '',
        };
      })
      .filter(item => !_.isUndefined(item));
    if (!_.isEmpty(nextReceivedItems)) {
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

  // Coordinator handlers

  @autobind
  private onCoordinatorConnected(): void {
    this.statuses[EBotStatuses.GC_CONNECTED] = true;
    this.emit(EBotEvents.GC_CONNECTED);
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
    this.emit(EBotEvents.HEALTHCHECK, this.statuses);
    setInterval(() => this.emit(EBotEvents.HEALTHCHECK, this.statuses), Bot.HEALTHCHECK_INTERVAL);
  }
}

import config from '@config';
import { ESteamUserEvents } from '@entities/steam-user';
import SteamTotp from '@services/steam-totp';
import { autobind } from 'core-decorators';
import { EventEmitter } from 'events';
import TradeOfferManager from 'steam-tradeoffer-manager';
import SteamUser, { ISteamUserError } from 'steam-user';
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
      this.emit(EBotEvents.ERROR, new Error('SteamCommunity confirmations error!'));
      return;
    }
    this.emit(EBotEvents.CONFIRMATION, confs);
  }

  @autobind
  private onManagerSetCookies(error: Error | null): void {
    if (error) {
      this.emit(EBotEvents.ERROR, new Error("TradeOfferManager can't set cookies!"));
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
    if (error.eresult === 84) {
      this.emit(EBotEvents.LIMIT, {
        ...error,
        ...new Error('Steam Limit! Will try re-login in 1 hour!'),
      });
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

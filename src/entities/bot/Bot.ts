import config from '@config';
import SteamTotp from '@services/steam-totp';
import { autobind } from 'core-decorators';
import { EventEmitter } from 'events';
import TradeOfferManager from 'steam-tradeoffer-manager';
import SteamUser, { ISteamUserError } from 'steam-user';
import SteamCommunity from 'steamcommunity';
import { EBotEvents } from './EBotEvents';
import { EBotStatus } from './EBotStatus';

export class Bot extends EventEmitter {
  private static readonly RELOGIN_TIMEOUT = 60 * 60 * 1000 + 500; // 60.5 mins
  // tslint:disable-next-line:no-unused-variable
  private status = EBotStatus.IDLE;
  private readonly user = new SteamUser();
  private readonly totp = new SteamTotp();
  private readonly community = new SteamCommunity();
  // tslint:disable-next-line:no-unused-variable
  private readonly manager = new TradeOfferManager({
    steam: this.user,
    community: this.community,
    language: config.app.language,
    pollInterval: config.app.pollInterval,
    cancelTime: config.app.createCancelTime,
    cancelOfferCount: config.app.acceptOfferMaxAttempts,
  });

  constructor() {
    super();
    this.init();
  }

  private init(): void {
    this.login();
    this.user.setOption('promptSteamGuardCode', false);
    this.user.on('error', this.onClientError);
    this.user.on('loggedOn', this.onClientLogOn);
    this.user.on('disconnected', this.onClientDisconnect);
  }

  @autobind
  private onClientDisconnect(): void {
    this.emit(EBotEvents.DISCONNECT);
    this.status = EBotStatus.DISCONNECTED;
  }

  @autobind
  private onClientLogOn(): void {
    this.user.setPersona(SteamUser.EPersonaState.Online);
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
    if (this.user.steamID) {
      this.user.webLogOn();
    } else {
      if (!config.bot.sharedSecret) {
        this.emit('error', new Error('No `sharedSecret` specified for bot!'));
        return;
      }
      const tfa = this.totp.getAuthCode(config.bot.sharedSecret);
      if (!config.bot.accountName) {
        this.emit('error', new Error('No `accountName` specified for bot!'));
        return;
      }
      if (!config.bot.password) {
        this.emit('error', new Error('No `accountName` specified for bot!'));
        return;
      }
      this.user.logOn({
        accountName: config.bot.accountName,
        password: config.bot.password,
        twoFactorCode: tfa,
      });
    }
  }
}

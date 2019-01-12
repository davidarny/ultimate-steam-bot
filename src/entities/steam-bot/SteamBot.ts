import config from '@config';
import { EGlobalOffensiveEvents } from '@entities/globaloffensive';
import { ETradeOfferEvents } from '@entities/steam-tradeoffer-manager';
import { ESteamUserEvents } from '@entities/steam-user';
import { ESteamCommunityEvents } from '@entities/steamcommunity';
import SteamTotp from '@services/steam-totp';
import { EventEmitter } from 'events';
import GlobalOffensive from 'globaloffensive';
import TradeOfferManager from 'steam-tradeoffer-manager';
import SteamUser from 'steam-user';
import SteamCommunity from 'steamcommunity';
import GlobalOffensiveController from './controllers/globaloffensive';
import OfferController from './controllers/steam-offer';
import ManagerController from './controllers/steam-tradeoffer-manager';
import ClientController from './controllers/steam-user';
import CommunityController from './controllers/steamcommunity';
import { EBotEvents } from './EBotEvents';
import { EBotStatuses } from './EBotStatuses';

export class SteamBot extends EventEmitter {
  // Timers
  private static readonly HEALTHCHECK_INTERVAL = 1000; // 1 sec
  // Flags
  public statuses = {
    [EBotStatuses.WEB_SESSION]: false,
    [EBotStatuses.DISCONNECTED]: false,
    [EBotStatuses.GC_CONNECTED]: false,
    [EBotStatuses.SESSION_EXPIRED]: false,
    [EBotStatuses.BLOCKED]: false,
  };
  // Vendor libs
  public readonly client = new SteamUser();
  public readonly totp = new SteamTotp();
  public readonly community = new SteamCommunity();
  public readonly coordinator = new GlobalOffensive(this.client);
  public readonly manager = new TradeOfferManager({
    steam: this.client,
    community: this.community,
    language: config.app.language,
    pollInterval: config.app.pollInterval,
    cancelTime: config.app.createCancelTime,
    cancelOfferCount: config.app.acceptOfferMaxAttempts,
  });
  // Controllers
  public readonly controllers = {
    client: new ClientController(this),
    manager: new ManagerController(this),
    community: new CommunityController(this),
    offer: new OfferController(this),
    coordinator: new GlobalOffensiveController(this),
  };

  constructor() {
    super();
    this.init();
    this.healthcheck();
  }

  public login(): void {
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

  private init(): void {
    this.login();
    // Client handlers
    this.client.setOption('promptSteamGuardCode', false);
    this.client.on(ESteamUserEvents.ERROR, this.controllers.client.onError);
    this.client.on(ESteamUserEvents.LOGGED_ON, this.controllers.client.onLogOn);
    this.client.on(ESteamUserEvents.DISCONNECTED, this.controllers.client.onDisconnect);
    this.client.on(ESteamUserEvents.STEAM_GUARD, this.controllers.client.onSteamGuard);
    this.client.on(ESteamUserEvents.WEB_SESSION, this.controllers.client.onWebSession);
    this.client.on(ESteamUserEvents.PLAYING_STATE, this.controllers.client.onPlayingState);
    // Community handlers
    this.community.on(
      ESteamCommunityEvents.SESSION_EXPIRED,
      this.controllers.community.onSessionExpired,
    );
    // Manager handlers
    this.manager.on(ETradeOfferEvents.NEW_OFFER, this.controllers.manager.onNewOffer);
    this.manager.on(
      ETradeOfferEvents.SENT_OFFER_CHANGED,
      this.controllers.manager.onSentOfferChanged,
    );
    // Coordinator handlers
    this.coordinator.on(
      EGlobalOffensiveEvents.CONNECTED_TO_GC,
      this.controllers.coordinator.onConnected,
    );
  }

  private healthcheck(): void {
    this.emit(EBotEvents.HEALTHCHECK, this.statuses);
    setInterval(
      () => this.emit(EBotEvents.HEALTHCHECK, this.statuses),
      SteamBot.HEALTHCHECK_INTERVAL,
    );
  }
}

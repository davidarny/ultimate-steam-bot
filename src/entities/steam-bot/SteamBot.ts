import config from '@config';
import { EGlobalOffensiveEvents } from '@entities/globaloffensive';
import ENodeEnv from '@entities/node-env';
import { ETradeOfferEvents } from '@entities/steam-tradeoffer-manager';
import { ESteamUserEvents } from '@entities/steam-user';
import { ESteamCommunityEvents } from '@entities/steamcommunity';
import CronService from '@services/cron';
import PriceService from '@services/price';
import * as SteamBotService from '@services/steam-bot';
import SteamTotpService from '@services/steam-totp';
import { ENVIRONMENT } from '@utils/secrets';
import { autobind } from 'core-decorators';
import { EventEmitter } from 'events';
import GlobalOffensive from 'globaloffensive';
import _ from 'lodash';
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
  public static getInstance(): SteamBot {
    if (!SteamBot.instance) {
      SteamBot.instance = new SteamBot();
    }
    return SteamBot.instance;
  }

  private static instance: SteamBot;
  // Timers
  private static readonly HEALTHCHECK_CRON =
    ENVIRONMENT === ENodeEnv.TEST ? '* * * * * *' : '*/15 * * * * *';
  // Flags
  public statuses = {
    [EBotStatuses.WEB_SESSION]: false,
    [EBotStatuses.DISCONNECTED]: true,
    [EBotStatuses.GC_CONNECTED]: false,
    [EBotStatuses.SESSION_EXPIRED]: false,
    [EBotStatuses.BLOCKED]: false,
  };
  // Vendor libs
  public readonly client = new SteamUser();
  public readonly totp = new SteamTotpService();
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
  // Healthcheck CRON
  private readonly cron = new CronService(SteamBot.HEALTHCHECK_CRON, this.healthcheck);
  private readonly price = new PriceService();

  private constructor() {
    super();
    this.init();
    this.cron.start();
    this.price.start();
  }

  public async getInventory(
    gameId: number,
    steamId: string | null,
  ): Promise<[object[], object[], number]> {
    return new Promise((resolve, reject) => {
      const userSteamId = steamId || this.client.steamID;
      this.community.getUserInventoryContents(
        userSteamId,
        gameId,
        2,
        false,
        'english',
        (error, ...rest) => {
          if (error) {
            return reject(error);
          }
          resolve(rest);
        },
      );
    });
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

  public async getItemInfo(link: string): Promise<object> {
    return new Promise((resolve, reject) => {
      const match = link.match(/[SM](\d+)A(\d+)D(\d+)$/);
      if (!match) {
        return reject(new Error('Item link is corrupted!'));
      }
      this.coordinator.inspectItem(_.nth(match, 1)!, _.nth(match, 2)!, _.nth(match, 3)!, resolve);
    });
  }

  public async sendGiveOffer(
    tradeUrl: string,
    items: object[],
    message: string,
    cancelTime: number,
  ): Promise<[string, string]> {
    return new Promise((resolve, reject) => {
      const offer = this.manager.createOffer(tradeUrl);
      offer.getUserDetails((error, _me, them) => {
        if (error) {
          return reject(error);
        }
        if (them.escrowDays === null || them.escrowDays > 0) {
          return reject(new Error("Partner doesn't have mobile authenticator"));
        }
        const itemsToGet = items.map(SteamBotService.getGiveOfferItem);
        offer.addMyItems(itemsToGet);
        offer.setMessage(message);
        // tslint:disable-next-line:no-shadowed-variable
        offer.send((error, status) => {
          if (error) {
            return reject(error);
          }
          offer.data('cancelTime', cancelTime);
          return resolve([offer.id, this.getTradeStatus(status)]);
        });
      });
    });
  }

  private getTradeStatus(status: string) {
    const statuses = {
      sent: TradeOfferManager.ETradeOfferState.Active,
      pending: TradeOfferManager.ETradeOfferState.CreatedNeedsConfirmation,
      default: TradeOfferManager.ETradeOfferState.Invalid,
    };
    return _.get(statuses, status, statuses.default);
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

  @autobind
  private healthcheck(): void {
    this.emit(EBotEvents.HEALTHCHECK, this.statuses);
  }
}

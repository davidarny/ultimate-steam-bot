import config from '@config';
import SteamBot, { EBotEvents, EBotStatuses } from '@entities/steam-bot';
import { ISteamUserError } from '@entities/steam-user';
import { autobind } from 'core-decorators';
import SteamUser from 'steam-user';

@autobind
export class SteamUserController {
  private static readonly RELOGIN_TIMEOUT = 60 * 60 * 1000 + 500; // 60.5 mins
  private static readonly USER_TIMEOUT = 2500; // 1 sec
  private static readonly PERSONAS_TIMEOUT = 5000; // 1 sec

  constructor(private readonly bot: SteamBot) {}

  public onError(error: ISteamUserError): void {
    this.bot.emit(EBotEvents.ERROR, error);
    if (error.eresult === SteamUser.EResult.RateLimitExceeded) {
      this.bot.emit(
        EBotEvents.LIMIT,
        new Error('Steam Limit! Will try re-login in 1 hour!'),
        error,
      );
      setTimeout(() => this.bot.login(), SteamUserController.RELOGIN_TIMEOUT);
    }
  }

  public onPlayingState(blocked: boolean, playingApp: string): void {
    this.bot.statuses[EBotStatuses.BLOCKED] = blocked;
    this.bot.emit(EBotEvents.PLAYING_STATE, blocked, playingApp);
  }

  public onWebSession(_sessionId: unknown, cookies: object[]): void {
    this.bot.manager.setCookies(cookies, this.bot.controllers.manager.onSetCookies);
    this.bot.community.setCookies(cookies);
    try {
      const [time, confKey, allowKey] = this.bot.totp.getConfirmationKeys();
      this.bot.community.acceptAllConfirmations(
        time,
        confKey,
        allowKey,
        this.bot.controllers.community.onConfirmations,
      );
    } catch (error) {
      this.bot.emit(EBotEvents.ERROR, error);
    }
  }

  public onSteamGuard(_domain: unknown, callback: (code: string) => void): void {
    if (!config.bot.sharedSecret) {
      this.bot.emit(EBotEvents.ERROR, new Error('No `sharedSecret` specified for bot!'));
      return;
    }
    const code = this.bot.totp.getAuthCode(config.bot.sharedSecret);
    callback(code);
    this.bot.emit(EBotEvents.STEAM_GUARD);
  }

  public onDisconnect(): void {
    this.bot.emit(EBotEvents.DISCONNECT);
    this.bot.statuses[EBotStatuses.DISCONNECTED] = true;
  }

  public onLogOn(): void {
    this.bot.client.setPersona(SteamUser.EPersonaState.Online);
    setTimeout(() => {
      if (!config.bot.steamId) {
        this.bot.emit(EBotEvents.ERROR, new Error('No `steamId` specified for bot!'));
        return;
      }
      this.bot.client.getPersonas([config.bot.steamId], this.onGetPersonas);
    }, SteamUserController.USER_TIMEOUT);
    this.bot.statuses[EBotStatuses.DISCONNECTED] = false;
    this.bot.emit(EBotEvents.LOGIN);
  }

  private onGetPersonas(): void {
    if (!this.bot.statuses[EBotStatuses.BLOCKED]) {
      this.bot.client.gamesPlayed([config.app.game]);
    } else {
      this.bot.emit(EBotEvents.ERROR, new Error('Bot got `blocked` state!'));
      return;
    }
    setTimeout(() => {
      if (!config.bot.steamId) {
        this.bot.emit(EBotEvents.ERROR, new Error('No `steamId` specified for bot!'));
        return;
      }
      this.bot.client.getPersonas([config.bot.steamId], this.onGetPersonasSecondTime);
    }, SteamUserController.PERSONAS_TIMEOUT);
  }

  private onGetPersonasSecondTime(personas: object): void {
    this.bot.emit(EBotEvents.USER, personas);
  }
}

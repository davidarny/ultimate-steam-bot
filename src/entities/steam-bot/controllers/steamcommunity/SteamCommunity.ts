import SteamBot, { EBotEvents, EBotStatuses } from '@entities/steam-bot';
import { autobind } from 'core-decorators';

@autobind
export class SteamCommunityController {
  constructor(private readonly bot: SteamBot) {}

  public onSessionExpired(error: Error): void {
    this.bot.statuses[EBotStatuses.SESSION_EXPIRED] = true;
    this.bot.emit(EBotEvents.ERROR, new Error('SteamCommunity session has expired'), error);
    this.bot.login();
  }

  public onConfirmations(error: Error | null, confs: object[]): void {
    if (error) {
      this.bot.emit(EBotEvents.ERROR, new Error('SteamCommunity confirmations error!'), error);
      return;
    }
    this.bot.emit(EBotEvents.CONFIRMATIONS, confs);
  }
}

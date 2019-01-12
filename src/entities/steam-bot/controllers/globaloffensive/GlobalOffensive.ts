import SteamBot, { EBotEvents, EBotStatuses } from '@entities/steam-bot';
import { autobind } from 'core-decorators';

@autobind
export class GlobalOffensiveController {
  constructor(private readonly bot: SteamBot) {}

  public onConnected(): void {
    this.bot.statuses[EBotStatuses.GC_CONNECTED] = true;
    this.bot.emit(EBotEvents.GC_CONNECTED);
  }
}

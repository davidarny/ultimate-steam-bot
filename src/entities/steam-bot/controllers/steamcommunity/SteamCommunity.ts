import SteamBot, { EBotEvents, EBotStatuses } from '@entities/steam-bot';
import { autobind } from 'core-decorators';
import _ from 'lodash';

@autobind
export class SteamCommunityController {
  private static readonly CONFIRMATIONS_ERROR_THROTTLE = 5 * 60 * 1000; // 5 mins
  private readonly onConfirmationsError = _.throttle(
    (error: Error) =>
      this.bot.emit(EBotEvents.ERROR, new Error('SteamCommunity confirmations error!'), error),
    SteamCommunityController.CONFIRMATIONS_ERROR_THROTTLE,
  );

  constructor(private readonly bot: SteamBot) {}

  public onSessionExpired(error: Error): void {
    this.bot.statuses[EBotStatuses.SESSION_EXPIRED] = true;
    this.bot.emit(EBotEvents.ERROR, new Error('SteamCommunity session has expired'), error);
    this.bot.login();
  }

  public onConfirmations(error: Error | null, confs: object[]): void {
    if (error) {
      this.onConfirmationsError(error);
      return;
    }
    this.bot.emit(EBotEvents.CONFIRMATIONS, confs);
  }
}

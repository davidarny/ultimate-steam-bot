import config from '@config';
import logger from '@utils/logger';
import { autobind } from 'core-decorators';
import SteamTotpPkg from 'steam-totp';

export class SteamTotp {
  private static readonly TIME_OFFSET_INTERVAL = 1000; // 1 sec
  private offset = 0;

  constructor() {
    SteamTotpPkg.getTimeOffset(this.onGetTimeOffset);
    this.run();
  }

  public getAuthCode(sharedSecret: string): string {
    return SteamTotpPkg.generateAuthCode(sharedSecret, this.offset);
  }

  public getConfirmationKeys(): [number, string, string] {
    const time = Math.floor(Date.now() / 1000);
    if (!config.bot.identitySecret) {
      throw new Error('No `identitySecret` specified for bot!');
    }
    const confKey = SteamTotpPkg.getConfirmationKey(config.bot.identitySecret, time, 'conf');
    const allowKey = SteamTotpPkg.getConfirmationKey(config.bot.identitySecret, time, 'allow');
    return [time, confKey, allowKey];
  }

  private run(): void {
    setInterval(
      () => SteamTotpPkg.getTimeOffset(this.onGetTimeOffset),
      SteamTotp.TIME_OFFSET_INTERVAL,
    );
  }

  @autobind
  private onGetTimeOffset(error: Error, offset?: number): void {
    if (error) {
      return logger.error('SteamTotp offset error: ', error);
    }
    this.offset = offset || 0;
  }
}

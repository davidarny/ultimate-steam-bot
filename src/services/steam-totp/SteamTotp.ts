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

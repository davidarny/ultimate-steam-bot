import Cron from '@services/cron';
import { ICron } from '@services/cron/ICron';
import SteamTotp from '@services/steam-totp';
import { autobind } from 'core-decorators';
import SteamCommunity from 'steamcommunity';

export class Confirmations implements ICron {
  private static readonly CONFIRMATIONS_CRON = '*/5 * * * * *';
  private readonly cron = new Cron(Confirmations.CONFIRMATIONS_CRON, this.accept);

  constructor(
    private readonly totp: SteamTotp,
    private readonly community: SteamCommunity,
    private readonly handler: (...args: any) => void,
  ) {}

  public start(): void {
    this.cron.start();
  }

  public stop(): void {
    this.cron.stop();
  }

  @autobind
  public accept() {
    const [time, confKey, allowKey] = this.totp.getConfirmationKeys();
    this.community.acceptAllConfirmations(time, confKey, allowKey, this.handler);
  }
}

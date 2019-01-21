import { CronJob } from 'cron';
import { ICron } from './ICron';

export class Cron implements ICron {
  private readonly job: CronJob;

  constructor(cronTime: string, onTick: () => void) {
    this.job = new CronJob({ cronTime, onTick });
  }

  public start(): void {
    this.job.start();
  }

  public stop(): void {
    this.job.stop();
  }
}

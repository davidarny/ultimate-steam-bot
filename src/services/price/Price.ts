import config from '@config';
import ENodeEnv from '@entities/node-env';
import RedisProvider from '@providers/redis';
import Cron from '@services/cron';
import logger from '@utils/logger';
import * as ServerSanitizer from '@utils/sanitizer/server';
import { ENVIRONMENT } from '@utils/secrets';
import { autobind } from 'core-decorators';
import _ from 'lodash';
import request from 'request-promise';

interface ISteamPriceItem {
  have: number;
  max: number;
  name: string;
  price: number;
  rate: number;
  res: number;
  tr: number;
}

export class Price {
  private static readonly PRICE_POLL_CRON =
    ENVIRONMENT === ENodeEnv.TEST ? '*/5 * * * *' : '* */15 * * * *';
  private readonly cron = new Cron(Price.PRICE_POLL_CRON, this.poll);

  public start(): void {
    this.cron.start();
  }

  @autobind
  private async poll(): Promise<void> {
    if (!config.app.requestPriceUrl) {
      logger.error(ServerSanitizer.message('No `requestPriceUrl` specified for bot!'));
      return;
    }
    const options: request.Options = {
      url: config.app.requestPriceUrl,
      method: 'GET',
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json',
      },
      json: true,
    };
    try {
      const response = await request(options);
      response.forEach((item: ISteamPriceItem) => {
        const size = _.size(_.toString(item.price));
        const price = `${
          size < 3
            ? 0
            : _.toString(item.price)
                .split('')
                .slice(0, size - 2)
                .join('')
        }.${_.toString(item.price)
          .split('')
          .slice(size - 2, size)
          .join('')}`;
        if (_.isNil(item.name) || _.isNil(price)) {
          return;
        }
        RedisProvider.getInstance().set(item.name, price);
      });
    } catch (error) {
      logger.error(ServerSanitizer.message('Error while polling prices'), error);
      return;
    }
  }
}

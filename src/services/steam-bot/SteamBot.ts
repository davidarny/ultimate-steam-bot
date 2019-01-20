import config from '@config';
import State from '@entities/state';
import RedisProvider from '@providers/redis';
import logger from '@utils/logger';
import * as ServerSanitizer from '@utils/sanitizer/server';
import _ from 'lodash';

export type TCheckMethodState = State<{
  items: object[];
  assetId: string;
  errors: Error[];
  assetIdsCount: number;
  redisItemCounter: number;
  isCostValid: boolean;
  totalItemsCost: number;
}>;

export function processAssetId(state: TCheckMethodState, callback: (code: number) => void): void {
  const result = state.get('items').some(item => {
    if (state.get('assetId') === _.get(item, 'assetid')) {
      const type = config.app.noType.every(val => _.get(item, 'type').indexOf(val) === -1);
      if (!type) {
        callback(1003);
        return _.get(item, 'assetid') === state.get('assetId');
      }
      RedisProvider.getInstance().get(_.get(item, 'market_hash_name'), (error, reply) =>
        processMarketItem(error, reply, state, callback),
      );
    }
    return _.get(item, 'assetid') === state.get('assetId');
  });
  if (!result) {
    callback(1004);
  }
}

export function processMarketItem(
  error: Error | null,
  reply: string,
  state: TCheckMethodState,
  callback: (code: number) => void,
): void {
  if (error) {
    state.get('errors').push(error);
  }
  state.set('redisItemCounter', state.get('redisItemCounter') + 1);
  if (!state.get('isCostValid')) {
    return;
  }
  const cost = _.isNaN(parseFloat(reply)) ? 0 : parseFloat(reply);
  if (cost < config.app.acceptableItemCost) {
    state.set('isCostValid', false);
    callback(1002);
  }
  state.set('totalItemsCost', state.get('totalItemsCost') + cost);
  if (state.get('redisItemCounter') === state.get('assetIdsCount')) {
    callback(1002);
  }
  callback(1000);
}

export function getNextMyItem(item: object): object | undefined {
  if (!config.bot.steamId) {
    logger.error(ServerSanitizer.message(), new Error('No `steamId` specified for bot!'));
    return;
  }
  return {
    appid: _.get(item, 'appid'),
    assetid: _.get(item, 'assetid'),
    market_hash_name: _.get(item, 'market_hash_name'),
    tags: _.get(item, 'tags'),
    appdata: _.get(item, 'app_data'),
    name_color: _.get(item, 'name_color'),
    classid: _.get(item, 'classid'),
    type: _.get(item, 'type'),
    img: _.get(item, 'getImageURL', () => undefined)(),
    tradable: _.get(item, 'tradable'),
    link:
      _.get(item, 'actions') &&
      _.first(_.get(item, 'actions')) &&
      _.has(_.first(_.get(item, 'actions')), 'link')
        ? _.first<{ link: string }>(_.get(item, 'actions'))!
            .link.replace('%owner_steamid%', config.bot.steamId)
            .replace('%assetid%', _.get(item, 'assetid'))
        : '',
  };
}

export function getNextTheirItem(item: object): object | undefined {
  if (!config.bot.steamId) {
    logger.error(ServerSanitizer.message(), new Error('No `steamId` specified for bot!'));
    return;
  }
  return {
    appid: _.get(item, 'appid'),
    assetid: _.get(item, 'assetid'),
    market_hash_name: _.get(item, 'market_hash_name'),
    tags: _.get(item, 'tags'),
    appdata: _.get(item, 'app_data'),
    market_marketable_restriction: _.get(item, 'market_marketable_restriction'),
    market_tradable_restriction: _.get(item, 'market_tradable_restriction'),
    marketable: _.get(item, 'marketable'),
    name_color: _.get(item, 'name_color'),
    classid: _.get(item, 'classid'),
    type: _.get(item, 'type'),
    img: _.get(item, 'getImageURL', () => undefined)(),
    tradable: _.get(item, 'tradable'),
    link:
      _.get(item, 'actions') &&
      _.first(_.get(item, 'actions')) &&
      _.has(_.first(_.get(item, 'actions')), 'link')
        ? _.first<{ link: string }>(_.get(item, 'actions'))!
            .link.replace('%owner_steamid%', config.bot.steamId)
            .replace('%assetid%', _.get(item, 'assetid'))
        : '',
  };
}

export function getGiveOfferItem(item: object): object {
  return {
    assetid: _.get(item, 'assetid'),
    appid: _.get(item, 'appid'),
    contextid: 2,
  };
}

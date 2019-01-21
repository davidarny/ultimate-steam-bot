import config from '@config';
import { ApiResponse } from '@entities/response';
import State from '@entities/state';
import * as SteamBotService from '@services/steam-bot';
import logger from '@utils/logger';
import * as BotSanitizer from '@utils/sanitizer/bot';
import express from 'express';
import _ from 'lodash';
import request from 'request-promise';

const OFFER_CANCEL_TIME = 120_000;

export function my() {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const [items] = await req.ctx.bot.getInventory(req.ctx.body.gameID, null);
      const nextItems = items.map(SteamBotService.getNextMyItem);
      res.json(new ApiResponse({ data: { items: nextItems } }).get());
      return next();
    } catch (error) {
      res.json(new ApiResponse({ error: new Error(error.message) }).get());
      return next();
    }
  };
}

export function their() {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const [items] = await req.ctx.bot.getInventory(req.ctx.body.gameID, req.ctx.body.steam_id);
      const itemsFilteredByCost = items.filter(item => _.get(item, 'cost') !== 'n');
      // TODO: lack of typings, possible bugs
      const itemsFilteredByType = itemsFilteredByCost.filter(item =>
        config.app.noType.every((value: object) => _.get(item, 'type').indexOf(value) === -1),
      );
      const nextItems = itemsFilteredByType.map(SteamBotService.getNextTheirItem);
      res.json(new ApiResponse({ data: { items: nextItems } }).get());
      return next();
    } catch (error) {
      res.json(new ApiResponse({ error: new Error(error.message) }).get());
      return next();
    }
  };
}

export function check() {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const [items] = await req.ctx.bot.getInventory(req.ctx.body.gameID, req.ctx.body.steam_id);
      const state: SteamBotService.TCheckMethodState = new State({
        items,
        assetId: '',
        errors: [],
        assetIdsCount: req.ctx.body.asset_ids.length,
        redisItemCounter: 0,
        isCostValid: true,
        totalItemsCost: 0,
      });
      const callback = _.once(code => {
        if (!_.isEmpty(state.get('errors'))) {
          res.json(new ApiResponse({ error: _.first(state.get('errors')) }).get());
          return next();
        }
        res.json(new ApiResponse({ data: { code } }).get());
        return next();
      });
      for (const assetId of req.ctx.body.asset_ids) {
        state.merge({ assetId });
        SteamBotService.processAssetId(state, callback);
      }
    } catch {
      res.json(new ApiResponse({ data: { code: 1001 } }));
      return next();
    }
  };
}

export function getItemsInfo() {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const items: object[] = [];
    const links = req.ctx.body.links;
    const bot = req.ctx.bot;
    const promises = links.map(() => bot.getItemInfo.bind(bot));
    let index = 0;
    for (const promise of promises) {
      const link = _.nth(links, index);
      if (!link) {
        index += 1;
        continue;
      }
      const item = await promise(link);
      items.push(item);
      index += 1;
    }
    res.json(new ApiResponse({ data: items }).get());
    return next();
  };
}

export function sendGiveOffer() {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const [offerId, status] = await req.ctx.bot.sendGetOrGiveOffer(
      'give',
      req.ctx.body.trade_url,
      req.ctx.body.items,
      req.ctx.body.comment,
      OFFER_CANCEL_TIME,
    );
    res.json(new ApiResponse({ data: { offer_state: status, offer_id: offerId } }).get());
    return next();
  };
}

export function sendGetOffer() {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const [offerId, status] = await req.ctx.bot.sendGetOrGiveOffer(
      'get',
      req.ctx.body.trade_url,
      req.ctx.body.items,
      req.ctx.body.comment,
      OFFER_CANCEL_TIME,
      req.ctx.body.data,
    );
    res.json(new ApiResponse({ data: { offer_state: status, offer_id: offerId } }).get());
    return next();
  };
}

export async function onSendOfferState(
  offerId: string,
  partnerSteamId: string,
  message: string,
  data: object,
) {
  if (!config.app.sentOfferChangedUrl) {
    logger.error(BotSanitizer.message('No `sentOfferChangedUrl` specified for bot!'));
    return;
  }
  const options = {
    method: 'POST',
    url: config.app.sentOfferChangedUrl,
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
    },
    body: {
      data,
      offer_id: offerId,
      steam_id: partnerSteamId,
      offer_state: message,
    },
    json: true,
  };
  try {
    logger.debug(BotSanitizer.message('SendOfferState'), options);
    await request(options);
  } catch (error) {
    logger.error(BotSanitizer.message(), error);
  }
}

export async function onSendOfferItems(
  offerId: string,
  partnerSteamId: string,
  message: string,
  data: object,
  items: object[],
) {
  if (!config.app.webhookUrl) {
    logger.error(BotSanitizer.message('No `webhookUrl` specified for bot!'));
    return;
  }
  const options = {
    method: 'POST',
    url: config.app.webhookUrl,
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
    },
    body: {
      items,
      bot_steam_id: config.bot.botId,
      offer_id: offerId,
      steam_id: partnerSteamId,
      comment: message,
      custom_data: data,
    },
    json: true,
  };
  try {
    logger.debug(BotSanitizer.message('SendOfferItems'), options);
    await request(options);
  } catch (error) {
    logger.error(BotSanitizer.message(), error);
  }
}

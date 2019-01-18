import config from '@config';
import { ApiResponse } from '@entities/response';
import State from '@entities/state';
import * as SteamBotService from '@services/steam-bot';
import express from 'express';
import _ from 'lodash';

export function my() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    req.ctx.bot.getInventory(req.ctx.body.gameID, null, (error, items) => {
      if (error) {
        sendErrorResponse(res, error);
        return next();
      }
      const nextItems = items.map(SteamBotService.getNextMyItem);
      res.json(new ApiResponse({ data: nextItems }).get());
      return next();
    });
  };
}

export function their() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    req.ctx.bot.getInventory(req.ctx.body.gameID, req.ctx.body.steam_id, (error, items) => {
      if (error) {
        sendErrorResponse(res, error);
        return next();
      }
      const itemsFilteredByCost = items.filter(item => _.get(item, 'cost') !== 'n');
      // TODO: lack of typings, possible bugs
      const itemsFilteredByType = itemsFilteredByCost.filter(item =>
        config.app.noType.every((value: object) => _.get(item, 'type').indexOf(value) === -1),
      );
      const nextItems = itemsFilteredByType.map(SteamBotService.getNextTheirItem);
      res.json(new ApiResponse({ data: nextItems }).get());
      return next();
    });
  };
}

export function check() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    req.ctx.bot.getInventory(req.ctx.body.gameID, req.ctx.body.steam_id, (error, items) => {
      if (error) {
        res.json(new ApiResponse({ data: { code: 1001 } }));
        return next();
      }
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
    });
  };
}

function sendErrorResponse(res: express.Response, error: Error) {
  res.json(new ApiResponse({ error: new Error(error.message) }).get());
}

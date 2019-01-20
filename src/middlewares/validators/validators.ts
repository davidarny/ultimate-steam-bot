import config from '@config';
import { ApiResponse } from '@entities/response';
import { EBotStatuses } from '@entities/steam-bot';
import express from 'express';
import _ from 'lodash';

export function checkBotId() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (config.bot.botId === req.ctx.body.bot_id) {
      return next();
    }
    return res.json(new ApiResponse({ error: new Error('"botId" field missing') }).get());
  };
}

export function checkSteamId() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!_.isNil(req.ctx.body.steam_id) && !_.isEmpty(req.ctx.body.steam_id)) {
      return next();
    }
    return res.json(new ApiResponse({ error: new Error('"steam_id" field missing') }).get());
  };
}

export function checkGameId(ids: number[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (ids.some(id => id === req.ctx.body.gameID)) {
      return next();
    }
    return res.json(new ApiResponse({ error: new Error('"gameID" is incorrect') }).get());
  };
}

export function checkBotStatus() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const bot = req.ctx.bot;
    const isBlocked = bot.statuses[EBotStatuses.BLOCKED];
    const isDisconnected = bot.statuses[EBotStatuses.DISCONNECTED];
    const isLoggedIn = bot.statuses[EBotStatuses.WEB_SESSION];
    if ((!isBlocked || !isDisconnected) && isLoggedIn) {
      return next();
    }
    return res.json(
      new ApiResponse({ error: new Error("Seems like bot isn't logged into Steam") }).get(),
    );
  };
}

export function checkAssetsIds() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (_.isNil(req.ctx.body.asset_ids)) {
      return res.json(new ApiResponse({ error: new Error('"asset_ids" field is missing') }).get());
    }
    if (!_.isArray(req.ctx.body.asset_ids)) {
      return res.json(
        new ApiResponse({ error: new Error('"asset_ids" should be an array') }).get(),
      );
    }
    if (_.isEmpty(req.ctx.body.asset_ids)) {
      return res.json(
        new ApiResponse({ error: new Error('"asset_ids" should not be empty') }).get(),
      );
    }
    return next();
  };
}

export function checkItemsLinks() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (_.isNil(req.ctx.body.links)) {
      return res.json(new ApiResponse({ error: new Error('"links" field is missing') }).get());
    }
    if (!_.isArray(req.ctx.body.links)) {
      return res.json(new ApiResponse({ error: new Error('"links" should be an array') }).get());
    }
    if (_.isEmpty(req.ctx.body.links)) {
      return res.json(new ApiResponse({ error: new Error('"links" should not be empty') }).get());
    }
    return next();
  };
}

export function checkTradeUrl() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!_.isNil(req.ctx.body.trade_url)) {
      return next();
    }
    return res.json(new ApiResponse({ error: new Error('"trade_url" field is missing') }).get());
  };
}

export function checkTradeComment() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!_.isNil(req.ctx.body.comment)) {
      return next();
    }
    return res.json(new ApiResponse({ error: new Error('"comment" field is missing') }).get());
  };
}

export function checkTradeItems() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (_.isNil(req.ctx.body.items)) {
      return res.json(new ApiResponse({ error: new Error('"items" field is missing') }).get());
    }
    if (!_.isArray(req.ctx.body.items)) {
      return res.json(new ApiResponse({ error: new Error('"items" should be an array') }).get());
    }
    if (_.isEmpty(req.ctx.body.items)) {
      return res.json(new ApiResponse({ error: new Error('"items" should not be empty') }).get());
    }
    return next();
  };
}

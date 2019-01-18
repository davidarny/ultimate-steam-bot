import SteamBot from '@entities/steam-bot';
import express from 'express';
import _ from 'lodash';

export function initContext() {
  return (req: express.Request, _res: unknown, next: express.NextFunction) => {
    req.ctx = {
      // Get bot instance from singleton `SteamBot`
      bot: SteamBot.getInstance(),
      // Deep copy `req.body`
      body: !_.isNil(req.body) ? JSON.parse(JSON.stringify(req.body)) : {},
      // Deep copy `req.params`
      params: !_.isNil(req.params) ? JSON.parse(JSON.stringify(req.params)) : {},
      // Deep copy `req.query`
      query: !_.isNil(req.query) ? JSON.parse(JSON.stringify(req.query)) : {},
    };
    return next();
  };
}

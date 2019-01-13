import config from '@config';
import { ApiResponse } from '@entities/response';
import express from 'express';

export function checkBotId() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (config.bot.botId === req.ctx.body.bot_id) {
      return next();
    }
    return res.json(new ApiResponse({ error: new Error('Bot unavailable') }).get());
  };
}

export function checkGameId(ids: number[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (ids.some(id => id === req.ctx.body.gameID)) {
      return next();
    }
    return res.json(new ApiResponse({ error: new Error('Incorrect gameID') }).get());
  };
}

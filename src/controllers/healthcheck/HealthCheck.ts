import { EBotStatuses } from '@entities/steam-bot';
import express from 'express';

export function get() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const statuses = req.ctx.bot.statuses;
    res.json({
      WEB_SESSION: statuses[EBotStatuses.WEB_SESSION],
      BLOCKED: statuses[EBotStatuses.BLOCKED],
      DISCONNECTED: statuses[EBotStatuses.DISCONNECTED],
      GC_CONNECTED: statuses[EBotStatuses.GC_CONNECTED],
      SESSION_EXPIRED: statuses[EBotStatuses.SESSION_EXPIRED],
    });
    return next();
  };
}

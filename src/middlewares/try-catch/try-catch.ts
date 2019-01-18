import { ApiResponse } from '@entities/response';
import express from 'express';

export function withTryCatch(func: (...args: any[]) => any) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      await func(req, res, next);
    } catch (error) {
      res.json(new ApiResponse({ error }).get());
      return next();
    }
  };
}

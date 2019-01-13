import { ApiResponse } from '@entities/response';
import express from 'express';

export function sanitizeError() {
  return (error: Error, _req: unknown, res: express.Response, next: express.NextFunction) => {
    res.status(500);
    res.send(new ApiResponse({ error }).get());
    return next();
  };
}

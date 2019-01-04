import express from 'express';

export function get() {
  return (_, res: express.Response, next: express.NextFunction) => {
    res.send('I am alive!');
    return next();
  };
}

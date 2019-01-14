// tslint:disable:interface-name
import SteamBot from '@entities/steam-bot';
import express from 'express';

declare global {
  namespace Express {
    interface Request {
      ctx: {
        bot: SteamBot;
        body: {
          bot_id: number;
          gameID: number;
          steam_id: string;
        };
        params: {
          object: string;
          method: string;
        };
        query: {};
      };
    }
  }
}

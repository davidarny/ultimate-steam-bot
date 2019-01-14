import controllers from '@controllers';
import * as middlewares from '@middlewares';
import express from 'express';

const router = express.Router();
const games = [730, 570, 578080]; // CS:GO, DOTA 2, PUBG

export default () => {
  router.all('/inventory/my', middlewares.checkGameId(games), controllers.bot.my());

  router.all(
    '/inventory/their',
    middlewares.checkGameId(games),
    middlewares.checkSteamId(),
    controllers.bot.their(),
  );

  return router;
};

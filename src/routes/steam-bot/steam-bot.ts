import controllers from '@controllers';
import * as middlewares from '@middlewares';
import express from 'express';

const router = express.Router();
const games = [730, 570, 578080]; // CS:GO, DOTA 2, PUBG

export default () => {
  router.all(
    '/inventory/my',
    middlewares.checkGameId(games),
    middlewares.withTryCatch(controllers.bot.my()),
  );

  router.all(
    '/inventory/their',
    middlewares.checkGameId(games),
    middlewares.checkSteamId(),
    middlewares.withTryCatch(controllers.bot.their()),
  );

  router.all(
    '/inventory/check',
    middlewares.checkBotId(),
    middlewares.checkSteamId(),
    middlewares.checkGameId(games),
    middlewares.checkAssetsIds(),
    middlewares.withTryCatch(controllers.bot.check()),
  );

  return router;
};

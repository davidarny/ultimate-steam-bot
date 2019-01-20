import controllers from '@controllers';
import * as middlewares from '@middlewares';
import express from 'express';

const router = express.Router();
const games = [730, 570, 578080]; // CS:GO, DOTA 2, PUBG

export default () => {
  router.all(
    '/inventory/my',
    middlewares.checkBotId(),
    middlewares.checkGameId(games),
    middlewares.withTryCatch(controllers.bot.my()),
  );

  router.all(
    '/inventory/their',
    middlewares.checkBotId(),
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

  router.all(
    '/inventory/getcsgoitemsinfo',
    middlewares.checkBotId(),
    middlewares.checkItemsLinks(),
    middlewares.withTryCatch(controllers.bot.getItemsInfo()),
  );

  router.all(
    '/tradeoffer/sendgive',
    middlewares.checkBotId(),
    middlewares.checkTradeUrl(),
    middlewares.checkTradeItems(),
    middlewares.checkTradeComment(),
    middlewares.withTryCatch(controllers.bot.sendGiveOffer()),
  );

  return router;
};

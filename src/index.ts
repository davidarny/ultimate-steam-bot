require('module-alias/register');
import controllers from '@controllers';
import ENodeEnv from '@entities/node-env';
import SteamBot, { EBotEvents } from '@entities/steam-bot';
import logger from '@utils/logger';
import * as BotSanitizer from '@utils/sanitizer/bot';
import * as ServerSanitizer from '@utils/sanitizer/server';
import { ENVIRONMENT } from '@utils/secrets';
import _ from 'lodash';
import app from './app';

const server = app.listen(app.get('port'), () =>
  logger.info(
    ServerSanitizer.message(
      `App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`,
    ),
  ),
);

if (ENVIRONMENT !== ENodeEnv.TEST) {
  const bot = SteamBot.getInstance();
  // Log `error` events
  bot.on(EBotEvents.ERROR, (...rest) => logger.error(BotSanitizer.message(), ...rest));
  // Log `login` event
  bot.on(EBotEvents.LOGIN, (...rest) =>
    logger.info(BotSanitizer.message('Successfully logged in'), ...rest),
  );
  // Log `SteamRequestLimit` error
  bot.on(EBotEvents.LIMIT, (...rest) =>
    logger.info(BotSanitizer.message('Steam request rate limit'), ...rest),
  );
  // Log `cookies` has been set
  bot.on(EBotEvents.SET_COOKIES, (...rest) =>
    logger.info(BotSanitizer.message('Successfully set cookies'), ...rest),
  );
  // Log `SteamGuard` events
  bot.on(EBotEvents.STEAM_GUARD, (...rest) =>
    logger.info(BotSanitizer.message('Got SteamGuard event'), ...rest),
  );
  // Log Game Coordinator logged in event
  bot.on(EBotEvents.GC_CONNECTED, (...rest) =>
    logger.info(BotSanitizer.message('Connected to Game Coordinator'), ...rest),
  );
  // Log `disconnected` events
  bot.on(EBotEvents.DISCONNECT, (...rest) =>
    logger.info(BotSanitizer.message('Disconnected'), ...rest),
  );
  // Log healthcheck statuses
  bot.on(EBotEvents.HEALTHCHECK, statuses =>
    logger.info(BotSanitizer.message(), BotSanitizer.status(statuses)),
  );
  // Log confirmations
  bot.on(
    EBotEvents.CONFIRMATIONS,
    confirmations =>
      !_.isEmpty(confirmations) &&
      logger.info(BotSanitizer.message('Accepted confirmations'), confirmations),
  );
  // Log bot NEW_OFFER event
  bot.on(EBotEvents.NEW_OFFER, offer => logger.info(BotSanitizer.message('Got new Offer'), offer));
  // Log offer decline
  bot.on(EBotEvents.OFFER_DECLINED, () => logger.info(BotSanitizer.message('Offer declined!')));
  // Log bot specific event SEND_OFFER_STATE
  bot.on(EBotEvents.SEND_OFFER_STATE, controllers.bot.onSendOfferState);
  // Log bot specific event SEND_OFFER_ITEMS
  bot.on(EBotEvents.SEND_OFFER_ITEMS, controllers.bot.onSendOfferItems);
}

export default server;

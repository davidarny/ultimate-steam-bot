require('module-alias/register');
import controllers from '@controllers';
import ENodeEnv from '@entities/node-env';
import SteamBot, { EBotEvents } from '@entities/steam-bot';
import logger from '@utils/logger';
import * as BotSanitizer from '@utils/sanitizer/bot';
import * as ServerSanitizer from '@utils/sanitizer/server';
import { ENVIRONMENT } from '@utils/secrets';
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
  bot.on(EBotEvents.ERROR, error => logger.error(BotSanitizer.message(), error));
  bot.on(EBotEvents.LOGIN, () => logger.info(BotSanitizer.message('Successfully logged in')));
  bot.on(EBotEvents.LIMIT, () => logger.info(BotSanitizer.message('Steam request rate limit')));
  bot.on(EBotEvents.SET_COOKIES, () =>
    logger.info(BotSanitizer.message('Successfully set cookies')),
  );
  bot.on(EBotEvents.STEAM_GUARD, () => logger.info(BotSanitizer.message('Got SteamGuard event')));
  bot.on(EBotEvents.GC_CONNECTED, () =>
    logger.info(BotSanitizer.message('Connected to Game Coordinator')),
  );
  bot.on(EBotEvents.DISCONNECT, () => logger.info(BotSanitizer.message('Disconnected')));
  bot.on(EBotEvents.HEALTHCHECK, statuses =>
    logger.info(BotSanitizer.message(), BotSanitizer.status(statuses)),
  );
  bot.on(EBotEvents.CONFIRMATIONS, confirmations =>
    logger.info(BotSanitizer.message('Accepted confirmations'), confirmations),
  );
  bot.on(EBotEvents.SEND_OFFER_STATE, controllers.bot.onSendOfferState);
  bot.on(EBotEvents.SEND_OFFER_ITEMS, controllers.bot.onSendOfferItems);
}

export default server;

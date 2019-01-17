import app from '@app';
import SteamBot, { EBotEvents } from '@entities/steam-bot';
import request from 'supertest';

const client = request(app);
const bot = SteamBot.getInstance();
const mocks = {
  [EBotEvents.LOGIN]: getMockPromise(EBotEvents.LOGIN, bot),
  [EBotEvents.SET_COOKIES]: getMockPromise(EBotEvents.SET_COOKIES, bot),
  [EBotEvents.USER]: getMockPromise(EBotEvents.USER, bot),
  [EBotEvents.GC_CONNECTED]: getMockPromise(EBotEvents.GC_CONNECTED, bot),
};
bot.on(EBotEvents.ERROR, console.error.bind(console));

function getMockPromise(event: EBotEvents, steamBot: SteamBot) {
  return new Promise(resolve => steamBot.on(event, resolve));
}

export function getBotMockEvents(): { [K in EBotEvents]?: Promise<{}> } {
  return mocks;
}

export function getBotMock(): SteamBot {
  return bot;
}

export function getClientMock(): request.SuperTest<request.Test> {
  return client;
}

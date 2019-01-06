import SteamBot, { EBotEvents, EBotStatus } from '@entities/bot';

describe('Bot', () => {
  const bot = new SteamBot();

  it('should login', (done: jest.DoneCallback) => {
    bot.on(EBotEvents.LOGIN, () => done());
    bot.on(EBotEvents.ERROR, error => done(error));
  });

  it('should set cookies', (done: jest.DoneCallback) => {
    bot.on(EBotEvents.SET_COOKIES, () => done());
    bot.on(EBotEvents.ERROR, error => done(error));
  });

  it('should get bot status `EBotStatus.WEB_SESSION`', (done: jest.DoneCallback) => {
    bot.on(EBotEvents.HEALTHCHECK, (status: number) => {
      if (status === EBotStatus.WEB_SESSION) {
        return done();
      }
      if (status === EBotStatus.DISCONNECTED) {
        done(new Error('Bot disconnected!'));
      }
    });
  });
});

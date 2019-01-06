import SteamBot from '@entities/bot';

describe('Bot', () => {
  const bot = new SteamBot();

  it('should login', (done: jest.DoneCallback) => {
    bot.on('login', () => done());
    bot.on('error', error => done(error));
  });
});

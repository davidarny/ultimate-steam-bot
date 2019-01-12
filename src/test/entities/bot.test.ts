import SteamBot, { EBotEvents, EBotStatus } from '@entities/bot';
import chai from 'chai';
const expect = chai.expect;

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

  it('should get user event', (done: jest.DoneCallback) => {
    bot.on(EBotEvents.USER, (sid, user) => {
      expect(sid).to.be.an('object');
      expect(user).to.be.an('object');
      done();
    });
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
    bot.on(EBotEvents.ERROR, error => done(error));
  });

  it('should connect to Game Coordinator', (done: jest.DoneCallback) => {
    bot.on(EBotEvents.GC_CONNECTED, () => done());
    bot.on(EBotEvents.ERROR, error => done(error));
  });

  it('should get bot status `EBotStatus.GC_CONNECTED`', (done: jest.DoneCallback) => {
    bot.on(EBotEvents.HEALTHCHECK, (status: number) => {
      if (status === EBotStatus.GC_CONNECTED) {
        return done();
      }
      if (status === EBotStatus.DISCONNECTED) {
        done(new Error('Bot disconnected!'));
      }
    });
    bot.on(EBotEvents.ERROR, error => done(error));
  });
});

import config from '@config';
import { EBotEvents, EBotStatuses } from '@entities/steam-bot';
import * as Mocks from '@mocks';
import chai from 'chai';
import cap from 'chai-as-promised';
import _ from 'lodash';

chai.use(cap);
const expect = chai.expect;
type TSteamBotStatus = { [K in EBotEvents]: string };

describe('Bot', () => {
  const bot = Mocks.getBotMock();
  const mocks = Mocks.getBotMockEvents();

  it('should login', async () => expect(mocks[EBotEvents.LOGIN]).to.be.fulfilled);

  it('should set cookies', async () => expect(mocks[EBotEvents.SET_COOKIES]).to.be.fulfilled);

  it('should get user event', async () => {
    await expect(mocks[EBotEvents.USER]).to.be.fulfilled;
    const personas = await mocks[EBotEvents.USER];
    expect(personas).to.be.an('object');
    const sid = _.first(_.keys(personas));
    expect(sid).to.be.equal(config.bot.steamId!);
    const user = _.get(personas, sid!);
    expect(user).to.have.property('persona_state', 1);
    expect(user).to.have.property('game_played_app_id', config.app.game);
  });

  it('should get bot status `EBotStatus.WEB_SESSION`', (done: MochaDone) => {
    const callback = _.once((statuses: TSteamBotStatus) => {
      if (statuses[EBotStatuses.WEB_SESSION]) {
        return done();
      }
      if (statuses[EBotStatuses.DISCONNECTED]) {
        done(new Error('Bot disconnected!'));
      } else {
        done(new Error('Non of statuses matched'));
      }
    });
    bot.on(EBotEvents.HEALTHCHECK, callback);
    bot.on(EBotEvents.ERROR, (error: Error) => done(error));
  });

  it('should connect to Game Coordinator', async () =>
    expect(mocks[EBotEvents.GC_CONNECTED]).to.be.fulfilled);

  it('should get bot status `EBotStatus.GC_CONNECTED`', (done: MochaDone) => {
    const callback = _.once((statuses: TSteamBotStatus) => {
      if (statuses[EBotStatuses.GC_CONNECTED]) {
        return done();
      }
      if (statuses[EBotStatuses.DISCONNECTED]) {
        done(new Error('Bot disconnected!'));
      } else {
        done(new Error('Non of statuses matched'));
      }
    });
    bot.on(EBotEvents.HEALTHCHECK, callback);
    bot.on(EBotEvents.ERROR, (error: any) => done(error));
  });
});

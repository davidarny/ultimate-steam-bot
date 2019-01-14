import app from '@app';
import config from '@config';
import SteamBot, { EBotEvents } from '@entities/steam-bot';
import chai from 'chai';
import cap from 'chai-as-promised';
import request from 'supertest';

chai.use(cap);
const expect = chai.expect;

describe('GET /inventory', async () => {
  const bot = SteamBot.getInstance();
  const mocks = { [EBotEvents.SET_COOKIES]: getMockPromise(EBotEvents.LOGIN, bot) };
  bot.on(EBotEvents.ERROR, console.error.bind(console));

  it('should get my inventory', async () => {
    await expect(mocks[EBotEvents.SET_COOKIES]).to.be.fulfilled;
    const response = await request(app)
      .post('/inventory/my')
      .send({ gameID: config.app.game })
      .expect(200);
    expect(response.body).to.have.property('success', true);
    expect(response.body)
      .to.have.property('data')
      .to.be.an('array');
    expect(response.body.data).to.be.not.empty;
  });

  it('should get their inventory', async () => {
    await expect(mocks[EBotEvents.SET_COOKIES]).to.be.fulfilled;
    const response = await request(app)
      .post('/inventory/their')
      .send({ gameID: config.app.game, steam_id: config.bot.steamId })
      .expect(200);
    expect(response.body).to.have.property('success', true);
    expect(response.body)
      .to.have.property('data')
      .to.be.an('array');
    expect(response.body.data).to.be.not.empty;
  });
});

function getMockPromise(event: EBotEvents, bot: SteamBot) {
  return new Promise(resolve => bot.on(event, resolve));
}

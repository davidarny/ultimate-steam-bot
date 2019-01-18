import config from '@config';
import State from '@entities/state';
import { EBotEvents } from '@entities/steam-bot';
import * as Mocks from '@mocks';
import chai from 'chai';
import cap from 'chai-as-promised';
import _ from 'lodash';

chai.use(cap);
const expect = chai.expect;

describe('GET /inventory', () => {
  const client = Mocks.getClientMock();
  const mocks = Mocks.getBotMockEvents();
  const state = new State<{ assets: string[] }>({ assets: [] });

  before(async () => expect(mocks[EBotEvents.SET_COOKIES]).to.be.fulfilled);
  beforeEach(async () => Mocks.sleep(1000));

  it('should get my inventory', async () => {
    const response = await client
      .post('/inventory/my')
      .send({ gameID: config.app.game })
      .expect(200);
    expect(response.body).to.have.property('success', true);
    expect(response.body)
      .to.have.property('data')
      .to.be.an('array');
    expect(response.body.data).to.be.not.empty;
    const ids = response.body.data.map(item => _.get(item, 'assetid'));
    _.range(0, _.random(0, ids.length)).forEach(() => state.get('assets').push(_.sample(ids)));
  });

  it('should get their inventory', async () => {
    await expect(mocks[EBotEvents.SET_COOKIES]).to.be.fulfilled;
    const response = await client
      .post('/inventory/their')
      .send({ gameID: config.app.game, steam_id: config.bot.steamId })
      .expect(200);
    expect(response.body).to.have.property('success', true);
    expect(response.body)
      .to.have.property('data')
      .to.be.an('array');
    expect(response.body.data).to.be.not.empty;
  });

  it('should check my inventory', async () => {
    const payload = {
      gameID: config.app.game,
      steam_id: config.bot.steamId,
      bot_id: config.bot.botId,
      asset_ids: state.get('assets'),
    };
    const response = await client
      .post('/inventory/check')
      .send(payload)
      .expect(200);
    expect(response.body).to.have.property('success', true);
    expect(response.body)
      .to.have.property('data')
      .to.have.property('code')
      .to.be.a('number');
  });
});

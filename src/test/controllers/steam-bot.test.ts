import config from '@config';
import { EBotEvents } from '@entities/steam-bot';
import * as Mocks from '@mocks';
import chai from 'chai';
import cap from 'chai-as-promised';

chai.use(cap);
const expect = chai.expect;

describe('GET /inventory', () => {
  const timeout = 2500;
  const client = Mocks.getClientMock();
  const mocks = Mocks.getBotMockEvents();

  beforeEach(function() {
    // sleep 2.5 sec in order not to have steam errors
    this.timeout(timeout);
  });

  it('should get my inventory', async () => {
    await expect(mocks[EBotEvents.SET_COOKIES]).to.be.fulfilled;
    const response = await client
      .post('/inventory/my')
      .send({ gameID: config.app.game })
      .expect(200);
    if (!response.body.success) {
      throw new Error(response.body.error);
    }
    expect(response.body).to.have.property('success', true);
    expect(response.body)
      .to.have.property('data')
      .to.be.an('array');
    expect(response.body.data).to.be.not.empty;
  });

  it('should get their inventory', async () => {
    await expect(mocks[EBotEvents.SET_COOKIES]).to.be.fulfilled;
    const response = await client
      .post('/inventory/their')
      .send({ gameID: config.app.game, steam_id: config.bot.steamId })
      .expect(200);
    if (!response.body.success) {
      throw new Error(response.body.error);
    }
    expect(response.body).to.have.property('success', true);
    expect(response.body)
      .to.have.property('data')
      .to.be.an('array');
    expect(response.body.data).to.be.not.empty;
  });
});

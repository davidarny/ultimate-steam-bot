import { EBotEvents } from '@entities/steam-bot';
import * as Mocks from '@mocks';
import chai from 'chai';

const expect = chai.expect;

describe('Healthcheck API', async () => {
  const client = Mocks.getClientMock();
  const mocks = Mocks.getBotMockEvents();

  it('should return 200 OK', async () => {
    await expect(mocks[EBotEvents.SET_COOKIES]).to.be.fulfilled;
    const response = await client.get('/').expect(200);
    expect(response.body).to.have.property('success', true);
    expect(response.body.data).to.have.property('WEB_SESSION');
    expect(response.body.data).to.have.property('BLOCKED');
    expect(response.body.data).to.have.property('DISCONNECTED');
    expect(response.body.data).to.have.property('GC_CONNECTED');
    expect(response.body.data).to.have.property('SESSION_EXPIRED');
  });
});

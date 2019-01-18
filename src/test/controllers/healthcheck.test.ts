import { EBotEvents } from '@entities/steam-bot';
import * as Mocks from '@mocks';
import chai from 'chai';

const expect = chai.expect;

describe('GET /healthcheck', async () => {
  const client = Mocks.getClientMock();
  const mocks = Mocks.getBotMockEvents();

  it('should return 200 OK', async () => {
    await expect(mocks[EBotEvents.SET_COOKIES]).to.be.fulfilled;
    const response = await client.get('/healthcheck').expect(200);
    expect(response.text).to.equal('I am alive!');
  });
});

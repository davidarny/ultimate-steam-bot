import app from '@app';
import chai from 'chai';
import request from 'supertest';

const expect = chai.expect;

describe('GET /healthcheck', async () => {
  let client: request.SuperTest<request.Test>;

  before(() => (client = request(app)));

  it('should return 200 OK', async () => {
    const response = await client.get('/healthcheck').expect(200);
    expect(response.text).to.equal('I am alive!');
  });
});

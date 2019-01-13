import app from '@app';
import chai from 'chai';
import request from 'supertest';

const expect = chai.expect;

describe('GET /healthcheck', () => {
  it('should return 200 OK', async () => {
    const response = await request(app)
      .get('/healthcheck')
      .expect(200);
    expect(response.text).to.equal('I am alive!');
  });
});

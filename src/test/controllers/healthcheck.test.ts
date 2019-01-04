import app from '@app';
import chai from 'chai';
import request from 'supertest';
const expect = chai.expect;

describe('GET /healthcheck', () => {
  it('should return 200 OK', () => {
    return request(app)
      .get('/healthcheck')
      .expect(200)
      .then(response => expect(response.text).to.equal('I am alive!'));
  });
});

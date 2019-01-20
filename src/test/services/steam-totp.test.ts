import config from '@config';
import * as Mocks from '@mocks';
import chai from 'chai';

const expect = chai.expect;

describe('Steam TOTP service', () => {
  const totp = Mocks.getSteamTotpMock();

  it('should get auth code', () => {
    const code = totp.getAuthCode(config.bot.sharedSecret!);
    expect(code)
      .to.be.a('string')
      .and.to.be.lengthOf(5);
  });
});

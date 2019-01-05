import config from '@config';
import SteamTotp from '@services/steam-totp';
import chai from 'chai';
const expect = chai.expect;

describe('SteamTotp', () => {
  const totp = new SteamTotp();

  it('should get auth code', () => {
    const code = totp.getAuthCode(config.bot.sharedSecret!);
    expect(code)
      .to.be.a('string')
      .and.to.be.lengthOf(5);
  });
});

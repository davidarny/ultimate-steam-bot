// tslint:disable:no-unused-expression
import config from '@config';
import chai from 'chai';
const expect = chai.expect;

describe('App Config', () => {
  it('should have no undefined fields in config', () => {
    for (const key of Object.keys(config.app)) {
      const value = config.app[key];
      expect(value).to.not.equal(undefined);
      if (
        key === 'acceptOfferMaxAttempts' ||
        key === 'game' ||
        key === 'pollInterval' ||
        key === 'confirmationPollInterval' ||
        key === 'acceptableItemCost' ||
        key === 'acceptableAmountCost' ||
        key === 'createCancelTime' ||
        key === 'joinCancelTime' ||
        key === 'prizeCancelTime' ||
        key === 'port'
      ) {
        expect(value).to.be.a('number');
      } else if (key === 'noType' || key === 'trustTradeList') {
        expect(value).to.be.an('array');
      } else {
        expect(value).to.be.a('string');
      }
    }
    for (const key of Object.keys(config.bot)) {
      const value = config.bot[key];
      expect(value).to.not.equal(undefined);
      if (key === 'botId') {
        expect(value).to.be.a('number');
      }
    }
  });
});

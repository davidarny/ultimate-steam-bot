import TradeOfferManager from 'steam-tradeoffer-manager';
import { $Values } from 'utility-types';
import { ISteamPartner } from './ISteamPartner';

export interface ITradeOffer {
  readonly id: string;
  readonly partner: ISteamPartner;
  readonly message: string;
  readonly state: $Values<typeof TradeOfferManager['ETradeState']>;

  decline(callback: (error: Error | null) => void): void;

  getExchangeDetails(
    callback: (
      error: Error | null,
      status: $Values<typeof TradeOfferManager['ETradeState']>,
      tradeInitTime: Date,
      receivedItems: object[],
      sentItems: object[],
    ) => void,
  ): void;

  data(key: string | 'data'): unknown;
}

import TradeOfferManager from 'steam-tradeoffer-manager';
import { $Values } from 'utility-types';
import { ISteamPartner } from './ISteamPartner';

interface IUserData {
  personName: string;
  context: object;
  escrowDays: number | null;
  probation: boolean;
  avatarIcon: string;
  avatarMedium: string;
  avatarFull: string;
}

export interface ITradeOffer {
  readonly id: string;
  readonly partner: ISteamPartner;
  readonly message: string;
  readonly state: $Values<typeof TradeOfferManager['ETradeOfferState']>;

  decline(callback: (error: Error | null) => void): void;

  getExchangeDetails(
    callback: (
      error: Error | null,
      status: $Values<typeof TradeOfferManager['ETradeOfferState']>,
      tradeInitTime: Date,
      receivedItems: object[],
      sentItems: object[],
    ) => void,
  ): void;

  data(key: string | 'data'): unknown;

  data(key: string, value: any): void;

  getUserDetails(callback: (error: Error | null, me: IUserData, them: IUserData) => void): void;

  addMyItems(items: object[]): void;

  setMessage(message: string): void;

  send(callback: (error: Error | null, status: 'pending' | 'sent') => void): void;
}

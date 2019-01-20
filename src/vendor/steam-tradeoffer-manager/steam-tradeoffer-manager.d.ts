import { ITradeOffer } from '@entities/steam-tradeoffer-manager';

declare module 'steam-tradeoffer-manager' {
  export default class TradeOfferManager {
    public static readonly ETradeOfferState: ITradeStateKeys;
    /**
     * A read-only property containing your account's API key once
     * the callback of `setCookies` fires for the first time.
     *
     * @type {string}
     * @memberof TradeOfferManager
     */
    public readonly apiKey: string;

    constructor(options: ITradeOfferManagerOptions);

    public setCookies(cookies: object[], callback: (error: Error | null) => void): void;

    public doPoll(): void;

    public on(event: string, callback: (...args: any[]) => void): void;

    public on(event: 'newOffer', callback: (offer: ITradeOffer) => void): void;

    public on(
      event: 'sentOfferChanged',
      callback: (offer: ITradeOffer, oldState: ETradeState) => void,
    ): void;

    public createOffer(partner: string): ITradeOffer;
  }
}

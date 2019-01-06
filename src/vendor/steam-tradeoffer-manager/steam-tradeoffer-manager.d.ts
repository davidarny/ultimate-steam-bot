declare module 'steam-tradeoffer-manager' {
  export default class TradeOfferManager {
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
  }
}

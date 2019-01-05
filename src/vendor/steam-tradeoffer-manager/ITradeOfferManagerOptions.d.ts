// tslint:disable:max-line-length
declare module 'steam-tradeoffer-manager' {
  // https://github.com/DoctorMcKay/node-steam-tradeoffer-manager/wiki/TradeOfferManager#options
  export interface ITradeOfferManagerOptions {
    steam?: any;
    /**
     * Optional. A `node-steamcommunity` instance of v3.19.1 or later to use.
     * If not provided, one will be created internally automatically.
     *
     * @type {any}
     * @memberof ITradeOfferManagerOptions
     */
    community?: any;
    /**
     * Optional. Your domain name, if you have one.
     * Used to register a Steam Web API key. Defaults to `localhost`.
     *
     * @default "localhost"
     * @type {string}
     * @memberof ITradeOfferManagerOptions
     */
    domain?: string;
    /**
     * Optional. Specify a language code if you want item descriptions.
     * Must be a 2-character language code like `en` or `es`.
     *
     * @type {string}
     * @memberof ITradeOfferManagerOptions
     */
    language?: string;
    /**
     * Optional. The time, in milliseconds, between polls.
     * If `-1`, timed polling is disabled.
     * Minimum `1000`, default `30000` (30 seconds).
     *
     * @default 30000
     * @type {number}
     * @memberof ITradeOfferManagerOptions
     */
    pollInterval?: number;
    /**
     * Optional. The time, in milliseconds, that a sent offer can remain Active until it's
     * automatically canceled by the manager.
     * This feature is disabled if omitted.
     * Note that this check is performed on polling, so it will only work as
     * expected if timed polling is enabled.
     * Also note that because polling is on a timer, offers will be canceled between cancelTime
     * and `cancelTime + pollInterval` milliseconds after being created, assuming Steam is up.
     *
     * @type {number}
     * @memberof ITradeOfferManagerOptions
     */
    cancelTime?: number;
    /**
     * Optional. The time, in milliseconds, that a sent offer can remain CreatedNeedsConfirmation
     * until it's automatically canceled by the manager.
     * This feature is disabled if omitted. All documentation for cancelTime applies.
     *
     * @type {number}
     * @memberof ITradeOfferManagerOptions
     */
    pendingCancelTime?: number;
    /**
     * Optional. Once we have this many outgoing Active offers,
     * the oldest will be automatically canceled.
     *
     * @type {number}
     * @memberof ITradeOfferManagerOptions
     */
    cancelOfferCount?: number;
    /**
     * Optional. If you're using `cancelOfferCount`, then offers must be at least this many
     * milliseconds old in order to qualify for automatic cancellation.
     *
     * @type {number}
     * @memberof ITradeOfferManagerOptions
     */
    cancelOfferCountMinAge?: number;
    /**
     * Optional. If this is `true` and you specified a `language`,
     * then descriptions which are obtained from the WebAPI
     * are stored in the `global` object instead of in a property of `TradeOfferManager`.
     * As a result, all `TradeOfferManager` objects running within the
     * application will share the same description cache (can reduce memory usage).
     *
     * @default false
     * @type {boolean}
     * @memberof ITradeOfferManagerOptions
     */
    globalAssetCache?: boolean;
    /**
     * Optional. If passed, this will be assigned to `pollData`
     *
     * @type {object}
     * @memberof ITradeOfferManagerOptions
     */
    pollData?: object;
    /**
     * Optional. Controls where the asset cache and poll data (if `savePollData` is enabled) are saved.
     *
     * Defaults to a platform-specific directory in the same form as node-steam-user.
     * You can set this to `null` to disable all data persistence to disk.
     *
     * @type {string}
     * @memberof ITradeOfferManagerOptions
     */
    dataDirectory?: string;
    /**
     * Optional. Set this to `true` if you want data that's persisted to `dataDirectory` to first be gzipped
     * (default off, and probably doesn't need to be on as the files are typically very small and gzip won't do much)
     *
     * @type {boolean}
     * @memberof ITradeOfferManagerOptions
     */
    gzipData?: boolean;
    /**
     * Optional. Set this to `true` if you want the module's poll data to be saved to disk automatically
     * (requires `dataDirectory` to not be null) and retrieved on startup.
     *
     * @type {boolean}
     * @memberof ITradeOfferManagerOptions
     */
    savePollData?: boolean;
  }
}

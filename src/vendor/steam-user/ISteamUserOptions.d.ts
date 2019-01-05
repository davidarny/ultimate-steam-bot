// tslint:disable:max-line-length
declare module 'steam-user' {
  // https://github.com/DoctorMcKay/node-steam-user#options
  export interface ISteamUserOptions {
    /**
     * Controls where the Steam server list and sentry files are written.
     * If `null`, no data will be automatically stored.
     *
     * Defaults to a platform-specific user data directory.
     *
     * * On OpenShift, this is `$OPENSHIFT_DATA_DIR/node-steamuser`
     * * On Windows, this is `%localappdata%\doctormckay\node-steamuser`
     * * On Mac, this is `~/Library/Application Support/node-steamuser`
     * * On Linux, this is `$XDG_DATA_HOME/node-steamuser`, or `~/.local/share/node-steamuser` if `$XDG_DATA_HOME` isn't defined or is empty
     *
     * @type {string}
     * @memberof ISteamUserOptions
     */
    dataDirectory?: string;
    /**
     * A boolean which controls whether or not `SteamUser` will automatically
     * reconnect to Steam if disconnected due to Steam going down.
     *
     * @default true
     * @type {boolean}
     * @memberof ISteamUserOptions
     */
    autoRelogin?: boolean;
    /**
     * A boolean which controls whether or not `SteamUser` will use a single sentry file for all accounts.
     * If off, a file named `sentry.accountname.bin` will be saved for each account.
     * If on, a file named `sentry.bin` will be used for all accounts.
     *
     * @default false
     * @type {boolean}
     * @memberof ISteamUserOptions
     */
    singleSentryfile?: boolean;
    /**
     * A boolean which controls whether or not `SteamUser` will
     * automatically prompt for Steam Guard codes when necessary from stdin.
     *
     * @default true
     * @type {boolean}
     * @memberof ISteamUserOptions
     */
    promptSteamGuardCode?: boolean;
    /**
     * What kind of machine ID will SteamUser send to Steam when logging on?
     * Should be a value from `EMachineIDType`
     *
     * @default EMachineIDType.AccountNameGenerated
     * @type {EMachineIDType}
     * @memberof ISteamUserOptions
     */
    machineIdType?: EMachineIDType;
    /**
     * If you're using `machineIdType` `AccountGenerated`, this is the format it uses.
     * This is an array of three strings, each of which will be hashed with SHA1 before being sent to Steam.
     * `{account_name}` will be replaced with the current account name.
     *
     * @default ["SteamUser Hash BB3 {account_name}", "SteamUser Hash FF2 {account_name}", "SteamUser Hash 3B3 {account_name}"]
     * @type {string[]}
     * @memberof ISteamUserOptions
     */
    machineIdFormat?: string[];
    /**
     * If enabled, then `node-steam-user` will internally cache data about all apps and packages that it knows about.
     * Currently, `node-steam-user` "knows about" an app/package if:
     * * Packages
     *    * You own it
     *    * You request info about it via `getProductInfo`
     * * Apps
     *    * It's in a known package
     *    * You request info about it via `getProductInfo`
     *    * A friend who is online plays the app
     *    * You request info about an online user who is playing it via `getPersonas`
     * This option is required in order to use several methods and events. This works when logging in anonymously.
     *
     * @default false
     * @type {boolean}
     * @memberof ISteamUserOptions
     */
    enablePicsCache?: boolean;
    /**
     * If enabled, `enablePicsCache` is enabled, and `changelistUpdateInterva`l is nonzero,
     * then apps and packages which get updated while your bot is running will also be added to the cache.
     * Default behavior is to only cache apps and packages that are "known" via the above criteria.
     *
     * @default false
     * @type {boolean}
     * @memberof ISteamUserOptions
     */
    picsCacheAll?: boolean;
    /**
     * If `enablePicsCache` is enabled, then `node-steam-user` will automatically request
     * app/package changes (via `getProductChanges`) for known apps and packages, and update the internal cache when they update.
     * Set to 0 to disable.
     *
     * @default 60000
     * @type {number}
     * @memberof ISteamUserOptions
     */
    changelistUpdateInterval?: number;
    /**
     * Set this to an object where keys are header names and values are header values,
     * and those headers will be included with all HTTP requests node-steam-user makes to the Steam WebAPI.
     *
     * @default {}
     * @type {object}
     * @memberof ISteamUserOptions
     */
    additionalHeaders?: object;
  }
}

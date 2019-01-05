// tslint:disable:max-line-length
declare module 'steam-user' {
  interface ILogOnParams {
    /**
     * If logging into a user account, the account's name
     *
     * @type {string}
     * @memberof ILogOnParams
     */
    accountName: string;
    /**
     * If logging into an account without a login key, the account's password
     *
     * @type {string}
     * @memberof ILogOnParams
     */
    password: string;
    /**
     * If you have a Steam Guard email code, you can provide it here.
     * You might not need to, see the `steamGuard` event.
     *
     * @type {string}
     * @memberof ILogOnParams
     */
    authCode?: string;
    /**
     * If you have a Steam Guard mobile two-factor authentication code, you can provide it here.
     * You might not need to, see the `steamGuard` event.
     *
     * @type {string}
     * @memberof ILogOnParams
     */
    twoFactorCode?: string;
    /**
     * If logging into an account with a login key, this is the account's login key
     *
     * @type {string}
     * @memberof ILogOnParams
     */
    loginKey?: string;
    /**
     * `true` if you want to get a login key which can be used in lieu of a password for subsequent logins.
     * `false` or omitted otherwise.
     *
     * @type {boolean}
     * @memberof ILogOnParams
     */
    rememberPassword?: boolean;
    /**
     * A number to identify this login. The official Steam client
     * derives this from your machine's private IP (it's the `obfustucated_private_ip` field in `CMsgClientLogOn`).
     * If you try to logon twice to the same account from the same public
     * IP with the same `logonID`, the first session will be kicked with reason `SteamUser.EResult.LogonSessionReplaced`.
     *
     * @default 0
     * @type {string}
     * @memberof ILogOnParams
     */
    logonID?: string;
    /**
     * A string containing the name of this machine that you want to report to Steam.
     * This will be displayed on steamcommunity.com when you view your games list (when logged in).
     *
     * @type {string}
     * @memberof ILogOnParams
     */
    machineName?: string;
    /**
     * A number to identify your client OS. Auto-detected if you don't provide one
     *
     * @type {number}
     * @memberof ILogOnParams
     */
    clientOS?: number;
    /**
     * If you're providing an `authCode` but you don't want Steam to remember this sentryfile, pass `true` here.
     *
     * @type {boolean}
     * @memberof ILogOnParams
     */
    dontRememberMachine?: boolean;
  }
}

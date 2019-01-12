declare module 'globaloffensive' {
  import SteamUser from 'steam-user';

  export default class GlobalOffensive {
    constructor(steamUser: SteamUser);

    public on(event: string, callback: (...args: any[]) => void): void;
  }
}

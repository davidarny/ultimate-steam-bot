declare module 'steamcommunity' {
  export default class SteamCommunity {
    public setCookies(cookies: object[]): void;

    public acceptAllConfirmations(
      time: number,
      confKey: string,
      allowKey: string,
      callback: (error: Error | null, confs: object[]) => void,
    ): void;
  }
}

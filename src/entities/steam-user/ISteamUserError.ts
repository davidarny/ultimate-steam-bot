import SteamUser from 'steam-user';
import { $Values } from 'utility-types';

export interface ISteamUserError extends Error {
  readonly eresult: $Values<typeof SteamUser['EErrorResult']>;
}

import SteamBot, { EBotStatuses } from '@entities/steam-bot';
import _ from 'lodash';

export function status(statuses: SteamBot['statuses']) {
  return `
    WEB_SESSION:\t\t${statuses[EBotStatuses.WEB_SESSION]}
    BLOCKED:\t\t${statuses[EBotStatuses.BLOCKED]}
    DISCONNECTED:\t\t${statuses[EBotStatuses.DISCONNECTED]}
    GC_CONNECTED:\t\t${statuses[EBotStatuses.GC_CONNECTED]}
    SESSION_EXPIRED:\t${statuses[EBotStatuses.SESSION_EXPIRED]}
  `;
}

export function message(str?: string): string {
  return `[SteamBot]: ${_.isNil(str) ? '' : str}`;
}

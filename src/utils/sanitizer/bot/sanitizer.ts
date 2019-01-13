import SteamBot, { EBotStatuses, IBotStatusesKeys } from '@entities/steam-bot';
import _ from 'lodash';

type TSanitizedStatuses = { [K in keyof IBotStatusesKeys]: boolean };

export function status(statuses: SteamBot['statuses']) {
  const nextStatuses: Partial<TSanitizedStatuses> = {};
  _.keys(statuses).forEach(key => {
    if (key === EBotStatuses.WEB_SESSION) {
      nextStatuses.WEB_SESSION = statuses[EBotStatuses.WEB_SESSION];
    } else if (key === EBotStatuses.BLOCKED) {
      nextStatuses.BLOCKED = statuses[EBotStatuses.BLOCKED];
    } else if (key === EBotStatuses.DISCONNECTED) {
      nextStatuses.DISCONNECTED = statuses[EBotStatuses.DISCONNECTED];
    } else if (key === EBotStatuses.GC_CONNECTED) {
      nextStatuses.GC_CONNECTED = statuses[EBotStatuses.GC_CONNECTED];
    } else if (key === EBotStatuses.SESSION_EXPIRED) {
      nextStatuses.SESSION_EXPIRED = statuses[EBotStatuses.SESSION_EXPIRED];
    }
  });
  return nextStatuses;
}

export function message(str?: string): string {
  return `[SteamBot]: ${_.isNil(str) ? '' : str}`;
}

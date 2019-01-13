export interface IBotStatusesKeys {
  DISCONNECTED: boolean;
  SESSION_EXPIRED: boolean;
  WEB_SESSION: boolean;
  GC_CONNECTED: boolean;
  BLOCKED: boolean;
}

export enum EBotStatuses {
  DISCONNECTED = 'disconnected',
  SESSION_EXPIRED = 'sessionExpired',
  WEB_SESSION = 'webSession',
  GC_CONNECTED = 'gcConnected',
  BLOCKED = 'blocked',
}

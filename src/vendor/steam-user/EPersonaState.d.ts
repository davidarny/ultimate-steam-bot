declare module 'steam-user' {
  interface IPersonaStateKeys {
    readonly Offline: 0;
    readonly Online: 1;
    readonly Busy: 2;
    readonly Away: 3;
    readonly Snooze: 4;
    readonly LookingToTrade: 5;
    readonly LookingToPlay: 6;
    readonly Invisible: 7;
    readonly Max: 8;
  }

  enum EPersonaState {
    Offline = 0,
    Online = 1,
    Busy = 2,
    Away = 3,
    Snooze = 4,
    LookingToTrade = 5,
    LookingToPlay = 6,
    Invisible = 7,
    Max = 8,
  }
}

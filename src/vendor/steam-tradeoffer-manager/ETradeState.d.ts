// tslint:disable:max-line-length
declare module 'steam-tradeoffer-manager' {
  interface ITradeStateKeys {
    readonly Invalid: 1;
    readonly Active: 2; // This trade offer has been sent, neither party has acted on it yet.
    readonly Accepted: 3; // The trade offer was accepted by the recipient and items were exchanged.
    readonly Countered: 4; // The recipient made a counter offer
    readonly Expired: 5; // The trade offer was not accepted before the expiration date
    readonly Canceled: 6; // The sender cancelled the offer
    readonly Declined: 7; // The recipient declined the offer
    readonly InvalidItems: 8; // Some of the items in the offer are no longer available (indicated by the missing flag in the output)
    readonly CreatedNeedsConfirmation: 9; // The offer hasn't been sent yet and is awaiting further confirmation
    readonly CanceledBySecondFactor: 10; // Either party canceled the offer via email/mobile confirmation
    readonly InEscrow: 11; // The trade has been placed on hold
  }

  enum ETradeState {
    Invalid = 1,
    Active = 2, // This trade offer has been sent, neither party has acted on it yet.
    Accepted = 3, // The trade offer was accepted by the recipient and items were exchanged.
    Countered = 4, // The recipient made a counter offer
    Expired = 5, // The trade offer was not accepted before the expiration date
    Canceled = 6, // The sender cancelled the offer
    Declined = 7, // The recipient declined the offer
    InvalidItems = 8, // Some of the items in the offer are no longer available (indicated by the missing flag in the output)
    CreatedNeedsConfirmation = 9, // The offer hasn't been sent yet and is awaiting further confirmation
    CanceledBySecondFactor = 10, // Either party canceled the offer via email/mobile confirmation
    InEscrow = 11, // The trade has been placed on hold
  }
}

import SteamBot, { EBotEvents, EBotStatuses } from '@entities/steam-bot';
import { ITradeOffer } from '@entities/steam-tradeoffer-manager';
import { autobind } from 'core-decorators';
import TradeOfferManager from 'steam-tradeoffer-manager';

@autobind
export class TradeOfferManagerController {
  constructor(private readonly bot: SteamBot) {}

  public onSentOfferChanged(offer: ITradeOffer, _reason: unknown): void {
    if (offer.state === TradeOfferManager.ETradeOfferState.Accepted) {
      offer.getExchangeDetails((...args) =>
        this.bot.controllers.offer.onGetExchangeDetails(offer, ...args),
      );
    }
    this.bot.emit(
      EBotEvents.SEND_OFFER_STATE,
      offer.id,
      offer.partner.getSteamID64(),
      offer.state,
      offer.data('data'),
    );
  }

  public onNewOffer(offer: ITradeOffer): void {
    this.bot.emit(EBotEvents.NEW_OFFER, offer);
    offer.decline(this.bot.controllers.offer.onDecline);
  }

  public onSetCookies(error: Error | null): void {
    if (error) {
      this.bot.emit(EBotEvents.ERROR, new Error("TradeOfferManager can't set cookies!"), error);
      return this.bot.manager.doPoll();
    }
    this.bot.emit(EBotEvents.SET_COOKIES);
    this.bot.statuses[EBotStatuses.WEB_SESSION] = true;
  }
}

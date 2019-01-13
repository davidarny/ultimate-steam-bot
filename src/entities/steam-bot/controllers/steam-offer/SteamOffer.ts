import config from '@config';
import SteamBot, { EBotEvents } from '@entities/steam-bot';
import { ITradeOffer } from '@entities/steam-tradeoffer-manager';
import { autobind } from 'core-decorators';
import _ from 'lodash';

@autobind
export class SteamOfferController {
  constructor(private readonly bot: SteamBot) {}

  public onGetExchangeDetails(
    offer: ITradeOffer,
    error: Error | null,
    _status: unknown,
    _tradeInitTime: unknown,
    receivedItems: object[],
    _sentItems: unknown,
  ): void {
    if (error) {
      this.bot.emit(
        EBotEvents.ERROR,
        new Error('SteamTradeOfferManager error while getting exchange details'),
        error,
      );
      return;
    }
    const nextReceivedItems = receivedItems
      .map(this.getNextReceivedItem)
      .filter(item => !_.isUndefined(item));
    if (!_.isEmpty(nextReceivedItems)) {
      this.bot.emit(
        EBotEvents.SEND_OFFER_ITEMS,
        offer.id,
        offer.partner.getSteamID64(),
        offer.message,
        offer.data('data'),
        nextReceivedItems,
      );
    }
  }

  public onDecline(error: Error | null): void {
    if (error) {
      this.bot.emit(
        EBotEvents.ERROR,
        new Error('SteamTradeOfferManager error while declining offer'),
        error,
      );
    }
    this.bot.emit(EBotEvents.OFFER_DECLINED);
  }

  private getNextReceivedItem(item: object): object | undefined {
    if (!config.bot.steamId) {
      this.bot.emit(EBotEvents.ERROR, new Error('No `steamId` specified for bot!'));
      return;
    }
    return {
      asset_id: _.get(item, 'new_assetid'),
      app_id: _.get(item, 'appid'),
      classid: _.get(item, 'classid'),
      market_hash_name: _.get(item, 'market_hash_name'),
      link:
        _.get(item, 'actions') &&
        _.first(_.get(item, 'actions')) &&
        _.has(_.first(_.get(item, 'actions')), 'link')
          ? _.first<{ link: string }>(_.get(item, 'actions'))!
              .link.replace('%owner_steamid%', config.bot.steamId)
              .replace('%assetid%', _.get(item, 'assetid'))
          : '',
    };
  }
}

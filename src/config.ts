import * as Secrets from '@utils/secrets';

export default {
  app: {
    port: Secrets.PORT,
    env: Secrets.ENVIRONMENT,
    webhookUrl: Secrets.WEBHOOK_URL,
    sentOfferChangedUrl: Secrets.SENT_OFFER_CHANGED_URL,
    moneyboxTradeUrl: Secrets.MONEYBOX_TRADE_URL,
    acceptOfferMaxAttempts: Secrets.ACCEPT_OFFER_MAX_ATTEMPTS,
    noType: Secrets.NO_TYPE,
    trustTradeList: Secrets.TRUST_TRADE_LIST,
    language: Secrets.STEAM_LANGUAGE,
    game: Secrets.STEAM_GAME,
    pollInterval: Secrets.POLL_INTERVAL,
    confirmationPollInterval: Secrets.CONFIRMATION_INTERVAL,
    acceptableItemCost: Secrets.ACCEPTABLE_ITEM_COST,
    acceptableAmountCost: Secrets.ACCEPTABLE_AMOUNT_COST,
    createCancelTime: Secrets.CREATE_CANCEL_TIME,
    joinCancelTime: Secrets.JOIN_CANCEL_TIME,
    prizeCancelTime: Secrets.PRIZE_CANCEL_TIME,
  },
  bot: {
    botId: Secrets.BOT_ID,
    accountName: Secrets.STEAM_ACCOUNT_NAME,
    password: Secrets.STEAM_PASSWORD,
    sharedSecret: Secrets.STEAM_SHARED_SECRET,
    identitySecret: Secrets.STEAM_IDENTITY_SECRET,
    steamId: Secrets.STEAM_ID,
  },
};

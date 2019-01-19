import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const ENVIRONMENT = process.env.NODE_ENV || 'development';
export const PORT = parseInt(process.env.PORT!, 10) || 3000;
export const BOT_ID = parseInt(process.env.BOT_ID!, 10) || 0;
export const STEAM_ID = process.env.STEAM_ID;
export const STEAM_ACCOUNT_NAME = process.env.STEAM_ACCOUNT_NAME;
export const STEAM_PASSWORD = process.env.STEAM_PASSWORD;
export const STEAM_SHARED_SECRET = process.env.STEAM_SHARED_SECRET;
export const STEAM_IDENTITY_SECRET = process.env.STEAM_IDENTITY_SECRET;
export const WEBHOOK_URL = process.env.WEBHOOK_URL;
export const SENT_OFFER_CHANGED_URL = process.env.SENT_OFFER_CHANGED_URL;
export const MONEYBOX_TRADE_URL = process.env.MONEYBOX_TRADE_URL;
export const ACCEPT_OFFER_MAX_ATTEMPTS = parseInt(process.env.ACCEPT_OFFER_MAX_ATTEMPTS!, 10) || 5;
export const NO_TYPE = JSON.parse(process.env.NO_TYPE!);
export const TRUST_TRADE_LIST = JSON.parse(process.env.TRUST_TRADE_LIST!);
export const STEAM_LANGUAGE = process.env.STEAM_LANGUAGE || 'en';
export const STEAM_GAME = parseInt(process.env.STEAM_GAME!, 10);
export const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL!, 10) || 5;
export const CONFIRMATION_INTERVAL = parseInt(process.env.CONFIRMATION_INTERVAL!, 10) || 10;
export const ACCEPTABLE_ITEM_COST = parseInt(process.env.ACCEPTABLE_ITEM_COST!, 10);
export const ACCEPTABLE_AMOUNT_COST = parseInt(process.env.ACCEPTABLE_AMOUNT_COST!, 10);
export const CREATE_CANCEL_TIME = parseInt(process.env.CREATE_CANCEL_TIME!, 10) || 100;
export const JOIN_CANCEL_TIME = parseInt(process.env.JOIN_CANCEL_TIME!, 10) || 50;
export const PRIZE_CANCEL_TIME = parseInt(process.env.PRIZE_CANCEL_TIME!, 10) || 120;
export const REQUEST_PRICE_URL = process.env.REQUEST_PRICE_URL;

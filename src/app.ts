import config from '@config';
import ENodeEnv from '@entities/node-env';
import routes from '@routes';
import bodyparser from 'body-parser';
import compression from 'compression';
import errorhandler from 'errorhandler';
import express from 'express';
import ebl from 'express-bunyan-logger';
import helmet from 'helmet';
import * as middlewares from './middlewares';

const app = express();
const isTestEnv = config.app.env === ENodeEnv.TEST;
const isDevEnv = config.app.env === ENodeEnv.DEVELOPMENT;

app.set('port', config.app.port);
app.use(compression());
app.use(helmet());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
if (isDevEnv) {
  app.use(errorhandler());
}
if (!isTestEnv) {
  app.use(ebl());
}

app.use(middlewares.initContext(), middlewares.checkBotStatus());

app.use('/healthcheck', routes.healthcheck());
app.use(routes.bot());

app.use(middlewares.sanitizeError());

export default app;

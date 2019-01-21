import config from '@config';
import ENodeEnv from '@entities/node-env';
import routes from '@routes';
import { streams } from '@utils/logger/logger';
import bodyparser from 'body-parser';
import compression from 'compression';
import errorhandler from 'errorhandler';
import express from 'express';
import ebl from 'express-bunyan-logger';
import RateLimit from 'express-rate-limit';
import helmet from 'helmet';
import * as middlewares from './middlewares';

const app = express();
const limiter = new RateLimit({ windowMs: 1000, max: 5 });

app.set('port', config.app.port);
app.use(limiter);
app.use(compression());
app.use(helmet());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
if (config.app.env === ENodeEnv.DEVELOPMENT) {
  app.use(errorhandler());
}
if (config.app.env !== ENodeEnv.TEST) {
  app.use(ebl({ streams, name: 'api' }));
}

app.use(middlewares.initContext(), middlewares.checkBotStatus());
app.use(routes.healthcheck());
app.use(routes.bot());
app.use(middlewares.sanitizeError());

export default app;

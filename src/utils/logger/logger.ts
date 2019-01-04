import ENodeEnv from '@entities/node-env';
import { ENVIRONMENT } from '@utils/secrets';
import bunyan from 'bunyan';

const isTestEnv = ENVIRONMENT === ENodeEnv.TEST;
const streams: bunyan.LoggerOptions['streams'] = [];

if (!isTestEnv) {
  streams.push(
    {
      stream: process.stdout,
      level: 'debug',
    },
    {
      level: 'trace',
      type: 'rotating-file',
      path: './logs/debug.log',
      period: '1d',
      count: Number.MAX_SAFE_INTEGER,
    },
  );
}

export const logger = bunyan.createLogger({ streams, name: 'server' });

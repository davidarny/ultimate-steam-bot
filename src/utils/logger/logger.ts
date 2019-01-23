import ENodeEnv from '@entities/node-env';
import { ENVIRONMENT } from '@utils/secrets';
import bunyan from 'bunyan';

export const streams: bunyan.LoggerOptions['streams'] = [];

if (ENVIRONMENT !== ENodeEnv.TEST) {
  streams.push(
    {
      stream: process.stdout,
      level: 'trace',
    },
    {
      level: 'trace',
      type: 'rotating-file',
      path: './logs/debug.log',
      period: '1d',
      count: 180,
    },
  );
}

export const logger = bunyan.createLogger({ streams, name: 'server' });

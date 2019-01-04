// tslint:disable-next-line:no-var-requires
require('module-alias/register');

import logger from '@utils/logger';
import app from './app';

const server = app.listen(app.get('port'), () =>
  logger.info('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env')),
);

export default server;

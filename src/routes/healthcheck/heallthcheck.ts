import controllers from '@controllers';
import express from 'express';

const router = express.Router();

export default () => {
  router.get('/healthcheck', controllers.healthcheck.get());

  return router;
};

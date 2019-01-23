import controllers from '@controllers';
import express from 'express';

const router = express.Router();

export default () => {
  router.get('/', controllers.healthcheck.get());

  return router;
};

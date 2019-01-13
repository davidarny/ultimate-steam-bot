import controllers from '@controllers';
import express from 'express';

const router = express.Router();

export default () => {
  router.all('/inventory/my', controllers.bot.my());

  return router;
};

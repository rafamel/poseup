#!/usr/bin/env node

import main from './main';
import attach from '~/utils/attach';
import { terminate } from 'exits';
import logger from '~/utils/logger';
import { ensure, Errorish } from 'errorish';

// Attach exits hooks
attach();
// Run main
main(process.argv.slice(2)).catch((err) => {
  err = ensure(err, { Error: Errorish });

  logger.error(err.message);
  if (err.root.stack) logger.trace(err.root.stack);

  return terminate('exit', 1);
});

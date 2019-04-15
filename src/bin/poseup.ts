#!/usr/bin/env node

import main from './main';
import attach, { isAttached } from '~/utils/attach';
import { error } from 'cli-belt';
import { terminate } from 'exits';
import logger from '~/utils/logger';

attach()
  .then(() => main(process.argv.slice(2)))
  .catch((err) => {
    return isAttached()
      ? terminate('rejection', err)
      : error(err, { exit: 1, debug: true, logger });
  });

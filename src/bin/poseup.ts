#!/usr/bin/env node

import main from './main';
import { error } from 'cli-belt';
import { state, terminate } from 'exits';
import logger from '~/utils/logger';

main(process.argv.slice(2)).catch((err) => {
  return state().attached.rejection
    ? terminate('rejection', err)
    : error(err, { exit: 1, debug: true, logger });
});

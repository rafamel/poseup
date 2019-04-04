#!/usr/bin/env node

import program from 'commander';
import args from './cmd-args';
import { purge } from '~/commands';
import { terminate } from 'exits';

const [argv] = args.get();

program
  .name('poseup purge')
  .usage('[options]')
  .description('Purges dangling containers, networks, and volumes system-wide')
  .option('-f, --force', 'Skip confirmation')
  .option('--log <level>', 'Logging level')
  .parse(argv);

purge({
  force: !!program.force,
  log: program.log
})
  // Avoids unhandled rejection warning on console
  .catch((err) => terminate('rejection', err));

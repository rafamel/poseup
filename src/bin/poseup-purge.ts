#!/usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import args from './cmd-args';
import purge from '~/purge';

const [argv] = args.get();

program
  .name('poseup purge')
  .usage('[options]')
  .description('Purges dangling containers, networks, and volumes from system.')
  .option('-f, --force', 'Skips confirmation')
  .option('--log <level>', 'Logging level')
  .parse(argv);

purge({
  force: !!program.force,
  log: program.log
}).catch(async (e) => {
  console.log('\n' + chalk.red('Error: ') + e.message);
  process.exit(1);
});

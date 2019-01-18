#!/usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import args from './cmd-args';
import run from '~/run';
import { RUN_DEFAULT_WAIT_BEFORE_EXEC } from '~/constants';

const [argv] = args.get();

program
  .name('poseup run [tasks]')
  .usage('[options]')
  .description('Runs tasks')
  .option(
    '-w, --wait <seconds>',
    `Wait a number of seconds after starting services before running commands [${RUN_DEFAULT_WAIT_BEFORE_EXEC} by default]`
  )
  .option(
    '-s, --sandbox',
    'Create new containers for all services, remove all on exit'
  )
  .option('-f, --file <path>', 'Path for config file [js,json,yml]')
  .option('-e, --env <env>', 'Environment for config file should be run on')
  .option('-d, --dir <dir>', 'Project directory [cwd by default]')
  .option('--log <level>', 'Logging level')
  .parse(argv);

run({
  tasks: program.args,
  sandbox: !!program.sandbox,
  wait: program.wait,
  file: program.file,
  environment: program.env,
  directory: program.dir,
  log: program.log
}).catch(async (e) => {
  // eslint-disable-next-line no-console
  console.log('\n' + chalk.red('Error: ') + e.message);
  process.exit(1);
});

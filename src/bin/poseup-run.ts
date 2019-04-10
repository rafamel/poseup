#!/usr/bin/env node

import program from 'commander';
import args from './cmd-args';
import { run } from '~/commands';
import { terminate } from 'exits';
import { RUN_WAIT_TIMEOUT } from '~/constants';

const [argv] = args.get();

program
  .name('poseup run')
  .usage('[options] [tasks]')
  .description('Runs tasks')
  .option('-l, --list', 'List tasks')
  .option(
    '-s, --sandbox',
    'Create new containers for all services, remove all on exit'
  )
  .option(
    '-t, --timeout <seconds>',
    `Timeout for waiting time after starting services before running commands [${RUN_WAIT_TIMEOUT} by default]`
  )
  .option(
    '--no-detect',
    'Prevent service initialization auto detection and wait until timeout instead'
  )
  .option('-e, --env <env>', 'Node environment')
  .option('-d, --dir <dir>', 'Project directory')
  .option('-f, --file <path>', 'Path for config file [js,json,yml,yaml]')
  .option('--log <level>', 'Logging level')
  .parse(argv);

run({
  list: !!program.list,
  tasks: program.args,
  sandbox: !!program.sandbox,
  timeout: program.timeout !== undefined ? Number(program.timeout) : undefined,
  detect: program.detect,
  file: program.file,
  environment: program.env,
  directory: program.dir,
  log: program.log
})
  // Avoids unhandled rejection warning on console
  .catch((err) => terminate('rejection', err));

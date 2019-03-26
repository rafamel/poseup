#!/usr/bin/env node

import program from 'commander';
import { compose } from '~/commands';
import args from './cmd-args';
import { terminate } from 'exits';

const [argv, composeArgs] = args.get();

program
  .name('poseup compose')
  .usage('[options] -- [dockerArgs]')
  .description('Runs docker-compose')
  .option('-w, --write <path>', 'Path to write a resulting docker compose file')
  .option('-s, --stop', 'Stop all services on exit')
  .option('-c, --clean', 'Run clean on exit')
  .option('--dry', "Don't run docker compose - write only docker compose file")
  .option('-e, --env <env>', 'Environment for config file should be run on')
  .option('-d, --dir <dir>', 'Project directory [cwd by default]')
  .option('-f, --file <path>', 'Path for config file [js,json,yml]')
  .option('--log <level>', 'Logging level')
  .parse(argv);

compose({
  file: program.file,
  environment: program.env,
  directory: program.dir,
  write: program.write,
  log: program.log,
  args: composeArgs,
  dry: !!program.dry,
  clean: !!program.clean,
  stop: !!program.stop
})
  // Avoids unhandled rejection warning on console
  .catch((err) => terminate('rejection', err));

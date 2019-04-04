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
  .option(
    '-w, --write <path>',
    'Produce a docker compose file and save it to path'
  )
  .option('-s, --stop', 'Stop all services on exit')
  .option('-c, --clean', 'Run clean on exit')
  .option('--dry', 'Dry run -write docker compose file only')
  .option('-e, --env <env>', 'Node environment')
  .option('-d, --dir <dir>', 'Project directory')
  .option('-f, --file <path>', 'Path for config file [js,json,yml,yaml]')
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

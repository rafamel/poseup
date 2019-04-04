#!/usr/bin/env node

import program from 'commander';
import args from './cmd-args';
import { clean } from '~/commands';
import { terminate } from 'exits';
const [argv] = args.get();

program
  .name('poseup clean')
  .usage('[options]')
  .description(
    'Cleans not persisted containers and networks -optionally, also volumes'
  )
  .option(
    '-v, --volumes',
    'Clean volumes not associated with persisted containers'
  )
  .option('-e, --env <env>', 'Node environment')
  .option('-d, --dir <dir>', 'Project directory')
  .option('-f, --file <path>', 'Path for config file [js,json,yml,yaml]')
  .option('--log <level>', 'Logging level')
  .parse(argv);

clean({
  file: program.file,
  environment: program.env,
  directory: program.dir,
  log: program.log,
  volumes: !!program.volumes
})
  // Avoids unhandled rejection warning on console
  .catch((err) => terminate('rejection', err));

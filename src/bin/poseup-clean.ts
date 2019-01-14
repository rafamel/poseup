#!/usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import args from './cmd-args';
import clean from '~/clean';

const [argv] = args.get();

program
  .name('poseup clean')
  .usage('[options]')
  .description(
    'Cleans not persisted containers and networks. Optionally, also volumes.'
  )
  .option(
    '-v, --volumes',
    'Cleans volumes not associated with persisted containers'
  )
  .option('-f, --file <path>', 'Path for config file [js,json,yml]')
  .option('-e, --env <env>', 'Environment for config file should be run on')
  .option('-d, --dir <dir>', 'Project directory [cwd by default]')
  .option('--log <level>', 'Logging level')
  .parse(argv);

clean({
  file: program.file,
  environment: program.env,
  directory: program.dir,
  log: program.log,
  volumes: !!program.volumes
}).catch(async (e) => {
  console.log('\n' + chalk.red('Error: ') + e.message);
  process.exit(1);
});
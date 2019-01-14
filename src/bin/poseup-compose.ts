#!/usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import compose from '~/compose';
import args from './cmd-args';

const [argv, composeArgs] = args.get();

program
  .name('poseup compose')
  .usage('[options] -- [dockerArgs]')
  .description('Runs docker-compose')
  .option('-f, --file <path>', 'Path for config file [js,json,yml]')
  .option('-e, --env <env>', 'Environment for config file should be run on')
  .option('-d, --dir <dir>', 'Project directory [cwd by default]')
  .option('-w, --write <path>', 'Path to write a resulting docker compose file')
  .option('--dry', "Don't run docker compose [only write docker compose file]")
  .option('--log <level>', 'Logging level')
  .parse(argv);

compose({
  file: program.file,
  environment: program.env,
  directory: program.dir,
  write: program.write,
  log: program.log,
  args: composeArgs,
  dry: !!program.dry
}).catch(async (e) => {
  console.log('\n' + chalk.red('Error: ') + e.message);
  process.exit(1);
});

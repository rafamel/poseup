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
  .option('-w, --write <path>', 'Path to write a resulting docker compose file')
  .option('-s, --stop', 'Stop all services on exit')
  .option('-c, --clean', 'Run clean on exit')
  .option('--dry', "Don't run docker compose - write only docker compose file")
  .option('-f, --file <path>', 'Path for config file [js,json,yml]')
  .option('-e, --env <env>', 'Environment for config file should be run on')
  .option('-d, --dir <dir>', 'Project directory [cwd by default]')
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
}).catch(async (e) => {
  // eslint-disable-next-line no-console
  console.log('\n' + chalk.red('Error: ') + e.message);
  process.exit(1);
});

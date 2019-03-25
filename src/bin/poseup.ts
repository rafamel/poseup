#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import pify from 'pify';
import program from 'commander';
import args from './cmd-args';

(async function main() {
  const pkg = JSON.parse(
    await pify(fs.readFile)(path.join(__dirname, '../package.json'))
  );
  const commands = ['compose', 'run', 'clean', 'purge'];
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const failedHelp = () => Boolean(program.outputHelp()) || process.exit(1);
  // Init
  program
    .version(pkg.version)
    .description('Flexible containerized development workflow & deployment')
    .command('compose', 'Runs docker-compose')
    .command('run', 'Runs task')
    .command(
      'clean',
      'Cleans not persisted containers and networks. Optionally, also volumes.'
    )
    .command(
      'purge',
      'Purges dangling containers, networks, and volumes from system.'
    )
    .parse(args.set());

  // If no command is passed, show help and exit 1
  if (!program.args.filter((x: any) => commands.includes(x)).length) {
    failedHelp();
  }
})();

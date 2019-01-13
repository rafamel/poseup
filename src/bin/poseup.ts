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

  const commands = ['compose'];

  // Init
  program
    .version(pkg.version)
    .description('Flexible containerized development workflow & deployment')
    .command('compose', 'Runs docker-compose')
    .command('run', 'Runs task')
    .parse(args.set());

  // If no command is executed, show help and exit 1
  if (!program.args.filter((x: any) => commands.includes(x)).length) {
    program.help();
  }
})();

#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import program from 'commander';
import args from './cmd-args';

const commands = ['compose', 'run', 'clean', 'purge'];
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json')).toString()
);

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
if (!commands.includes(program.args[0])) {
  Boolean(program.outputHelp()) || process.exit(1);
}

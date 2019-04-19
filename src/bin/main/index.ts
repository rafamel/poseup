import up from 'find-up';
import fs from 'fs-extra';
import { rejects } from 'errorish';
import { stripIndent as indent } from 'common-tags';
import chalk from 'chalk';
import arg from 'arg';
import { flags, safePairs, log } from 'cli-belt';
import compose from './compose';
import run from './run';
import clean from './clean';
import purge from './purge';

export default async function main(argv: string[]): Promise<void> {
  const pkg = await up('package.json', { cwd: __dirname })
    .then((pkg) => fs.readJSON(pkg || ''))
    .catch(rejects);

  if (pkg.name) process.title = pkg.name;

  const help = indent`
    ${pkg.description ? chalk.bold.yellow(pkg.description) : ''}

    Usage:
      $ poseup [option]
      $ poseup [command] [options]

    Options:
      -h, --help     Show help
      -v, --version  Show version number

    Commands:
      compose        Runs docker-compose
      run            Runs tasks
      clean          Cleans not persisted containers and networks -optionally, also volumes
      purge          Purges dangling containers, networks, and volumes system-wide
  `;

  const types = {
    '--help': Boolean,
    '--version': Boolean
  };

  const { options, aliases } = flags(help);
  safePairs(types, options, { fail: true, bidirectional: true });
  Object.assign(types, aliases);
  const cmd = arg(types, { argv, permissive: false, stopAtPositional: true });

  if (cmd['--help']) return log(help);
  if (cmd['--version']) return log(pkg.version);
  if (!cmd._.length) {
    log(help + '\n');
    throw Error(`Poseup requires a command`);
  }

  const args = cmd._.slice(1);
  switch (cmd._[0]) {
    case 'compose':
      return compose(args);
    case 'run':
      return run(args);
    case 'clean':
      return clean(args);
    case 'purge':
      return purge(args);
    default:
      throw Error('Unknown command: ' + cmd._[0]);
  }
}

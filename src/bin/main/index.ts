/* eslint-disable no-console */
import { loadPackage, flags, safePairs } from 'cli-belt';
import { stripIndent as indent } from 'common-tags';
import arg from 'arg';
import chalk from 'chalk';
import compose from './compose';
import run from './run';
import clean from './clean';
import purge from './purge';
import { IOptions, TLogger } from '~/types';
import { setLevel } from '~/utils/logger';

export default async function main(argv: string[]): Promise<void> {
  const pkg = await loadPackage(__dirname, { title: true });

  const help = indent`
    ${pkg.description ? chalk.bold.yellow(pkg.description) : ''}

    Usage:
      $ poseup [option]
      $ poseup [command] [options]

    Options:
      -d, --dir <dir>     Project directory
      -f, --file <path>   Path for config file [js,json,yml,yaml]
      -e, --env <env>     Node environment
      --log <level>       Logging level
      -h, --help     Show help
      -v, --version  Show version number

    Commands:
      compose        Runs docker-compose
      run            Runs tasks
      clean          Cleans not persisted containers and networks -optionally, also volumes
      purge          Purges dangling containers, networks, and volumes system-wide

    Examples:
      $ poseup --log debug compose -- up
      $ poseup -d ./foo -e development clean
  `;

  const types = {
    '--dir': String,
    '--file': String,
    '--env': String,
    '--log': String,
    '--help': Boolean,
    '--version': Boolean
  };

  const { options: base, aliases } = flags(help);
  safePairs(types, base, { fail: true, bidirectional: true });
  Object.assign(types, aliases);
  const cmd = arg(types, { argv, permissive: false, stopAtPositional: true });

  if (cmd['--help']) return console.log(help);
  if (cmd['--version']) return console.log(pkg.version);
  if (!cmd._.length) {
    console.log(help + '\n');
    throw Error(`Poseup requires a command`);
  }

  const options: IOptions = {
    directory: cmd['--dir'],
    file: cmd['--file'],
    environment: cmd['--env'],
    log: cmd['--log'] as TLogger
  };
  if (options.log) setLevel(options.log);

  const args = cmd._.slice(1);
  switch (cmd._[0]) {
    case 'compose':
      return compose(
        args,
        options
      );
    case 'run':
      return run(args, options);
    case 'clean':
      return clean(args, options);
    case 'purge':
      return purge(args, options);
    default:
      throw Error('Unknown command: ' + cmd._[0]);
  }
}

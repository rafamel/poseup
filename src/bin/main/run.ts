/* eslint-disable no-console */
import { stripIndent as indent } from 'common-tags';
import arg from 'arg';
import { flags, safePairs } from 'cli-belt';
import { run as command } from '~/commands';
import { TLogger } from '~/types';
import { RUN_WAIT_TIMEOUT } from '~/constants';

export default async function run(argv: string[]): Promise<void> {
  const help = indent`
    Usage: 
      $ poseup run [options] [tasks]

    Runs tasks
    
    Options:
      -l, --list               List tasks
      -s, --sandbox            Create new containers for all services, remove all on exit
      -t, --timeout <seconds>  Timeout for waiting time after starting services before running commands [${RUN_WAIT_TIMEOUT} by default]
      --no-detect              Prevent service initialization auto detection and wait until timeout instead
      -e, --env <env>          Node environment
      -d, --dir <dir>          Project directory
      -f, --file <path>        Path for config file [js,json,yml,yaml]
      --log <level>            Logging level
      -h, --help               Show help
  `;

  const types = {
    '--list': Boolean,
    '--sandbox': Boolean,
    '--timeout': Number,
    '--no-detect': Boolean,
    '--env': String,
    '--dir': String,
    '--file': String,
    '--log': String,
    '--help': Boolean
  };

  const { options, aliases } = flags(help);
  safePairs(types, options, { fail: true, bidirectional: true });
  Object.assign(types, aliases);
  const cmd = arg(types, { argv, permissive: false, stopAtPositional: true });

  if (cmd['--help']) return console.log(help);

  return command({
    tasks: cmd._,
    list: cmd['--list'],
    sandbox: cmd['--sandbox'],
    timeout: cmd['--timeout'],
    detect: !cmd['--no-detect'],
    file: cmd['--file'],
    environment: cmd['--env'],
    directory: cmd['--dir'],
    log: cmd['--log'] as TLogger
  });
}

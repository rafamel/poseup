/* eslint-disable no-console */
import { stripIndent as indent } from 'common-tags';
import arg from 'arg';
import { flags, safePairs } from 'cli-belt';
import { run as command } from '~/commands';
import { IOptions } from '~/types';
import { RUN_WAIT_TIMEOUT } from '~/constants';

export default async function run(
  argv: string[],
  options: IOptions
): Promise<void> {
  const help = indent`
    Usage:
      $ poseup run [options] [tasks]

    Runs tasks
    
    Options:
      -l, --list               List tasks
      -s, --sandbox            Create new containers for all services, remove all on exit
      -t, --timeout <seconds>  Timeout for waiting time after starting services before running commands [${RUN_WAIT_TIMEOUT} by default]
      --no-detect              Prevent service initialization auto detection and wait until timeout instead
      -h, --help               Show help
  `;

  const types = {
    '--list': Boolean,
    '--sandbox': Boolean,
    '--timeout': Number,
    '--no-detect': Boolean,
    '--help': Boolean
  };

  const { options: base, aliases } = flags(help);
  safePairs(types, base, { fail: true, bidirectional: true });
  Object.assign(types, aliases);
  const cmd = arg(types, { argv, permissive: false, stopAtPositional: true });

  if (cmd['--help']) return console.log(help);

  return command({
    ...options,
    tasks: cmd._,
    list: cmd['--list'],
    sandbox: cmd['--sandbox'],
    timeout: cmd['--timeout'],
    detect: !cmd['--no-detect']
  });
}

/* eslint-disable no-console */
import { stripIndent as indent } from 'common-tags';
import arg from 'arg';
import { flags, safePairs, log, splitBy } from 'cli-belt';
import { compose as command } from '~/commands';
import { TLogger } from '~/types';

export default async function compose(argv: string[]): Promise<void> {
  const help = indent`
    Usage:
      $ poseup compose [options] -- [dockerArgs]

    Runs docker-compose

    Options:
      -w, --write <path>  Produce a docker compose file and save it to path
      -s, --stop          Stop all services on exit
      -c, --clean         Run clean on exit
      --dry               Dry run -write docker compose file only
      -e, --env <env>     Node environment
      -d, --dir <dir>     Project directory
      -f, --file <path>   Path for config file [js,json,yml,yaml]
      --log <level>       Logging level
      -h, --help          Show help
  `;

  const types = {
    '--write': String,
    '--stop': Boolean,
    '--clean': Boolean,
    '--dry': Boolean,
    '--env': String,
    '--dir': String,
    '--file': String,
    '--log': String,
    '--help': Boolean
  };

  const { options, aliases } = flags(help);
  safePairs(types, options, { fail: true, bidirectional: true });
  Object.assign(types, aliases);

  const [first, last] = splitBy(argv);
  const cmd = arg(types, {
    argv: first,
    permissive: false,
    stopAtPositional: true
  });

  if (cmd['--help']) return log(help);
  if (cmd._.length) throw Error('Unknown command: ' + cmd._[0]);

  return command({
    file: cmd['--file'],
    environment: cmd['--env'],
    directory: cmd['--dir'],
    write: cmd['--write'],
    log: cmd['--log'] as TLogger,
    args: last,
    dry: cmd['--dry'],
    clean: cmd['--clean'],
    stop: cmd['--stop']
  });
}

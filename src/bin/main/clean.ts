/* eslint-disable no-console */
import { stripIndent as indent } from 'common-tags';
import arg from 'arg';
import { flags, safePairs, log } from 'cli-belt';
import { clean as command } from '~/commands';
import { TLogger } from '~/types';

export default async function clean(argv: string[]): Promise<void> {
  const help = indent`
    Usage:
      $ poseup clean [options]

    Cleans not persisted containers and networks -optionally, also volumes
    
    Options:
      -v, --volumes      Clean volumes not associated with persisted containers
      -e, --env <env>    Node environment
      -d, --dir <dir>    Project directory
      -f, --file <path>  Path for config file [js,json,yml,yaml]
      --log <level>      Logging level
      -h, --help         Show help
  `;

  const types = {
    '--volumes': Boolean,
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

  if (cmd['--help']) return log(help);
  if (cmd._.length) throw Error('Unknown command: ' + cmd._[0]);

  return command({
    volumes: cmd['--volumes'],
    file: cmd['--file'],
    directory: cmd['--dir'],
    environment: cmd['--env'],
    log: cmd['--log'] as TLogger
  });
}

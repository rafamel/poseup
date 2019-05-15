/* eslint-disable no-console */
import { stripIndent as indent } from 'common-tags';
import arg from 'arg';
import { flags, safePairs, splitBy } from 'cli-belt';
import { compose as command } from '~/commands';
import { IOptions } from '~/types';

export default async function compose(
  argv: string[],
  options: IOptions
): Promise<void> {
  const help = indent`
    Usage:
      $ poseup compose [options] -- [dockerArgs]

    Runs docker-compose

    Options:
      -w, --write <path>  Produce a docker compose file and save it to path
      -s, --stop          Stop all services on exit
      -c, --clean         Run clean on exit
      --dry               Dry run -write docker compose file only
      -h, --help          Show help
  `;

  const types = {
    '--write': String,
    '--stop': Boolean,
    '--clean': Boolean,
    '--dry': Boolean,
    '--help': Boolean
  };

  const { options: base, aliases } = flags(help);
  safePairs(types, base, { fail: true, bidirectional: true });
  Object.assign(types, aliases);

  const [first, last] = splitBy(argv);
  const cmd = arg(types, {
    argv: first,
    permissive: false,
    stopAtPositional: true
  });

  if (cmd['--help']) return console.log(help);
  if (cmd._.length) throw Error('Unknown command: ' + cmd._[0]);

  return command({
    ...options,
    write: cmd['--write'],
    args: last,
    dry: cmd['--dry'],
    clean: cmd['--clean'],
    stop: cmd['--stop']
  });
}

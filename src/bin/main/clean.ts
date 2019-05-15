/* eslint-disable no-console */
import { stripIndent as indent } from 'common-tags';
import arg from 'arg';
import { flags, safePairs } from 'cli-belt';
import { clean as command } from '~/commands';
import { IOptions } from '~/types';

export default async function clean(
  argv: string[],
  options: IOptions
): Promise<void> {
  const help = indent`
    Usage:
      $ poseup clean [options]

    Cleans not persisted containers and networks -optionally, also volumes
    
    Options:
      -v, --volumes      Clean volumes not associated with persisted containers
      -h, --help         Show help
  `;

  const types = {
    '--volumes': Boolean,
    '--help': Boolean
  };

  const { options: base, aliases } = flags(help);
  safePairs(types, base, { fail: true, bidirectional: true });
  Object.assign(types, aliases);
  const cmd = arg(types, { argv, permissive: false, stopAtPositional: true });

  if (cmd['--help']) return console.log(help);
  if (cmd._.length) throw Error('Unknown command: ' + cmd._[0]);

  return command({
    ...options,
    volumes: cmd['--volumes']
  });
}

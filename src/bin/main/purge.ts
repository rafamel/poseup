/* eslint-disable no-console */
import { stripIndent as indent } from 'common-tags';
import arg from 'arg';
import { flags, safePairs, log } from 'cli-belt';
import { purge as command } from '~/commands';
import { TLogger } from '~/types';

export default async function purge(argv: string[]): Promise<void> {
  const help = indent`
    Usage:
      $ poseup purge [options]

    Purges dangling containers, networks, and volumes system-wide
    
    Options:
      -f, --force       Skip confirmation
      --log <level>     Logging level
      -h, --help        Show help
  `;

  const types = {
    '--force': Boolean,
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
    force: cmd['--force'],
    log: cmd['--log'] as TLogger
  });
}

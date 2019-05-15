/* eslint-disable no-console */
import { stripIndent as indent } from 'common-tags';
import arg from 'arg';
import { flags, safePairs } from 'cli-belt';
import { purge as command } from '~/commands';
import { IOptions } from '~/types';

export default async function purge(
  argv: string[],
  options: IOptions
): Promise<void> {
  const help = indent`
    Usage:
      $ poseup purge [options]

    Purges dangling containers, networks, and volumes system-wide
    
    Options:
      -f, --force       Skip confirmation
      -h, --help        Show help
  `;

  const types = {
    '--force': Boolean,
    '--help': Boolean
  };

  const { options: base, aliases } = flags(help);
  safePairs(types, base, { fail: true, bidirectional: true });
  Object.assign(types, aliases);
  const cmd = arg(types, { argv, permissive: false, stopAtPositional: true });

  if (cmd['--help']) return console.log(help);
  if (cmd._.length) throw Error('Unknown command: ' + cmd._[0]);

  return command({
    force: cmd['--force'],
    log: options.log
  });
}

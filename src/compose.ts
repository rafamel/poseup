import builder from '~/builder';
import { IPoseup } from '~/types';
import exec from '~/utils/exec';
import logger from 'loglevel';
import chalk from 'chalk';
import wrap from '~/utils/wrap-entry';

export default function compose(
  o: IPoseup = {},
  { dry }: { dry?: boolean } = {}
) {
  logger.setDefaultLevel('info');
  return wrap(async () => {
    if (dry && !o.write) {
      throw Error('Compose cannot be dry run without a write path');
    }

    const { cmd, args } = await builder(o);

    return dry
      ? logger.debug(
          chalk.yellow('Resulting command: ') + [cmd].concat(args).join(' ')
        )
      : exec(cmd, args);
  });
}

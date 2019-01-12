import builder from '~/builder';
import { IPoseup } from '~/types';
import exec from '~/utils/exec';
import logger from 'loglevel';
import chalk from 'chalk';

export default async function compose(
  o: IPoseup = {},
  { dry }: { dry?: boolean } = {}
) {
  if (dry && !o.write) {
    throw Error('Compose cannot be dry run without a write path');
  }

  const { cmd, args } = await builder(o);

  if (dry) {
    logger.debug(
      chalk.yellow('Resulting command: ') + [cmd].concat(args).join(' ')
    );
  } else exec(cmd, args);
}

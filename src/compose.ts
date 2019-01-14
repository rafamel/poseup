import builder from '~/builder';
import { IPoseupBuild } from '~/types';
import exec from '~/utils/exec';
import logger from 'loglevel';
import chalk from 'chalk';
import wrap from '~/utils/wrap-entry';

interface ICompose extends IPoseupBuild {
  dry?: boolean;
}

export default function compose(o: ICompose = {}) {
  return wrap(async () => {
    if (o.dry && !o.write) {
      throw Error('Compose cannot be dry run without a write path');
    }

    const { cmd, args } = await builder(o);

    return o.dry
      ? logger.debug(
          chalk.yellow('Resulting command: ') + [cmd].concat(args).join(' ')
        )
      : exec(cmd, args);
  });
}

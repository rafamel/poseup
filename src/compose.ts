import builder from '~/builder';
import { IPoseup } from '~/types';
import exec from '~/utils/exec';
import logger from 'loglevel';
import chalk from 'chalk';
import wrap from '~/utils/wrap-entry';
import write from '~/utils/write-yaml';

interface ICompose extends IPoseup {
  write?: string;
  dry?: boolean;
  args?: string[];
}

export default function compose(o: ICompose = {}): Promise<void> {
  return wrap(async () => {
    if (o.dry && !o.write) {
      throw Error('Compose cannot be dry run without a write path');
    }

    const { config, getCmd } = await builder(o);
    const file = await write({ data: config.compose, path: o.write });
    const { cmd, args } = getCmd({ file, args: o.args });

    return o.dry
      ? logger.debug(
          chalk.yellow('Resulting command: ') + [cmd].concat(args).join(' ')
        )
      : exec(cmd, args);
  });
}

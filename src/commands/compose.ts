import path from 'path';
import builder from '~/builder';
import { IComposeOptions } from '~/types';
import logger from '~/utils/logger';
import chalk from 'chalk';
import { initialize, add, ADD_TYPES } from '~/lifecycle';
import write from '~/utils/write-yaml';
import { getCmd as getCleanCmd } from './clean';
import { STOP_WAIT_TIME } from '~/constants';
import spawn from '~/utils/spawn';

export default async function compose(
  options: IComposeOptions = {}
): Promise<void> {
  await initialize(options);
  const { config, getCmd } = await builder(options);

  if (options.dry) {
    if (options.clean) throw Error('Compose cannot be dry run with clean');
    if (options.stop) throw Error('Compose cannot be dry run with stop');
    if (!options.write) {
      throw Error('Compose cannot be dry run without a write path');
    }
  }

  const file = await write({
    data: config.compose,
    path: options.write
      ? path.isAbsolute(options.write)
        ? options.write
        : path.join(process.cwd(), options.write)
      : undefined
  });
  const { cmd, args } = getCmd({ file });

  if (options.dry) {
    return logger.debug(
      chalk.yellow('Resulting command: ') +
        // prettier-ignore
        [cmd].concat(args).concat(options.args || []).join(' ')
    );
  }

  if (options.stop) {
    add(ADD_TYPES.STOP, 'Stop all services', async () => {
      return spawn(cmd, args.concat(['stop', '-t', String(STOP_WAIT_TIME)]));
    });
  }
  if (options.clean) {
    add(ADD_TYPES.CLEAN, 'Run clean', async () => {
      const { cmd, args } = await getCleanCmd({ config, getCmd });
      return spawn(cmd, args);
    });
  }

  const signal = await spawn(cmd, args.concat(options.args || []));
  if (signal) throw Error(`Process finished early (${signal})`);
}

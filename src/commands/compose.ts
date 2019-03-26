import builder from '~/builder';
import { IPoseup } from '~/types';
import logger from '~/utils/logger';
import chalk from 'chalk';
import initialize from '~/utils/initialize';
import write from '~/utils/write-yaml';
import { cleanBuild } from './clean';
import { STOP_WAIT_TIME } from '~/constants';
import spawn from '~/utils/spawn';
import add, { ADD_TYPES } from '~/utils/add';

interface ICompose extends IPoseup {
  write?: string;
  dry?: boolean;
  clean?: boolean;
  stop?: boolean;
  args?: string[];
}

export default async function compose(o: ICompose = {}): Promise<void> {
  await initialize(o);
  const { config, getCmd } = await builder(o);

  if (o.dry) {
    if (o.clean) throw Error('Compose cannot be dry run with clean');
    if (o.stop) throw Error('Compose cannot be dry run with stop');
    if (!o.write) {
      throw Error('Compose cannot be dry run without a write path');
    }
  }

  const file = await write({ data: config.compose, path: o.write });
  const { cmd, args } = getCmd({ file });

  if (o.dry) {
    return logger.debug(
      chalk.yellow('Resulting command: ') +
        [cmd]
          .concat(args)
          .concat(o.args || [])
          .join(' ')
    );
  }

  if (o.stop) {
    add(ADD_TYPES.STOP, 'Stop all services', async () => {
      return spawn(cmd, args.concat(['stop', '-t', String(STOP_WAIT_TIME)]));
    });
  }
  if (o.clean) {
    add(ADD_TYPES.CLEAN, 'Run clean', async () => {
      const { cmd, args } = await cleanBuild({ config, getCmd });
      return spawn(cmd, args);
    });
  }

  const signal = await spawn(cmd, args.concat(o.args || []));
  if (signal) throw Error(`Process finished early (${signal})`);
}

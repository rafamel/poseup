import builder from '~/builder';
import { IPoseup } from '~/types';
import exec from '~/utils/exec';
import logger from 'loglevel';
import chalk from 'chalk';
import wrap from '~/utils/wrap-entry';
import write from '~/utils/write-yaml';
import onExit, { state } from '~/utils/on-exit';
import { cleanBuild } from './clean';
import { STOP_WAIT_TIME } from './constants';

interface ICompose extends IPoseup {
  write?: string;
  dry?: boolean;
  clean?: boolean;
  stop?: boolean;
  args?: string[];
}

export default function compose(o: ICompose = {}): Promise<void> {
  return wrap(async () => {
    if (o.dry) {
      if (o.clean) throw Error('Compose cannot be dry run with clean');
      if (o.stop) throw Error('Compose cannot be dry run with stop');
      if (!o.write) {
        throw Error('Compose cannot be dry run without a write path');
      }
    }

    const { config, getCmd } = await builder(o);
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

    if (o.clean) {
      onExit('Run clean', async () => {
        // tslint:disable-next-line no-shadowed-variable
        const { cmd, args } = await cleanBuild({ config, getCmd });
        return exec(cmd, args);
      });
    }
    if (o.stop) {
      onExit('Stop all services', async () => {
        return exec(cmd, args.concat(['stop', '-t', String(STOP_WAIT_TIME)]));
      });
    }

    await exec(cmd, args.concat(o.args || []));
    if (state.start) throw Error('Process finished early');
  });
}

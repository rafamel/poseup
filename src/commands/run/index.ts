import builder from '~/builder';
import { IRunOptions } from '~/types';
import logger from '~/utils/logger';
import chalk from 'chalk';
import write from '~/utils/write-yaml';
import { getCmd as getCleanCmd } from '../clean';
import uuid from 'uuid/v4';
import { STOP_WAIT_TIME } from '~/constants';
import spawn, { silent } from '~/utils/spawn';
import initialize from '~/utils/initialize';
import add, { ADD_TYPES } from '~/utils/add';
import { control } from 'exits';
import runTask from './task';

export default async function run(options: IRunOptions = {}): Promise<void> {
  await control(trunk)(options);
}

// TODO stop and down with no stdin
function* trunk(opts: IRunOptions = {}): IterableIterator<any> {
  initialize(opts);
  const { config, getCmd } = yield builder(opts);

  if (!opts.tasks || !opts.tasks.length) throw Error('No tasks to run');
  if (!config.tasks) throw Error('There are no tasks defined');

  if (opts.sandbox) {
    config.project = config.project + '_' + uuid().split('-')[0];
  }

  const cleanCmd = yield getCleanCmd({ config, getCmd });
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const clean = () => spawn(cleanCmd.cmd, cleanCmd.args, { stdio: silent() });
  const file = yield write({ data: config.compose });
  const { cmd, args } = getCmd({ file });

  add(ADD_TYPES.STOP, 'Stop services', () => {
    return spawn(cmd, args.concat('stop', '--time', String(STOP_WAIT_TIME)));
  });
  add(
    ADD_TYPES.CLEAN,
    'Clean ' + (opts.sandbox ? 'sandbox' : 'ephemeral containers'),
    () =>
      opts.sandbox ? spawn(cmd, args.concat('down', '--volumes')) : clean()
  );

  for (const taskName of opts.tasks) {
    if (!config.tasks.hasOwnProperty(taskName)) {
      throw Error(`Task ${taskName} is not defined`);
    }
    logger.info(chalk.green('Running task:') + ' ' + taskName);
    const task = config.tasks[taskName];
    yield runTask(task, config, cmd, args, clean, opts.wait);
  }
}

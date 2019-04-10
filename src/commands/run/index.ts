import builder, { IBuild } from '~/builder';
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
import list from './list';

export default async function run(options: IRunOptions = {}): Promise<void> {
  await initialize(options);
  const build = await builder(options);

  if (options.list) list(options, build.config);
  else await control(trunk)(options, build);
}

function* trunk(opts: IRunOptions, build: IBuild): IterableIterator<any> {
  const { config, getCmd } = build;

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
    logger.info(
      '\n' + chalk.yellow.bold('-') + ' Running task: ' + chalk.bold(taskName)
    );
    const task = config.tasks[taskName];
    yield runTask(task, config, cmd, args, clean, opts.timeout, opts.detect);
  }
}

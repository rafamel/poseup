import builder from '~/builder';
import { ITask, IConfig, IRunOptions } from '~/types';
import logger from '~/utils/logger';
import chalk from 'chalk';
import write from '~/utils/write-yaml';
import { getCmd as getCleanCmd } from '../clean';
import uuid from 'uuid/v4';
import { wait } from 'promist';
import { STOP_WAIT_TIME, RUN_DEFAULT_WAIT_BEFORE_EXEC } from '~/constants';
import runPrimary from './primary';
import runCmd from './cmd';
import spawn, { silent } from '~/utils/spawn';
import initialize from '~/utils/initialize';
import add, { ADD_TYPES } from '~/utils/add';
import { control } from 'exits';

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

async function runTask(
  task: ITask,
  config: IConfig,
  cmd: string,
  args: string[],
  clean: () => Promise<any>,
  swait?: number | string
): Promise<void> {
  // Bring up linked
  const linked = (
    task.services ||
    (task.primary &&
      config.compose.services.hasOwnProperty(task.primary) &&
      config.compose.services[task.primary].depends_on) ||
    []
  ).filter((x: string, i: number, arr: string[]) => arr.indexOf(x) === i);

  if (linked.length) {
    logger.info(chalk.green('Bringing up services:') + ' ' + linked.join(', '));
    const signal = await spawn(
      cmd,
      args.concat(['up', '--detach']).concat(linked),
      { stdio: silent() }
    );
    if (signal) throw Error(`Process finished early ${signal}`);
  }

  await wait((swait ? Number(swait) : RUN_DEFAULT_WAIT_BEFORE_EXEC) * 1000);

  // Run before hooks
  if (task.exec && task.exec.length) {
    logger.info(chalk.green('Running exec commands'));
    for (const obj of task.exec) {
      const services = Object.keys(obj);
      for (const service of services) {
        const execCmd = obj[service];
        const signal = await spawn(
          cmd,
          args.concat(['exec', service]).concat(execCmd)
        );
        if (signal) throw Error(`Process finished early ${signal}`);
      }
    }
  }

  // Run cmd
  await (task.primary ? runPrimary(task, config, cmd, args) : runCmd(task));

  logger.info(chalk.green('Cleaning environment'));
  const signal = await clean();
  if (signal) throw Error(`Process finished early ${signal}`);
}

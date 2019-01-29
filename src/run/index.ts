import builder from '~/builder';
import { IPoseup, ITask, IPoseupConfig } from '~/types';
import exec from '~/utils/exec';
import logger from 'loglevel';
import chalk from 'chalk';
import wrap from '~/utils/wrap-entry';
import write from '~/utils/write-yaml';
import { cleanBuild } from '~/clean';
import onExit, { state } from '~/utils/on-exit';
import uuid from 'uuid/v4';
import { wait } from 'promist';
import { STOP_WAIT_TIME, RUN_DEFAULT_WAIT_BEFORE_EXEC } from '~/constants';
import runPrimary from './primary';
import runCmd from './cmd';
import silentStdio from '~/utils/silent-stdio';

interface IRun extends IPoseup {
  tasks?: string[];
  wait?: number;
  sandbox?: boolean;
}
export default function run(o: IRun = {}): Promise<void> {
  async function runTask(
    task: ITask,
    config: IPoseupConfig,
    cmd: string,
    args: string[],
    clean: () => Promise<void>
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
      logger.info(
        chalk.green('Bringing up services:') + ' ' + linked.join(', ')
      );
      await exec(cmd, args.concat(['up', '--detach']).concat(linked), {
        stdio: silentStdio()
      });
    }

    await wait((o.wait || RUN_DEFAULT_WAIT_BEFORE_EXEC) * 1000);

    // Run before hooks
    if (task.exec && task.exec.length) {
      logger.info(chalk.green('Running exec commands'));
      for (const obj of task.exec) {
        const services = Object.keys(obj);
        for (const service of services) {
          const execCmd = obj[service];
          await exec(cmd, args.concat(['exec', service]).concat(execCmd));
          if (state.start) throw Error('Process finished early');
        }
      }
    }

    // Run cmd
    await (task.primary ? runPrimary(task, config, cmd, args) : runCmd(task));

    logger.info(chalk.green('Cleaning environment'));
    return clean();
  }

  return wrap(async () => {
    if (!o.tasks || !o.tasks.length) throw Error('No tasks to run');

    const { config, getCmd } = await builder(o);
    if (!config.tasks) throw Error('There are no tasks defined');

    if (o.sandbox) config.project = config.project + '_' + uuid().split('-')[0];

    const cleanCmd = await cleanBuild({ config, getCmd });
    const clean = (): Promise<void> =>
      exec(cleanCmd.cmd, cleanCmd.args, { stdio: silentStdio() });
    const file = await write({ data: config.compose });
    const { cmd, args } = getCmd({ file });

    onExit(
      'Stop services & clean ' +
        (o.sandbox ? 'sandbox' : 'ephemeral containers'),
      async () => {
        await exec(cmd, args.concat('stop', '--time', String(STOP_WAIT_TIME)));
        o.sandbox
          ? await exec(cmd, args.concat('down', '--volumes'))
          : await clean();
      }
    );

    for (const taskName of o.tasks) {
      if (!config.tasks.hasOwnProperty(taskName)) {
        throw Error(`Task ${taskName} is not defined`);
      }
      logger.info(chalk.green('Running task:') + ' ' + taskName);
      const task = config.tasks[taskName];
      await runTask(task, config, cmd, args, clean);
    }
  });
}

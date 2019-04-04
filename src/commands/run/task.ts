import { ITask, IConfig } from '~/types';
import logger from '~/utils/logger';
import chalk from 'chalk';
import { wait } from 'promist';
import { RUN_DEFAULT_WAIT_BEFORE_EXEC } from '~/constants';
import runPrimary from './primary';
import runCmd from './cmd';
import spawn, { silent } from '~/utils/spawn';

export default async function runTask(
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
    logger.info(
      '  ' +
        chalk.bold('+') +
        ' Bringing up services: ' +
        chalk.bold(linked.join(', '))
    );
    const signal = await spawn(
      cmd,
      args.concat(['up', '--detach']).concat(linked),
      { stdio: silent() }
    );
    if (signal) throw Error(`Process finished early ${signal}`);

    // eslint-disable-next-line eqeqeq
    if (swait != undefined && Number(swait) < 0) {
      throw Error(`Waiting time must be greater than or equal to 0`);
    }
    await wait(
      // eslint-disable-next-line eqeqeq
      (swait == undefined ? RUN_DEFAULT_WAIT_BEFORE_EXEC : Number(swait)) * 1000
    );
  }

  // Run before hooks
  if (task.exec && task.exec.length) {
    for (const obj of task.exec) {
      const services = Object.keys(obj);
      for (const service of services) {
        const execCmd = obj[service];
        logger.info(
          '  ' +
            chalk.bold('+') +
            ' Running exec on ' +
            chalk.bold(
              service + ': ' + chalk.bold(`['${execCmd.join("', '")}']`)
            )
        );
        const signal = await spawn(
          cmd,
          args.concat(['exec', service]).concat(execCmd)
        );
        if (signal) throw Error(`Process finished early ${signal}`);
      }
    }
  }

  // Run cmd
  if (task.primary) await runPrimary(task, config, cmd, args);
  else if (task.cmd) await runCmd(task);

  logger.info('  ' + chalk.bold('+') + ' Cleaning environment');
  const signal = await clean();
  if (signal) throw Error(`Process finished early ${signal}`);
}

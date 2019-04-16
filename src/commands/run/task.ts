import { ITask, IConfig, IOfType } from '~/types';
import logger from '~/utils/logger';
import chalk from 'chalk';
import { wait } from 'promist';
import runPrimary from './primary';
import runCmd from './cmd';
import spawn, { silent } from '~/utils/spawn';
import waitDetect from './wait-detect';
import { RUN_WAIT_TIMEOUT } from '~/constants';

export default async function runTask(
  task: ITask,
  config: IConfig,
  cmd: string,
  args: string[],
  clean: () => Promise<any>,
  timeout?: number,
  detect?: boolean
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
      `  ${chalk.bold('+')} Bringing up services: ` +
        chalk.bold(linked.join(', '))
    );
    const signal = await spawn(
      cmd,
      args.concat(['up', '--detach']).concat(linked),
      { stdio: silent() }
    );
    if (signal) throw Error(`Process finished early (${signal})`);

    // eslint-disable-next-line eqeqeq
    if (timeout == undefined) timeout = RUN_WAIT_TIMEOUT;
    if (timeout < 0) {
      throw Error(`Waiting time must be greater than or equal to 0`);
    } else if (timeout === 0) {
      logger.debug('Not waiting for services initialization: timeout was 0');
    } else {
      if (detect) {
        logger.info(
          `  ${chalk.bold('+')} Waiting for services to complete initialization`
        );
        await waitDetect(linked, timeout, cmd, args);
      } else {
        logger.info('  ' + chalk.bold('+') + ` Waiting for ${timeout} seconds`);
        await wait(timeout * 1000);
      }
    }
  }

  // Run before hooks
  const exec = Array.isArray(task.exec)
    ? task.exec
    : ([task.exec].filter(Boolean) as Array<IOfType<string[]>>);
  for (const obj of exec) {
    const services = Object.keys(obj);
    for (const service of services) {
      const execCmd = obj[service];
      logger.info(
        `  ${chalk.bold('+')} Running exec on ` +
          chalk.bold(service + ': ' + `['${execCmd.join("', '")}']`)
      );
      const signal = await spawn(
        cmd,
        args.concat(['exec', service]).concat(execCmd)
      );
      if (signal) throw Error(`Process finished early (${signal})`);
    }
  }

  // Run cmd
  if (task.primary) await runPrimary(task, config, cmd, args);
  else if (task.cmd) await runCmd(task);

  logger.info('  ' + chalk.bold('+') + ' Cleaning environment');
  const signal = await clean();
  if (signal) throw Error(`Process finished early (${signal})`);
}

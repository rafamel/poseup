import logger from '~/utils/logger';
import chalk from 'chalk';
import { ITask, IConfig } from '~/types';
import uuid from 'uuid/v4';
import spawn from '~/utils/spawn';

export default async function runPrimary(
  task: ITask,
  config: IConfig,
  cmd: string,
  args: string[]
): Promise<void> {
  if (!task.primary) throw Error('Task has no primary container');

  logger.info(
    `  ${chalk.bold('+')} Running primary service` +
      (task.cmd && task.cmd.length
        ? chalk.bold(` ${task.primary}: ['${task.cmd.join("', '")}']`)
        : ': ' + chalk.bold(task.primary))
  );

  // As docker-compose run doesn't exit on stdin signals,
  // we need to shut it down if it hasn't exited
  const CONTAINER_NAME =
    config.project.toLowerCase() +
    '_' +
    task.primary +
    '_run_' +
    uuid().split('-')[0];

  await spawn(
    cmd,
    args
      .concat(['run', '--name', CONTAINER_NAME, '--rm', task.primary])
      .concat(task.cmd || []),
    // Pipe instead of directly attaching in order to intercept
    // exit signals through the main process
    { stdio: ['pipe', 'inherit', 'inherit'] }
  );
}

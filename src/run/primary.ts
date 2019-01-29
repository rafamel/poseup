import logger from 'loglevel';
import chalk from 'chalk';
import { ITask, IPoseupConfig } from '~/types';
import exec from '~/utils/exec';
import uuid from 'uuid/v4';
import { status } from 'promist';
import { RUN_FORCEFUL_STOP_WAIT_TIME } from '~/constants';
import onExit from '~/utils/on-exit';

export default function runPrimary(
  task: ITask,
  config: IPoseupConfig,
  cmd: string,
  args: string[]
): Promise<void> {
  if (!task.primary) throw Error('Task has no primary container');
  logger.info(chalk.green('Running primary: ') + task.primary);

  // As docker-compose run doesn't exit on stdin signals,
  // we need to shut it down if it hasn't exited
  const CONTAINER_NAME =
    config.project.toLowerCase() +
    '_' +
    task.primary +
    '_run_' +
    uuid().split('-')[0];

  const p = status(
    exec(
      cmd,
      args
        .concat(['run', '--name', CONTAINER_NAME, '--rm', task.primary])
        .concat(task.cmd || []),
      // Pipe instead of directly attaching in order to intercept
      // exit signals through the main process
      { stdio: ['pipe', 'inherit', 'inherit'] }
    )
  );

  onExit('Stopping container ' + CONTAINER_NAME, () => {
    if (p.status !== 'pending') return;
    return exec('docker', [
      'container',
      'stop',
      '--time',
      String(RUN_FORCEFUL_STOP_WAIT_TIME),
      CONTAINER_NAME
    ]);
  });

  return p;
}

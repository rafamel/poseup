import logger from '~/utils/logger';
import chalk from 'chalk';
import { ITask } from '~/types';
import spawn from '~/utils/spawn';
import nrp from 'npm-run-path';

export default async function runCmd(
  task: ITask,
  directory: string
): Promise<void> {
  if (!task.cmd || !task.cmd.length) throw Error('Task has no cmd');
  logger.info(
    `  ${chalk.bold('+')} Running cmd: ` +
      chalk.bold(`['${task.cmd.join("', '")}']`)
  );

  await spawn(task.cmd[0], task.cmd.slice(1), {
    cwd: directory,
    env: nrp.env({ cwd: directory })
  });
}

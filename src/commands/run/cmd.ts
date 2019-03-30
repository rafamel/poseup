import logger from '~/utils/logger';
import chalk from 'chalk';
import { ITask } from '~/types';
import spawn from '~/utils/spawn';

export default async function runCmd(task: ITask): Promise<void> {
  if (!task.cmd || !task.cmd.length) throw Error('Task has no cmd');
  logger.info(chalk.green('Running cmd: ') + task.cmd[0]);

  await spawn(task.cmd[0], task.cmd.slice(1));
}

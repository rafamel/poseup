import logger from '~/utils/logger';
import chalk from 'chalk';
import { ITask } from '~/types';
import spawn from '~/utils/spawn';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function runCmd(task: ITask) {
  if (!task.cmd || !task.cmd.length) throw Error('Task has no cmd');
  logger.info(chalk.green('Running cmd: ') + task.cmd[0]);

  return spawn(task.cmd[0], task.cmd.slice(1));
}

import logger from 'loglevel';
import chalk from 'chalk';
import { ITask } from '~/types';
import exec from '~/utils/exec';

export default function runCmd(task: ITask) {
  if (!task.cmd || !task.cmd.length) throw Error('Task has no cmd');
  logger.info(chalk.green('Running cmd: ') + task.cmd[0]);

  return exec(task.cmd[0], task.cmd.slice(1));
}

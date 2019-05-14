import logger from '~/utils/logger';
import chalk from 'chalk';
import { ITask } from '~/types';
import spawn from '~/utils/spawn';
import up from 'find-up';
import manage from 'manage-path';

export default async function runCmd(
  task: ITask,
  directory: string
): Promise<void> {
  if (!task.cmd || !task.cmd.length) throw Error('Task has no cmd');
  logger.info(
    `  ${chalk.bold('+')} Running cmd: ` +
      chalk.bold(`['${task.cmd.join("', '")}']`)
  );
  // TODO: refactor
  const bin = await up('node_modules/.bin', {
    cwd: directory,
    type: 'directory'
  });
  const opts = { cwd: directory, env: Object.assign({}, process.env) };
  if (bin) {
    const alter = manage(opts.env);
    alter.unshift(bin);
  }

  await spawn(task.cmd[0], task.cmd.slice(1), opts);
}

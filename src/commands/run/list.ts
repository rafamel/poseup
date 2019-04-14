import { IRunOptions, IConfig } from '~/types';
import { log, tail } from 'cli-belt';
import chalk from 'chalk';

export default function list(opts: IRunOptions, config: IConfig): void {
  log(printer(config));

  if (opts.tasks && opts.tasks.length) {
    throw Error(`poseup cannot run tasks when listing them`);
  }
}

export function printer(config: IConfig): string {
  let print = 'Tasks for ' + chalk.green.bold(config.project) + '\n';

  const tasks = config.tasks || {};
  const being = tail(Object.keys(tasks), 7);

  Object.entries(tasks).forEach(([name, task]) => {
    print +=
      '\nposeup run ' + chalk.bold(being(name)) + (task.description || '');
  });

  return print;
}

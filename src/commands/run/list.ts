import { IRunOptions, IConfig } from '~/types';
import chalk from 'chalk';

export default function list(opts: IRunOptions, config: IConfig): void {
  // eslint-disable-next-line
  console.log(printer(config));

  if (opts.tasks && opts.tasks.length) {
    throw Error(`poseup cannot run tasks when listing them`);
  }
}

export function printer(config: IConfig): string {
  let print = 'Tasks for ' + chalk.green.bold(config.project) + '\n';

  const tasks = config.tasks || {};
  const longest = Object.keys(tasks).sort((a, b) => b.length - a.length)[0];

  Object.entries(tasks).forEach(([name, task]) => {
    print += '\nposeup run ' + chalk.bold(name);
    if (task.description) print += tail(name, longest) + task.description;
  });

  return print;
}

export function tail(str: string, longest?: string): string {
  const TAIL = 7;
  return ' '.repeat((longest ? longest.length - str.length : 0) + TAIL);
}

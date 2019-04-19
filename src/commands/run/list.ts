import { IRunOptions, IConfig } from '~/types';
import { log } from 'cli-belt';
import table from 'as-table';
import chalk from 'chalk';

export default function list(opts: IRunOptions, config: IConfig): void {
  log(printer(config));

  if (opts.tasks && opts.tasks.length) {
    throw Error(`poseup cannot run tasks when listing them`);
  }
}

export function printer(config: IConfig): string {
  const tasks = config.tasks || {};
  const rows = Object.entries(tasks).map(([name, task]) => [
    'poseup run ' + chalk.bold(name),
    task.description || ''
  ]);

  return (
    `Tasks for ${chalk.green.bold(config.project)}\n\n` +
    table
      .configure({ delimiter: ' '.repeat(8) })(rows)
      .trim()
  );
}

import chalk from 'chalk';
import containerLs from '~/utils/container-ls';
import logger from '~/utils/logger';
import { IPurgeOptions } from '~/types';
import initialize from '~/utils/initialize';
import spawn from '~/utils/spawn';
import table from 'as-table';

export default async function purge(
  options: IPurgeOptions = {}
): Promise<void> {
  await initialize({ log: options.log });

  logger.info(chalk.yellow('\nStarting docker system-wide cleanup'));

  const args = options.force ? ['--force'] : [];

  await spawn('docker', ['volume', 'prune'].concat(args));
  await spawn('docker', ['network', 'prune'].concat(args));
  await spawn('docker', ['image', 'prune', '--all'].concat(args));

  // Show running container information
  const containers = await containerLs({ all: true });
  const rows = containers.map((x) => [chalk.bold(x.Names), x.Status]);

  logger.info(
    chalk.bold.green('\nDocker containers in system: ') +
      chalk.bold(String(containers.length))
  );
  logger.info(table.configure({ delimiter: ' '.repeat(6) })(rows));
}

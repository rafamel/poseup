import chalk from 'chalk';
import containerLs from '~/utils/container-ls';
import logger from '~/utils/logger';
import { TLogger } from '~/types';
import initialize from '~/utils/initialize';
import spawn from '~/utils/spawn';

interface IPurge {
  force: boolean;
  log?: TLogger;
}

export default async function purge({ force, log }: IPurge): Promise<void> {
  await initialize({ log });

  logger.info(chalk.yellow('\nStarting docker system-wide cleanup'));

  const args = force ? ['--force'] : [];

  await spawn('docker', ['volume', 'prune'].concat(args));
  await spawn('docker', ['network', 'prune'].concat(args));
  await spawn('docker', ['image', 'prune', '--all'].concat(args));

  // Show running container information
  const containers = await containerLs({ all: true });
  logger.info(
    '\n' +
      chalk.green('Docker containers in system: ') +
      String(containers.length)
  );
  containers.map(({ ID, Status, Names }) => {
    logger.info(`${ID}\t${Status.split(' ')[0]}\t   ${Names}`);
  });
}

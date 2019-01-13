import chalk from 'chalk';
import exec from '~/utils/exec';
import containerLs from '~/utils/container-ls';
import logger from 'loglevel';
import wrap from '~/utils/wrap-entry';

export default function cleanSystem({ force }: { force: boolean }) {
  return wrap(async () => {
    logger.info(chalk.yellow('\nStarting docker system-wide cleanup'));

    const args = force ? ['--force'] : [];

    await exec('docker', ['volume', 'prune'].concat(args));
    await exec('docker', ['network', 'prune'].concat(args));
    await exec('docker', ['image', 'prune', '--all'].concat(args));

    // Show running container information
    logger.info('\n' + chalk.green('Docker containers in system:'));
    (await containerLs({ all: true })).map(({ ID, Status, Names }) => {
      logger.info(`${ID}\t${Status.split(' ')[0]}\t   ${Names}`);
    });
  });
}

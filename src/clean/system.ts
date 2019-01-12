import chalk from 'chalk';
import exec from '~/utils/exec';
import containerLs from '~/utils/container-ls';
import logger from 'loglevel';

export default async function cleanSystem({ force }: { force: boolean }) {
  logger.setLevel('trace');
  logger.info(chalk.yellow('\nStarting docker system-wide cleanup'));

  // @ts-ignore
  await exec('docker', ['volume', 'prune', force && '--force'].filter(Boolean));

  await exec(
    'docker',
    // @ts-ignore
    ['network', 'prune', force && '--force'].filter(Boolean)
  );

  await exec(
    'docker',
    // @ts-ignore
    ['image', 'prune', '--all', force && '--force'].filter(Boolean)
  );

  // Show running container information
  logger.info('\n' + chalk.green('Docker containers in system:'));
  (await containerLs({ all: true })).map(({ ID, Status, Names }) => {
    logger.info(`${ID}\t${Status.split(' ')[0]}\t   ${Names}`);
  });
}

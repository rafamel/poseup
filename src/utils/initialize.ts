import has from '~/utils/has';
import { options, attach, add, resolver } from 'exits';
import { IPoseup } from '~/types';
import { ADD_TYPES } from './add';
import chalk from 'chalk';
import logger, { setLevel } from '~/utils/logger';

/**
 * Should be called by all functions that are entry points.
 * - Sets default logging level
 * - Checks docker & docker-compose binaries are available
 * - Attaches on-exit hook runner to current node process (executes if terminated)
 * - Sets environment
 * - Sets default logging level
 */

let added = false;
export default async function initialize({
  environment,
  log
}: IPoseup): Promise<void> {
  if (log) setLevel(log);
  if (environment) process.env.NODE_ENV = environment;

  // Check binaries are available: docker docker-compose
  const bins = await has.all('docker', 'docker-compose');
  if (!bins.all) {
    const name = bins.docker ? 'docker-compose' : 'docker';
    logger.info(
      `${name} binary is not available in path.\n` +
        'Install docker at https://www.docker.com/get-started ' +
        'and run this afterwards.'
    );
    throw Error(`${name} not available`);
  }

  options({
    spawned: {
      signals: 'none',
      wait: 'all'
    },
    resolver(type, arg) {
      if (type === 'exception' || type === 'rejection') {
        type = 'exit';
        arg = 1;
      }
      return resolver(type, arg);
    }
  });

  attach();

  if (!added) {
    added = true;
    add((type, arg) => {
      switch (type) {
        case 'exception':
        case 'rejection':
          // @ts-ignore
          logger.error('\n' + chalk.red('Error: ') + arg.message);
          break;
        case 'exit':
          if (arg !== 0) {
            logger.error(
              '\n' +
                chalk.red('Error: ') +
                `Spawned process exited with code ${arg}`
            );
          }
          break;
        default:
          break;
      }
    }, ADD_TYPES.END_LOG);
  }
}

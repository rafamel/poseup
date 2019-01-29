import logger from 'loglevel';
import has from '~/utils/has';
import { DEFAULT_LOG_LEVEL } from '~/constants';
import { options, attach, add } from 'exits';
// TODO update exits to export the resolver from root
import resolver from 'exits/utils/resolver';
import { IPoseup } from '~/types';
import { ADD_TYPES } from './add';
import chalk from 'chalk';

// TODO: logger shouldn't be global

/**
 * Should be called by all functions that are entry points.
 * - Sets default logging level
 * - Checks docker & docker-compose binaries are available
 * - Attaches on-exit hook runner to current node process (executes if terminated)
 * - Sets environment
 * - Sets default logging level
 */

export default async function initialize({
  environment,
  log
}: IPoseup): Promise<void> {
  if (environment) process.env.NODE_ENV = environment;
  logger.setDefaultLevel(log || DEFAULT_LOG_LEVEL);

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
    logger: log || DEFAULT_LOG_LEVEL,
    spawned: {
      signals: 'all',
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

  add((type, arg) => {
    switch (type) {
      case 'exception':
      case 'rejection':
        // TODO update exits to recognize the type of arg in add callback
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

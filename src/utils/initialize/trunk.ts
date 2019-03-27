import has from '~/utils/has';
import { options, attach, add, resolver, on, IState } from 'exits';
import { ADD_TYPES } from '../add';
import chalk from 'chalk';
import logger from '~/utils/logger';

export default async function trunk(): Promise<void> {
  // Attachment must go first (other potential errors must be catched)
  attach();
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

  // Add hooks
  on('triggered', () => logger.info('\nWaiting on termination'));
  add(() => logger.info('\nPreparing exit'), ADD_TYPES.START_LOG);
  on('done', onDone);
}

export function onDone(getState: () => IState): void {
  logger.info('Done');
  const { triggered } = getState();
  if (triggered) {
    switch (triggered.type) {
      case 'exception':
      case 'rejection':
        logger.error(
          '\n' + chalk.red('Error: ') + (triggered.arg as Error).message
        );
        break;
      case 'exit':
        if (triggered.arg !== 0) {
          logger.error(
            '\n' +
              chalk.red('Error: ') +
              `Spawned process exited with code ${triggered.arg}`
          );
        }
        break;
      default:
        break;
    }
  }
}

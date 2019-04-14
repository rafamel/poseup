import has from '~/utils/has';
import { options, attach, add, resolver, on, IState } from 'exits';
import { ADD_TYPES } from '../add';
import chalk from 'chalk';
import logger from '~/utils/logger';
import { error } from 'cli-belt';

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
  on('triggered', () =>
    logger.info('\n' + chalk.yellow.bold('-') + ' Waiting on termination')
  );
  add(
    () => logger.info(chalk.yellow.bold('-') + ' Preparing exit'),
    ADD_TYPES.START_LOG
  );
  on('done', onDone);
}

export function onDone(getState: () => IState): void {
  logger.info(chalk.green.bold('✓') + ' Done');
  const { triggered } = getState();
  if (triggered) {
    switch (triggered.type) {
      case 'exception':
      case 'rejection':
        error(triggered.arg as Error, { logger, debug: true });
        break;
      case 'exit':
        if (triggered.arg !== 0) {
          error(Error(`Spawned process exited with code ${triggered.arg}`), {
            logger
          });
        }
        break;
      default:
        break;
    }
  }
}

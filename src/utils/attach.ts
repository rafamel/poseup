import { options, attach as _attach, add, resolver, on, IState } from 'exits';
import { ADD_TYPES, toTeardown } from './teardown';
import chalk from 'chalk';
import logger from '~/utils/logger';
import { error } from 'cli-belt';

/** @hidden */
let attached = false;

export default async function attach(): Promise<void> {
  // Attachment must go first (other potential errors must be catched)
  _attach();
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

  // Add hooks
  on(
    'triggered',
    () =>
      toTeardown() &&
      logger.info('\n' + chalk.yellow.bold('-') + ' Waiting on termination')
  );
  add(
    () =>
      toTeardown() && logger.info(chalk.yellow.bold('-') + ' Preparing exit'),
    ADD_TYPES.START_LOG
  );
  on('done', onDone);

  attached = true;
}

/** @hidden */
export function isAttached(): boolean {
  return attached;
}

/** @hidden */
export function onDone(getState: () => IState): void {
  if (toTeardown()) logger.info(chalk.green.bold('✓') + ' Done');

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

import { options, attach as _attach, add, resolver, on } from 'exits';
import { ADD_TYPES, toTeardown } from './teardown';
import chalk from 'chalk';
import logger from '~/utils/logger';

/** @hidden */
let attached = false;

export default function attach(): void {
  attached = true;

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
  on(
    'done',
    () => toTeardown() && logger.info(chalk.green.bold('✓') + ' Done')
  );
}

/** @hidden */
export function isAttached(): boolean {
  return attached;
}

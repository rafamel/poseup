import { options, resolver, on, add } from 'exits';
import { ADD_TYPES } from './add';
import manager from './manager';
import chalk from 'chalk';
import logger from '~/utils/logger';

export default function attach(): void {
  if (manager.isAttached()) return;
  // Attachment must go first (other potential errors must be catched)
  manager.attach();

  options({
    spawned: {
      signals: 'none',
      wait: 'all'
    },
    resolver(type, arg) {
      try {
        if (type === 'signal') {
          logger.debug('Received a termination signal: exiting with code 1');
          return resolver('exit', 1);
        }
        return resolver(type, arg);
      } catch (err) {
        return resolver('exit', 1);
      }
    }
  });

  // Add hooks
  on('triggered', () => {
    if (manager.isPending()) {
      logger.info('\n' + chalk.yellow.bold('-') + ' Waiting on termination');
    }
  });
  add(() => {
    if (manager.isPending()) {
      logger.info(chalk.yellow.bold('-') + ' Preparing exit');
    }
  }, ADD_TYPES.START_LOG);
  on('done', () => {
    if (manager.isPending()) {
      logger.info(chalk.green.bold('✓') + ' Done');
      manager.flush();
    }
  });
}

import logger from '~/utils/logger';
import chalk from 'chalk';
import { ensure, Errorish } from 'errorish';
import manager from './manager';

/**
 * Sets priority: larger runs first
 */
export enum ADD_TYPES {
  START_LOG = 10,
  STOP = 3,
  CLEAN = 2,
  // File removal must go last in order for them to still exist on clean/stop
  REMOVE_TEMP_FILES = 1
}

export default function add(
  type: ADD_TYPES,
  message: string,
  fn: () => any | Promise<any>
): void {
  manager.add(async (): Promise<any> => {
    logger.info('  ' + chalk.gray.dim('+ ' + message));

    try {
      await fn();
    } catch (e) {
      const err = ensure(e, { Error: Errorish });
      logger.error(err.message);
      if (err.root.stack) logger.trace(err.root.stack);
    }
  }, type);
}

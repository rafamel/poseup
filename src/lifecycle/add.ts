import logger from '~/utils/logger';
import chalk from 'chalk';
import { ensure, Errorish } from 'errorish';
import manager from './manager';

/**
 * Sets priority index: larger runs last
 */
export enum ADD_TYPES {
  START_LOG = 0,
  STOP = 1,
  CLEAN = 2,
  // File removal must go last in order for them to still exist on clean/stop
  REMOVE_TEMP_FILES = 3
}

export default function add(
  type: ADD_TYPES,
  message: string,
  fn: () => any | Promise<any>
): void {
  manager.add(type, async function(): Promise<any> {
    logger.info('  ' + chalk.gray.dim('+ ' + message));

    try {
      await fn();
    } catch (e) {
      const err = ensure(e, { Error: Errorish });
      logger.warn(err.message);
      if (err.root.stack) logger.trace(err.root.stack);
    }
  });
}

import logger from '~/utils/logger';
import chalk from 'chalk';
import { add as _add } from 'exits';
import { isAttached } from './attach';

/**
 * @hidden
 * Sets priority (larger runs first)
 * */
export enum ADD_TYPES {
  START_LOG = 10,
  STOP = 3,
  CLEAN = 2,
  // File removal must go last in order for them to still exist on clean/stop
  REMOVE_TEMP_FILES = 1
}

/** @hidden */
let _teardown = false;
/** @hidden */
let fns: Array<[() => any | Promise<any>, ADD_TYPES]> = [];
/** @hidden */
export function add(
  type: ADD_TYPES,
  message: string,
  cb: () => any | Promise<any>
): void {
  _teardown = true;
  const fn = (): any => {
    logger.info('  ' + chalk.gray.dim('+ ' + message));
    return cb();
  };

  isAttached() ? _add(fn, type) : fns.push([fn, type]);
}

/** @hidden */
export function toTeardown(): boolean {
  return _teardown;
}

export async function teardown(): Promise<void> {
  const cbs = fns.sort((a, b) => b[1] - a[1]).map((x) => x[0]);
  fns = [];

  for (let fn of cbs) {
    await fn();
  }
}

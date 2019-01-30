import logger from '~/utils/logger';
import { add as _add } from 'exits';

// Sets priority (larger runs first)
export enum ADD_TYPES {
  STOP = 3,
  CLEAN = 2,
  // File removal must go last in order for them to still exist on clean/stop
  REMOVE_TEMP_FILES = 1,
  END_LOG = -9999 - 1
}

let any = false;
export default function add(
  type: ADD_TYPES,
  message: string,
  cb: (type: string, arg: any, context: any) => any | Promise<any>
): () => void {
  if (!any) {
    any = true;
    _add(() => logger.info('\nPreparing exit'), 9999);
    _add(() => logger.info('Done'), -9999);
  }

  return _add((...args) => {
    logger.info('  ' + message);
    return cb(...args);
  }, type);
}

import logger from '~/utils/logger';
import { add as _add } from 'exits';

// Sets priority (larger runs first)
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
  cb: (type: string, arg: any, context: any) => any | Promise<any>
): () => void {
  return _add((...args) => {
    logger.info('  ' + message);
    return cb(...args);
  }, type);
}

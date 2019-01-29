import logger from '~/utils/logger';
import { add as _add } from 'exits';

export enum ADD_TYPES {
  REMOVE_TEMP_FILES = 10,
  END_LOG = 9999 + 1
}

let any = false;
export default function add(
  type: ADD_TYPES,
  message: string,
  cb: (type: string, arg: any, context: any) => void | Promise<void>
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

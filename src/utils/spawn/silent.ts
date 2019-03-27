import logger from '~/utils/logger';
import { DEFAULT_STDIO, EXIT_LOG_LEVEL_STDIO } from '~/constants';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function silent() {
  return logger.getLevel() > EXIT_LOG_LEVEL_STDIO ? 'ignore' : DEFAULT_STDIO;
}

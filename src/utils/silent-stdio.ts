import logger from 'loglevel';
import { DEFAULT_STDIO, ON_EXIT_STDIO_LOGGER_LEVEL } from '~/constants';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function silentStdio() {
  return logger.getLevel() <= ON_EXIT_STDIO_LOGGER_LEVEL
    ? DEFAULT_STDIO
    : 'ignore';
}

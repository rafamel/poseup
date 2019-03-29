import silent from '~/utils/spawn/silent';
import { DEFAULT_STDIO, EXIT_LOG_LEVEL_STDIO } from '~/constants';
import logger from '~/utils/logger';

test(`succeeds for greater than ${EXIT_LOG_LEVEL_STDIO}`, () => {
  logger.setLevel((EXIT_LOG_LEVEL_STDIO + 1) as any);
  expect(silent()).toBe('ignore');
});
test(`succeeds for less than ${EXIT_LOG_LEVEL_STDIO}`, () => {
  logger.setLevel((EXIT_LOG_LEVEL_STDIO - 1) as any);
  expect(silent()).toBe(DEFAULT_STDIO);
});

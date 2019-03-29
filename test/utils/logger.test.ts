import { DEFAULT_LOG_LEVEL } from '~/constants';
import logger, { setLevel } from '~/utils/logger';
import exitsLogger from 'exits/utils/logger';

test(`default logging level is set`, () => {
  expect(DEFAULT_LOG_LEVEL).toBe('info');
  expect(logger.getLevel()).toBe(2);
  expect(exitsLogger.getLevel()).toBe(2);
});
test(`setLevel()`, () => {
  setLevel(3);
  expect(logger.getLevel()).toBe(3);
  expect(exitsLogger.getLevel()).toBe(3);
});

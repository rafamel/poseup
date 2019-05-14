import { DEFAULT_LOG_LEVEL } from '~/constants';
import logger, { setLevel } from '~/utils/logger';

test(`default logging level is set`, () => {
  expect(DEFAULT_LOG_LEVEL).toBe('info');
  expect(logger.getLevel()).toBe(2);
});
test(`setLevel()`, () => {
  setLevel('warn');
  expect(logger.getLevel()).toBe(3);
});

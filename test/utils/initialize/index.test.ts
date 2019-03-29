import initialize from '~/utils/initialize';
import _trunk from '~/utils/initialize/trunk';
import { setLevel as _setLevel } from '~/utils/logger';
import { wait } from 'promist';

jest.mock('~/utils/initialize/trunk');
jest.mock('~/utils/logger');
const trunk: any = _trunk;
const setLevel: any = _setLevel;
trunk.mockImplementation(() => wait(500));

const env = process.env.NODE_ENV;
afterEach(() => (process.env.NODE_ENV = env));

test(`calls and waits for trunk on first run, sets log and env`, async () => {
  trunk.mockClear();
  setLevel.mockClear();
  const before = Date.now();

  await expect(
    initialize({ log: 1, environment: 'foo' })
  ).resolves.toBeUndefined();
  expect(trunk).toHaveBeenCalledTimes(1);
  expect(Date.now() - before).toBeGreaterThanOrEqual(500);
  expect(setLevel).toHaveBeenCalledTimes(1);
  expect(setLevel).toHaveBeenCalledWith(1);
  expect(process.env.NODE_ENV).toBe('foo');
});
test(`doesn't call trunk on second run`, async () => {
  trunk.mockClear();

  await expect(
    initialize({ log: 1, environment: 'foo' })
  ).resolves.toBeUndefined();
  expect(trunk).not.toHaveBeenCalled();
});
test(`succeeds w/ empty options object`, async () => {
  setLevel.mockClear();

  await expect(initialize({})).resolves.toBeUndefined();
  expect(setLevel).not.toHaveBeenCalled();
  expect(process.env.NODE_ENV).toBe(env);
});
test(`sets log when passed`, async () => {
  setLevel.mockClear();

  await expect(initialize({ log: 3 })).resolves.toBeUndefined();
  expect(setLevel).toHaveBeenCalledTimes(1);
  expect(setLevel).toHaveBeenCalledWith(3);
  expect(process.env.NODE_ENV).toBe(env);
});
test(`sets env when passed`, async () => {
  await expect(initialize({ environment: 'foo' })).resolves.toBeUndefined();
  expect(process.env.NODE_ENV).toBe('foo');
});
test(`sets log and env`, async () => {
  setLevel.mockClear();

  await expect(
    initialize({ log: 3, environment: 'foo' })
  ).resolves.toBeUndefined();
  expect(setLevel).toHaveBeenCalledTimes(1);
  expect(setLevel).toHaveBeenCalledWith(3);
  expect(process.env.NODE_ENV).toBe('foo');
});

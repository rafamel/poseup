import add, { ADD_TYPES } from '~/lifecycle/add';
import manager from '~/lifecycle/manager';
import { IOfType } from '~/types';
import { wait } from 'promist';
import { setLevel } from '~/utils/logger';

setLevel('silent');
jest.mock('~/lifecycle/manager');

const mocks: IOfType<jest.Mock> = {
  add: manager.add
} as any;

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`calls manager.add w/ fn and type`, () => {
  expect(add(ADD_TYPES.START_LOG, '', () => {})).toBeUndefined();
  expect(mocks.add).toHaveBeenCalledTimes(1);
  expect(mocks.add.mock.calls[0][0]).toBe(ADD_TYPES.START_LOG);
  expect(typeof mocks.add.mock.calls[0][1]).toBe('function');
});
test(`fn executes and is awaited for but nevers errors out`, async () => {
  const fn = jest.fn().mockImplementation(() => wait(250));
  add(ADD_TYPES.START_LOG, '', fn);
  const cb = mocks.add.mock.calls[0][1];
  expect(fn).not.toHaveBeenCalled();

  const before = Date.now();
  await expect(cb()).resolves.toBeUndefined();
  expect(fn).toHaveBeenCalledTimes(1);
  expect(Date.now() - before).toBeGreaterThanOrEqual(250);

  fn.mockImplementationOnce(() => Promise.reject(Error()));
  await expect(cb()).resolves.toBeUndefined();
  expect(fn).toHaveBeenCalledTimes(2);

  fn.mockImplementationOnce(() => {
    throw Error();
  });
  await expect(cb()).resolves.toBeUndefined();
  expect(fn).toHaveBeenCalledTimes(3);
});

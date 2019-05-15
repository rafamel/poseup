import teardown from '~/lifecycle/teardown';
import manager from '~/lifecycle/manager';
import logger from '~/utils/logger';
import { IOfType } from '~/types';
import { wait, timed } from 'promist';

logger.setLevel('silent');
jest.mock('~/lifecycle/manager');

const mocks: IOfType<jest.Mock<any, any>> = {
  get: manager.get,
  flush: manager.flush
} as any;

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`teardown calls fns in reverse order`, async () => {
  const create = (): any => jest.fn().mockImplementation(() => wait(500));
  const fns = [create(), create(), create(), create(), create()];
  const arr = fns.map((fn) => [fn, 0]);
  arr[0] = [arr[0][0], 1];
  mocks.get.mockImplementationOnce(() => arr);

  const p = timed(teardown());
  await wait(250);
  expect(fns[0]).toHaveBeenCalled();
  fns.slice(1).forEach((fn) => expect(fn).not.toHaveBeenCalled());

  await wait(500);
  expect(fns[4]).toHaveBeenCalled();
  fns.slice(1, 4).forEach((fn) => expect(fn).not.toHaveBeenCalled());

  await wait(500);
  expect(fns[3]).toHaveBeenCalled();
  fns.slice(1, 3).forEach((fn) => expect(fn).not.toHaveBeenCalled());

  await wait(500);
  expect(fns[2]).toHaveBeenCalled();
  expect(fns[1]).not.toHaveBeenCalled();

  await wait(500);
  expect(fns[1]).toHaveBeenCalled();

  await expect(p).resolves.toBeUndefined();
  expect(p.time).toBeGreaterThanOrEqual(2500);
  expect(p.time).toBeLessThanOrEqual(3500);
});
test(`teardown only executes fns once`, async () => {
  const fn = jest.fn();
  mocks.get.mockImplementationOnce(() => [[fn, 0]]);

  await expect(teardown()).resolves.toBeUndefined();
  expect(fn).toHaveBeenCalledTimes(1);
});
test(`calls flush on end`, async () => {
  const fn = jest.fn().mockImplementation(() => wait(150));
  mocks.get.mockImplementationOnce(() => [[fn, 0]]);

  const p = teardown();
  await wait(75);
  expect(fn).toHaveBeenCalled();
  expect(mocks.flush).not.toHaveBeenCalled();
  await expect(p).resolves.toBeUndefined();
  expect(mocks.flush).toHaveBeenCalled();
});

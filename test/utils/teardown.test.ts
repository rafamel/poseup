import { add, toTeardown, teardown } from '~/utils/teardown';
import logger from '~/utils/logger';
import { add as _add } from 'exits';
import { IOfType } from '~/types';
import { isAttached } from '~/utils/attach';
import { wait, timed } from 'promist';

logger.setLevel('silent');
jest.mock('exits');
jest.mock('~/utils/attach');

const mocks: IOfType<jest.Mock<any, any>> = {
  add: _add,
  isAttached
} as any;

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`toTeardown() = false before add is called`, () => {
  expect(toTeardown()).toBe(false);
});
test(`successfully calls exits add()`, () => {
  const fn = jest.fn();
  expect(add(1, '', fn)).toBeUndefined();
  expect(mocks.add).toHaveBeenCalledTimes(1);
  expect(typeof mocks.add.mock.calls[0][0]).toBe('function');
  expect(mocks.add.mock.calls[0][1]).toBe(1);

  expect(fn).not.toHaveBeenCalled();
  mocks.add.mock.calls[0][0]();
  expect(fn).toHaveBeenCalledTimes(1);
});
test(`toTeardown() = true after add is called`, () => {
  expect(toTeardown()).toBe(true);
});
test(`doesn't call add() if isAttached() = false`, () => {
  mocks.isAttached.mockImplementationOnce(() => false);

  expect(add(1, '', () => {})).toBeUndefined();
  expect(mocks.add).not.toHaveBeenCalled();
});
test(`teardown calls fns in reverse type order`, async () => {
  mocks.isAttached.mockImplementation(() => false);
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const create = () => jest.fn().mockImplementation(() => wait(500));
  const fns = [create(), create(), create(), create(), create()];

  add(3, '', fns[3]);
  add(1, '', fns[1]);
  add(4, '', fns[4]);
  add(-1, '', fns[0]);
  add(2, '', fns[2]);

  fns.forEach((fn) => expect(fn).not.toHaveBeenCalled());

  const p = timed(teardown());
  await wait(250);
  expect(fns[4]).toHaveBeenCalled();
  fns.slice(0, 4).forEach((fn) => expect(fn).not.toHaveBeenCalled());

  await wait(500);
  expect(fns[3]).toHaveBeenCalled();
  fns.slice(0, 3).forEach((fn) => expect(fn).not.toHaveBeenCalled());

  await wait(500);
  expect(fns[2]).toHaveBeenCalled();
  fns.slice(0, 2).forEach((fn) => expect(fn).not.toHaveBeenCalled());

  await wait(500);
  expect(fns[1]).toHaveBeenCalled();
  expect(fns[0]).not.toHaveBeenCalled();

  await wait(500);
  expect(fns[0]).toHaveBeenCalled();

  await expect(p).resolves.toBeUndefined();
  expect(p.time).toBeGreaterThanOrEqual(2500);
  expect(p.time).toBeLessThanOrEqual(3500);

  mocks.isAttached.mockImplementation(() => true);
});
test(`teardown only executes fns once`, async () => {
  mocks.isAttached.mockImplementation(() => false);
  const fn = jest.fn();
  add(1, '', fn);

  await expect(teardown()).resolves.toBeUndefined();
  expect(fn).toHaveBeenCalledTimes(1);

  await expect(teardown()).resolves.toBeUndefined();
  expect(fn).toHaveBeenCalledTimes(1);

  mocks.isAttached.mockImplementation(() => true);
});
test(`teardown only executes fns added when !isAttached()`, async () => {
  mocks.isAttached.mockImplementationOnce(() => false);
  const fns = [jest.fn(), jest.fn()];

  add(1, '', fns[0]);
  add(1, '', fns[1]);

  await expect(teardown()).resolves.toBeUndefined();
  expect(fns[0]).toHaveBeenCalledTimes(1);
  expect(fns[1]).not.toHaveBeenCalled();
});

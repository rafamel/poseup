import manager from '~/lifecycle/manager';
import { attach, add } from 'exits';
import { IOfType } from '~/types';
import { ADD_TYPES } from '~/lifecycle';

jest.mock('exits');
const mocks: IOfType<jest.Mock> = {
  attach,
  add
} as any;

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`get`, () => {
  expect(manager.get()).toEqual([]);
  const fns = manager.get();
  fns.push([ADD_TYPES.START_LOG, () => {}]);
  expect(manager.get()).toEqual([]);
});
test(`isPending`, () => {
  expect(manager.isPending()).toBe(false);
});
test(`add wo/ attachment`, () => {
  const fns = [(): void => {}, (): void => {}];
  expect(manager.add(ADD_TYPES.START_LOG, fns[0])).toBeUndefined();
  expect(manager.add(ADD_TYPES.STOP, fns[1])).toBeUndefined();
  expect(mocks.add).not.toHaveBeenCalled();

  const arr = manager.get();
  expect(arr).toHaveLength(2);
  expect(arr[0][0]).toBe(ADD_TYPES.START_LOG);
  expect(arr[0][1]).toBe(fns[0]);
  expect(arr[1][0]).toBe(ADD_TYPES.STOP);
  expect(arr[1][1]).toBe(fns[1]);
  expect(manager.isPending()).toBe(true);
});
test(`isAttached`, () => {
  expect(manager.isAttached()).toBe(false);
});
test(`attach`, () => {
  expect(manager.attach()).toBeUndefined();
  expect(mocks.attach).toHaveBeenCalledTimes(1);
  expect(mocks.attach).toHaveBeenCalledWith();
  expect(mocks.add).toHaveBeenCalledTimes(2);
  expect(mocks.add.mock.calls[0][0]).toBe(ADD_TYPES.START_LOG);
  expect(mocks.add.mock.calls[1][0]).toBe(ADD_TYPES.STOP);
  expect(manager.get()).toHaveLength(2);
  expect(manager.isAttached()).toBe(true);
});
test(`attach doesn't run twice`, () => {
  expect(manager.attach()).toBeUndefined();
  expect(mocks.attach).not.toHaveBeenCalled();
  expect(mocks.add).not.toHaveBeenCalled();
  expect(manager.get()).toHaveLength(2);
});
test(`add w/ attachment`, () => {
  const fn = (): void => {};
  expect(manager.add(ADD_TYPES.CLEAN, fn)).toBeUndefined();

  expect(mocks.add).toHaveBeenCalledTimes(1);
  expect(mocks.add.mock.calls[0][0]).toBe(ADD_TYPES.CLEAN);
  expect(mocks.add.mock.calls[0][1]).toBe(fn);

  const arr = manager.get();
  expect(arr).toHaveLength(3);
  expect(arr[2][0]).toBe(ADD_TYPES.CLEAN);
  expect(arr[2][1]).toBe(fn);
});
test(`flush`, () => {
  expect(manager.flush()).toBeUndefined();
  expect(manager.get()).toHaveLength(0);
  expect(manager.isPending()).toBe(false);
});

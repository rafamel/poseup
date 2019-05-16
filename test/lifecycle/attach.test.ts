import attach from '~/lifecycle/attach';
import manager from '~/lifecycle/manager';
import { options, resolver, on, add } from 'exits';
import { IOfType } from '~/types';
import { ADD_TYPES } from '~/lifecycle';
import { setLevel } from '~/utils/logger';

setLevel('silent');
jest.mock('~/lifecycle/manager');
jest.mock('exits');
const mocks: IOfType<jest.Mock> = {
  isAttached: manager.isAttached,
  attach: manager.attach,
  isPending: manager.isPending,
  flush: manager.flush,
  options,
  resolver,
  on,
  add
} as any;

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`doesn't run if manager.isAttached()`, () => {
  mocks.isAttached.mockImplementationOnce(() => true);
  expect(attach()).toBeUndefined();
  expect(mocks.attach).not.toHaveBeenCalled();
  expect(mocks.options).not.toHaveBeenCalled();
  expect(mocks.on).not.toHaveBeenCalled();
  expect(mocks.add).not.toHaveBeenCalled();
});
test(`runs if !manager.isAttached()`, () => {
  expect(attach()).toBeUndefined();
  expect(mocks.attach).toHaveBeenCalledTimes(1);
  expect(mocks.options).toHaveBeenCalledTimes(1);
  expect(mocks.on).toHaveBeenCalledTimes(2);
  expect(mocks.add).toHaveBeenCalledTimes(1);
  expect(mocks.isPending).not.toHaveBeenCalled();
  expect(mocks.resolver).not.toHaveBeenCalled();
  expect(mocks.flush).not.toHaveBeenCalled();
});
test(`exits options`, () => {
  expect(attach()).toBeUndefined();
  expect(mocks.options).toHaveBeenCalledTimes(1);
  expect(mocks.options.mock.calls[0][0]).toHaveProperty('spawned', {
    signals: 'none',
    wait: 'all'
  });
  expect(typeof mocks.options.mock.calls[0][0].resolver).toBe('function');

  const resolver = mocks.options.mock.calls[0][0].resolver;
  expect(mocks.resolver).not.toHaveBeenCalled();
  resolver('signal', 'SIGTERM');
  expect(mocks.resolver).toHaveBeenCalledWith('exit', 1);
  resolver('exit', 0);
  expect(mocks.resolver).toHaveBeenCalledWith('exit', 0);
  expect(mocks.resolver).toHaveBeenCalledTimes(2);
});
test(`hooks`, () => {
  for (let i of [0, 1]) {
    mocks.on.mockClear();
    mocks.add.mockClear();
    if (i > 0) mocks.isPending.mockImplementation(() => true);

    expect(attach()).toBeUndefined();
    expect(mocks.on).toHaveBeenCalledTimes(2);
    expect(mocks.on.mock.calls[0][0]).toBe('triggered');
    expect(typeof mocks.on.mock.calls[0][1]).toBe('function');
    expect(mocks.on.mock.calls[1][0]).toBe('done');
    expect(typeof mocks.on.mock.calls[1][1]).toBe('function');
    expect(mocks.add).toHaveBeenCalledTimes(1);
    expect(mocks.add.mock.calls[0][0]).toBe(ADD_TYPES.START_LOG);
    expect(typeof mocks.add.mock.calls[0][1]).toBe('function');

    const triggered = mocks.on.mock.calls[0][1];
    const done = mocks.on.mock.calls[1][1];
    const added = mocks.add.mock.calls[0][1];

    expect(triggered).not.toThrow();
    expect(done).not.toThrow();
    expect(added).not.toThrow();
    if (i > 0) expect(mocks.flush).toHaveBeenCalledTimes(1);
    else expect(mocks.flush).not.toHaveBeenCalled();
  }

  mocks.isPending.mockReset();
});

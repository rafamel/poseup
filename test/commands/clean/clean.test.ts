import clean from '~/commands/clean/clean';
import initialize from '~/utils/initialize';
import getCmd from '~/commands/clean/get-cmd';
import builder from '~/builder';
import spawn from '~/utils/spawn';
import { wait } from 'promist';
import { IOfType } from '~/types';

jest.mock('~/utils/initialize');
jest.mock('~/commands/clean/get-cmd');
jest.mock('~/builder');
jest.mock('~/utils/spawn');

const mocks: IOfType<jest.Mock<any, any>> = {
  initialize,
  getCmd,
  builder,
  spawn
} as any;
beforeEach(() => Object.values(mocks).forEach((mocks) => mocks.mockClear()));

mocks.builder.mockImplementation(() => Promise.resolve('builder'));

describe(`initialize call`, () => {
  test(`succeeds`, async () => {
    mocks.initialize.mockImplementation(() => wait(200));

    const before = Date.now();
    const opts = { volumes: true };
    await expect(clean(opts)).resolves.toBeUndefined();
    await expect(clean()).resolves.toBeUndefined();
    expect(Date.now() - before).toBeGreaterThanOrEqual(400);

    expect(mocks.initialize).toHaveBeenCalledTimes(2);
    expect(mocks.initialize).toHaveBeenNthCalledWith(1, opts);
    expect(mocks.initialize).toHaveBeenNthCalledWith(2, {});

    mocks.initialize.mockImplementation(() => Promise.resolve());
  });
  test(`fails`, async () => {
    mocks.initialize.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(clean()).rejects.toBeInstanceOf(Error);
  });
});
describe(`builder call`, () => {
  test(`succeeds`, async () => {
    const opts = { volumes: true };
    await expect(clean(opts)).resolves.toBeUndefined();
    expect(mocks.builder).toHaveBeenCalledTimes(1);
    expect(mocks.builder).toHaveBeenCalledWith(opts);
  });
  test(`fails`, async () => {
    mocks.builder.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(clean()).rejects.toBeInstanceOf(Error);
  });
});
describe(`getCmd call`, () => {
  test(`succeeds`, async () => {
    await expect(clean({ volumes: true })).resolves.toBeUndefined();
    await expect(clean()).resolves.toBeUndefined();
    expect(mocks.getCmd).toHaveBeenCalledTimes(2);
    expect(mocks.getCmd).toHaveBeenNthCalledWith(1, 'builder', true);
    expect(mocks.getCmd).toHaveBeenNthCalledWith(2, 'builder', undefined);
  });
  test(`fails`, async () => {
    mocks.getCmd.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(clean()).rejects.toBeInstanceOf(Error);
  });
});
describe(`spawn call`, () => {
  test(`succeeds`, async () => {
    await expect(clean()).resolves.toBeUndefined();
    expect(mocks.spawn).toHaveBeenCalledTimes(1);
    expect(mocks.spawn).toHaveBeenCalledWith('foo', ['down', 'bar', 'baz']);
  });
  test(`fails`, async () => {
    mocks.spawn.mockImplementationOnce(() => Promise.reject(Error()));

    await expect(clean()).rejects.toBeInstanceOf(Error);
  });
});

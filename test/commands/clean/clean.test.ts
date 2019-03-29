import clean from '~/commands/clean/clean';
import _initialize from '~/utils/initialize';
import _getCmd from '~/commands/clean/get-cmd';
import _builder from '~/builder';
import _spawn from '~/utils/spawn';
import { wait } from 'promist';

const initialize: any = _initialize;
const getCmd: any = _getCmd;
const builder: any = _builder;
const spawn: any = _spawn;
jest.mock('~/utils/initialize');
jest.mock('~/commands/clean/get-cmd');
jest.mock('~/builder');
jest.mock('~/utils/spawn');

builder.mockImplementation(() => Promise.resolve('builder'));

describe(`initialize call`, () => {
  test(`succeeds`, async () => {
    initialize.mockClear();
    initialize.mockImplementation(() => wait(200));

    const before = Date.now();
    const opts = { volumes: true };
    await expect(clean(opts)).resolves.toBeUndefined();
    await expect(clean()).resolves.toBeUndefined();
    expect(Date.now() - before).toBeGreaterThanOrEqual(400);

    expect(initialize).toHaveBeenCalledTimes(2);
    expect(initialize).toHaveBeenNthCalledWith(1, opts);
    expect(initialize).toHaveBeenNthCalledWith(2, {});

    initialize.mockImplementation(() => Promise.resolve());
  });
  test(`fails`, async () => {
    initialize.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(clean()).rejects.toBeInstanceOf(Error);
  });
});
describe(`builder call`, () => {
  test(`succeeds`, async () => {
    builder.mockClear();

    const opts = { volumes: true };
    await expect(clean(opts)).resolves.toBeUndefined();
    expect(builder).toHaveBeenCalledTimes(1);
    expect(builder).toHaveBeenCalledWith(opts);
  });
  test(`fails`, async () => {
    builder.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(clean()).rejects.toBeInstanceOf(Error);
  });
});
describe(`getCmd call`, () => {
  test(`succeeds`, async () => {
    getCmd.mockClear();

    await expect(clean({ volumes: true })).resolves.toBeUndefined();
    await expect(clean()).resolves.toBeUndefined();
    expect(getCmd).toHaveBeenCalledTimes(2);
    expect(getCmd).toHaveBeenNthCalledWith(1, 'builder', true);
    expect(getCmd).toHaveBeenNthCalledWith(2, 'builder', undefined);
  });
  test(`fails`, async () => {
    getCmd.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(clean()).rejects.toBeInstanceOf(Error);
  });
});
describe(`spawn call`, () => {
  test(`succeeds`, async () => {
    spawn.mockClear();

    await expect(clean()).resolves.toBeUndefined();
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledWith('foo', ['down', 'bar', 'baz']);
  });
  test(`fails`, async () => {
    spawn.mockImplementationOnce(() => Promise.reject(Error()));

    await expect(clean()).rejects.toBeInstanceOf(Error);
  });
});
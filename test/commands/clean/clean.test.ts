import clean from '../../../src/commands/clean/clean';
import _initialize from '../../../src/utils/initialize';
import _getCmd from '../../../src/commands/clean/get-cmd';
import _builder from '../../../src/builder';
import _spawn from '../../../src/utils/spawn';
import { wait } from 'promist';

const initialize: any = _initialize;
const getCmd: any = _getCmd;
const builder: any = _builder;
const spawn: any = _spawn;
jest.mock('../../../src/utils/initialize');
jest.mock('../../../src/commands/clean/get-cmd');
jest.mock('../../../src/builder');
jest.mock('../../../src/utils/spawn');

initialize.mockImplementation(() => Promise.resolve());
getCmd.mockImplementation(() =>
  Promise.resolve({ cmd: 'foobar', args: ['foo', 'bar', 'baz'] })
);
builder.mockImplementation(() => Promise.resolve('builder'));
spawn.mockImplementation(() => Promise.resolve(null));

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
    expect(spawn).toHaveBeenCalledWith('foobar', ['foo', 'bar', 'baz']);
  });
  test(`fails`, async () => {
    spawn.mockImplementationOnce(() => Promise.reject(Error()));

    await expect(clean()).rejects.toBeInstanceOf(Error);
  });
});

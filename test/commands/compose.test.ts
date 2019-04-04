import compose from '~/commands/compose';
import _initialize from '~/utils/initialize';
import _builder from '~/builder';
import _write from '~/utils/write-yaml';
import { getCmd as _getCleanCmd } from '~/commands/clean';
import _add from '~/utils/add';
import _spawn from '~/utils/spawn';
import { STOP_WAIT_TIME } from '~/constants';
import path from 'path';

const initialize: any = _initialize;
const builder: any = _builder;
const write: any = _write;
const getCleanCmd: any = _getCleanCmd;
const add: any = _add;
const spawn: any = _spawn;

jest.mock('~/utils/initialize');
jest.mock('~/builder');
jest.mock('~/utils/write-yaml');
jest.mock('~/commands/clean');
jest.mock('~/utils/add');
jest.mock('~/utils/spawn');

describe(`initialize call`, () => {
  test(`succeeds`, async () => {
    initialize.mockClear();

    await expect(compose()).resolves.toBeUndefined();
    await expect(compose({ foo: 'bar' } as any)).resolves.toBeUndefined();
    expect(initialize).toHaveBeenCalledTimes(2);
    expect(initialize).toHaveBeenNthCalledWith(1, {});
    expect(initialize).toHaveBeenNthCalledWith(2, { foo: 'bar' });
  });
  test(`fails`, async () => {
    initialize.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(compose()).rejects.toBeInstanceOf(Error);
  });
});
describe(`builder call`, () => {
  test(`succeeds`, async () => {
    builder.mockClear();

    await expect(compose({ foo: 'bar' } as any)).resolves.toBeUndefined();
    expect(builder).toHaveBeenCalledTimes(1);
    expect(builder).toHaveBeenCalledWith({ foo: 'bar' });
  });
  test(`fails`, async () => {
    builder.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(compose()).rejects.toBeInstanceOf(Error);
  });
});
describe(`write call`, () => {
  test(`succeeds for relative path`, async () => {
    write.mockClear();

    await expect(compose()).resolves.toBeUndefined();
    await expect(compose({ write: 'baz' })).resolves.toBeUndefined();
    expect(write).toHaveBeenCalledTimes(2);
    expect(write).toHaveBeenNthCalledWith(1, {
      data: { services: { foo: {}, bar: {} } }
    });
    expect(write).toHaveBeenNthCalledWith(2, {
      data: { services: { foo: {}, bar: {} } },
      path: path.join(process.cwd(), 'baz')
    });
  });
  test(`succeeds for absolute path`, async () => {
    write.mockClear();

    await expect(compose({ write: '/foo/bar/baz' })).resolves.toBeUndefined();
    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith({
      data: { services: { foo: {}, bar: {} } },
      path: '/foo/bar/baz'
    });
  });
  test(`fails`, async () => {
    write.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(compose()).rejects.toBeInstanceOf(Error);
  });
});
describe(`builder.getCmd call`, () => {
  test(`succeeds`, async () => {
    let args: any[] = [];
    builder.mockImplementationOnce(async () => {
      const ans = await builder();
      return {
        ...ans,
        getCmd(...x: any[]) {
          args = x;
          return ans.getCmd();
        }
      };
    });

    await expect(compose()).resolves.toBeUndefined();
    expect(args).toEqual([{ file: 'foo/bar/baz.js' }]);
  });
  test(`fails`, async () => {
    builder.mockImplementationOnce(async () => {
      const ans = await builder();
      return {
        ...ans,
        getCmd() {
          throw Error();
        }
      };
    });
    await expect(compose()).rejects.toBeInstanceOf(Error);
  });
});
describe(`options.dry`, () => {
  test(`succeeds w/ dry + write`, async () => {
    await expect(
      compose({ dry: true, write: 'foo/bar' })
    ).resolves.toBeUndefined();
  });
  test(`fails if dry + !write`, async () => {
    await expect(compose({ dry: true })).rejects.toBeInstanceOf(Error);
  });
  test(`fails if dry + clean`, async () => {
    await expect(
      compose({ dry: true, clean: true, write: 'foo/bar' })
    ).rejects.toBeInstanceOf(Error);
  });
  test(`fails if dry + stop`, async () => {
    await expect(
      compose({ dry: true, stop: true, write: 'foo/bar' })
    ).rejects.toBeInstanceOf(Error);
  });
  test(`fails if dry + stop + clean`, async () => {
    await expect(
      compose({ dry: true, stop: true, clean: true, write: 'foo/bar' })
    ).rejects.toBeInstanceOf(Error);
  });
  test(`calls initialize, builder, write, on dry & !dry`, async () => {
    initialize.mockClear();
    builder.mockClear();
    write.mockClear();

    await expect(compose()).resolves.toBeUndefined();
    await expect(compose({ dry: false })).resolves.toBeUndefined();
    await expect(
      compose({ dry: true, write: 'foo/bar' })
    ).resolves.toBeUndefined();

    expect(initialize).toHaveBeenCalledTimes(3);
    expect(builder).toHaveBeenCalledTimes(3);
    expect(write).toHaveBeenCalledTimes(3);
  });
  test(`only calls spawn on !dry`, async () => {
    spawn.mockClear();

    await expect(
      compose({ dry: true, write: 'foo/bar' })
    ).resolves.toBeUndefined();
    expect(spawn).not.toHaveBeenCalled();

    await expect(compose({ dry: false })).resolves.toBeUndefined();
    await expect(compose()).resolves.toBeUndefined();
    expect(spawn).toHaveBeenCalledTimes(2);
  });
});
describe(`options.stop & options.clean`, () => {
  test(`doesn't call add on !stop && !clean`, async () => {
    add.mockClear();
    await expect(compose()).resolves.toBeUndefined();
    expect(add).not.toHaveBeenCalled();
  });
  test(`calls add on stop || clean`, async () => {
    add.mockClear();
    await expect(compose({ stop: true })).resolves.toBeUndefined();
    expect(add).toHaveBeenCalledTimes(1);
    await expect(compose({ clean: true })).resolves.toBeUndefined();
    expect(add).toHaveBeenCalledTimes(2);
    await expect(compose({ stop: true, clean: true })).resolves.toBeUndefined();
    expect(add).toHaveBeenCalledTimes(4);
  });
  test(`stop add callback calls spawn`, async () => {
    add.mockClear();
    let args: any[] = [];
    add.mockImplementationOnce((...x: any[]) => (args = x));

    await expect(compose({ stop: true })).resolves.toBeUndefined();
    spawn.mockClear();
    expect(typeof args[2]).toBe('function');
    await expect(args[2]()).resolves.toBe(null);
    expect(spawn).toHaveBeenCalledWith('foo', [
      'bar',
      'baz',
      'stop',
      '-t',
      String(STOP_WAIT_TIME)
    ]);
  });
  test(`clean add callback calls getCleanCmd & spawn`, async () => {
    add.mockClear();
    let args: any[] = [];
    add.mockImplementationOnce((...x: any[]) => (args = x));

    await expect(compose({ clean: true })).resolves.toBeUndefined();
    spawn.mockClear();
    getCleanCmd.mockClear();
    expect(typeof args[2]).toBe('function');
    await expect(args[2]()).resolves.toBe(null);
    expect(getCleanCmd).toHaveBeenCalled();
    expect(getCleanCmd.mock.calls[0][0]).toHaveProperty('config', {
      compose: { services: { bar: {}, foo: {} } },
      project: 'foo'
    });
    expect(getCleanCmd.mock.calls[0][0]).toHaveProperty('getCmd');
    expect(getCleanCmd.mock.calls[0][0].getCmd()).toEqual({
      cmd: 'foo',
      args: ['bar', 'baz']
    });
    expect(spawn).toHaveBeenCalledWith('foo', ['down', 'bar', 'baz']);
  });
});
describe(`spawn call`, () => {
  test(`succeeds`, async () => {
    spawn.mockClear();
    await expect(compose()).resolves.toBeUndefined();
    expect(spawn).toHaveBeenLastCalledWith('foo', ['bar', 'baz']);
  });
  test(`succeeds w/ args`, async () => {
    spawn.mockClear();
    await expect(
      compose({ args: ['--foo', 'foobar'] })
    ).resolves.toBeUndefined();
    expect(spawn).toHaveBeenLastCalledWith('foo', [
      'bar',
      'baz',
      '--foo',
      'foobar'
    ]);
  });
  test(`fails`, async () => {
    spawn.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(compose()).rejects.toBeInstanceOf(Error);
  });
  test(`fails on signal`, async () => {
    spawn.mockImplementationOnce(async () => 'SIGINT');
    await expect(compose()).rejects.toBeInstanceOf(Error);
  });
});

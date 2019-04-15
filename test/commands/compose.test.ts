import compose from '~/commands/compose';
import initialize from '~/utils/initialize';
import builder from '~/builder';
import write from '~/utils/write-yaml';
import { getCmd as getCleanCmd } from '~/commands/clean';
import { add } from '~/utils/teardown';
import spawn from '~/utils/spawn';
import { STOP_WAIT_TIME } from '~/constants';
import path from 'path';
import { IOfType } from '~/types';

jest.mock('~/utils/initialize');
jest.mock('~/builder');
jest.mock('~/utils/write-yaml');
jest.mock('~/commands/clean');
jest.mock('~/utils/teardown');
jest.mock('~/utils/spawn');

const mocks: IOfType<jest.Mock<any, any>> = {
  initialize,
  builder,
  write,
  getCleanCmd,
  add,
  spawn
} as any;

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

describe(`initialize call`, () => {
  test(`succeeds`, async () => {
    await expect(compose()).resolves.toBeUndefined();
    await expect(compose({ foo: 'bar' } as any)).resolves.toBeUndefined();
    expect(mocks.initialize).toHaveBeenCalledTimes(2);
    expect(mocks.initialize).toHaveBeenNthCalledWith(1, {});
    expect(mocks.initialize).toHaveBeenNthCalledWith(2, { foo: 'bar' });
  });
  test(`fails`, async () => {
    mocks.initialize.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(compose()).rejects.toBeInstanceOf(Error);
  });
});
describe(`builder call`, () => {
  test(`succeeds`, async () => {
    await expect(compose({ foo: 'bar' } as any)).resolves.toBeUndefined();
    expect(mocks.builder).toHaveBeenCalledTimes(1);
    expect(mocks.builder).toHaveBeenCalledWith({ foo: 'bar' });
  });
  test(`fails`, async () => {
    mocks.builder.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(compose()).rejects.toBeInstanceOf(Error);
  });
});
describe(`write call`, () => {
  test(`succeeds for relative path`, async () => {
    await expect(compose()).resolves.toBeUndefined();
    await expect(compose({ write: 'baz' })).resolves.toBeUndefined();
    expect(mocks.write).toHaveBeenCalledTimes(2);
    expect(mocks.write).toHaveBeenNthCalledWith(1, {
      data: { services: { foo: {}, bar: {} } }
    });
    expect(mocks.write).toHaveBeenNthCalledWith(2, {
      data: { services: { foo: {}, bar: {} } },
      path: path.join(process.cwd(), 'baz')
    });
  });
  test(`succeeds for absolute path`, async () => {
    await expect(compose({ write: '/foo/bar/baz' })).resolves.toBeUndefined();
    expect(mocks.write).toHaveBeenCalledTimes(1);
    expect(mocks.write).toHaveBeenCalledWith({
      data: { services: { foo: {}, bar: {} } },
      path: '/foo/bar/baz'
    });
  });
  test(`fails`, async () => {
    mocks.write.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(compose()).rejects.toBeInstanceOf(Error);
  });
});
describe(`builder.getCmd call`, () => {
  test(`succeeds`, async () => {
    let args: any[] = [];
    mocks.builder.mockImplementationOnce(async () => {
      const ans = await mocks.builder();
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
    mocks.builder.mockImplementationOnce(async () => {
      const ans = await mocks.builder();
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
    await expect(compose()).resolves.toBeUndefined();
    await expect(compose({ dry: false })).resolves.toBeUndefined();
    await expect(
      compose({ dry: true, write: 'foo/bar' })
    ).resolves.toBeUndefined();

    expect(mocks.initialize).toHaveBeenCalledTimes(3);
    expect(mocks.builder).toHaveBeenCalledTimes(3);
    expect(mocks.write).toHaveBeenCalledTimes(3);
  });
  test(`only calls spawn on !dry`, async () => {
    await expect(
      compose({ dry: true, write: 'foo/bar' })
    ).resolves.toBeUndefined();
    expect(mocks.spawn).not.toHaveBeenCalled();

    await expect(compose({ dry: false })).resolves.toBeUndefined();
    await expect(compose()).resolves.toBeUndefined();
    expect(mocks.spawn).toHaveBeenCalledTimes(2);
  });
});
describe(`options.stop & options.clean`, () => {
  test(`doesn't call add on !stop && !clean`, async () => {
    await expect(compose()).resolves.toBeUndefined();
    expect(mocks.add).not.toHaveBeenCalled();
  });
  test(`calls add on stop || clean`, async () => {
    await expect(compose({ stop: true })).resolves.toBeUndefined();
    expect(mocks.add).toHaveBeenCalledTimes(1);
    await expect(compose({ clean: true })).resolves.toBeUndefined();
    expect(mocks.add).toHaveBeenCalledTimes(2);
    await expect(compose({ stop: true, clean: true })).resolves.toBeUndefined();
    expect(mocks.add).toHaveBeenCalledTimes(4);
  });
  test(`stop add callback calls spawn`, async () => {
    let args: any[] = [];
    mocks.add.mockImplementationOnce((...x: any[]) => (args = x));

    await expect(compose({ stop: true })).resolves.toBeUndefined();
    expect(typeof args[2]).toBe('function');
    await expect(args[2]()).resolves.toBe(null);
    expect(mocks.spawn).toHaveBeenCalledWith('foo', [
      'bar',
      'baz',
      'stop',
      '-t',
      String(STOP_WAIT_TIME)
    ]);
  });
  test(`clean add callback calls getCleanCmd & spawn`, async () => {
    let args: any[] = [];
    mocks.add.mockImplementationOnce((...x: any[]) => (args = x));

    await expect(compose({ clean: true })).resolves.toBeUndefined();
    expect(typeof args[2]).toBe('function');
    await expect(args[2]()).resolves.toBe(null);
    expect(mocks.getCleanCmd).toHaveBeenCalled();
    expect(mocks.getCleanCmd.mock.calls[0][0]).toHaveProperty('config', {
      project: 'foo',
      tasks: { bar: {}, foo: {} },
      compose: { services: { bar: {}, foo: {} } }
    });
    expect(mocks.getCleanCmd.mock.calls[0][0]).toHaveProperty('getCmd');
    expect(mocks.getCleanCmd.mock.calls[0][0].getCmd()).toEqual({
      cmd: 'foo',
      args: ['bar', 'baz']
    });
    expect(mocks.spawn).toHaveBeenCalledWith('foo', ['down', 'bar', 'baz']);
  });
});
describe(`spawn call`, () => {
  test(`succeeds`, async () => {
    await expect(compose()).resolves.toBeUndefined();
    expect(mocks.spawn).toHaveBeenLastCalledWith('foo', ['bar', 'baz']);
  });
  test(`succeeds w/ args`, async () => {
    await expect(
      compose({ args: ['--foo', 'foobar'] })
    ).resolves.toBeUndefined();
    expect(mocks.spawn).toHaveBeenLastCalledWith('foo', [
      'bar',
      'baz',
      '--foo',
      'foobar'
    ]);
  });
  test(`fails`, async () => {
    mocks.spawn.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(compose()).rejects.toBeInstanceOf(Error);
  });
  test(`fails on signal`, async () => {
    mocks.spawn.mockImplementationOnce(async () => 'SIGINT');
    await expect(compose()).rejects.toBeInstanceOf(Error);
  });
});

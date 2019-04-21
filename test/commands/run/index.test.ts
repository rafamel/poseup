import run from '~/commands/run';
import initialize from '~/utils/initialize';
import builder from '~/builder';
import list from '~/commands/run/list';
import { getCmd as getCleanCmd } from '~/commands/clean';
import spawn from '~/utils/spawn';
import write from '~/utils/write-yaml';
import { add } from '~/utils/teardown';
import runTask from '~/commands/run/task';
import { setLevel } from '~/utils/logger';
import { wait } from 'promist';
import { STOP_WAIT_TIME } from '~/constants';
import { IOfType } from '~/types';

setLevel('silent');
jest.mock('~/utils/initialize');
jest.mock('~/builder');
jest.mock('~/commands/run/list');
jest.mock('~/commands/clean');
jest.mock('~/utils/spawn');
jest.mock('~/utils/write-yaml');
jest.mock('~/utils/teardown');
jest.mock('~/commands/run/task');

const mocks: IOfType<jest.Mock<any, any>> = {
  initialize,
  builder,
  list,
  getCleanCmd,
  spawn,
  write,
  add,
  runTask
} as any;
beforeEach(() => Object.values(mocks).forEach((mocks) => mocks.mockClear()));

const opts = { tasks: ['foo', 'bar'] };
describe(`initialize call`, () => {
  test(`succeeds`, async () => {
    mocks.initialize.mockImplementation(() => wait(200));

    const before = Date.now();
    await expect(run(opts)).resolves.toBeUndefined();
    await expect(run({ ...opts, list: false })).resolves.toBeUndefined();
    await expect(run({ list: true })).resolves.toBeUndefined();
    expect(Date.now() - before).toBeGreaterThanOrEqual(600);

    expect(mocks.initialize).toHaveBeenCalledTimes(3);
    expect(mocks.initialize).toHaveBeenNthCalledWith(1, opts);
    expect(mocks.initialize).toHaveBeenNthCalledWith(2, {
      ...opts,
      list: false
    });
    expect(mocks.initialize).toHaveBeenNthCalledWith(3, { list: true });

    mocks.initialize.mockImplementation(() => Promise.resolve());
  });
  test(`fails`, async () => {
    mocks.initialize.mockImplementationOnce(() => Promise.reject(Error()));

    await expect(run(opts)).rejects.toThrowError();
    await expect(mocks.builder).not.toHaveBeenCalled();
  });
});
describe(`builder call`, () => {
  test(`succeeds`, async () => {
    await expect(run(opts)).resolves.toBeUndefined();
    await expect(run({ list: true })).resolves.toBeUndefined();
    expect(mocks.builder).toHaveBeenCalledTimes(2);
    expect(mocks.builder).toHaveBeenNthCalledWith(1, opts);
    expect(mocks.builder).toHaveBeenNthCalledWith(2, { list: true });
  });
  test(`fails`, async () => {
    mocks.builder.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(run(opts)).rejects.toThrowError();
    mocks.builder.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(run({ list: true })).rejects.toThrowError();

    expect(mocks.getCleanCmd).not.toHaveBeenCalled();
    expect(mocks.spawn).not.toHaveBeenCalled();
    expect(mocks.list).not.toHaveBeenCalled();
  });
});
describe(`list call`, () => {
  test(`succeeds`, async () => {
    await expect(run(opts)).resolves.toBeUndefined();
    expect(mocks.list).not.toHaveBeenCalled();

    mocks.getCleanCmd.mockClear();
    mocks.spawn.mockClear();
    await expect(
      run({ list: true, foo: 'bar' } as any)
    ).resolves.toBeUndefined();
    expect(mocks.getCleanCmd).not.toHaveBeenCalled();
    expect(mocks.spawn).not.toHaveBeenCalled();
    expect(mocks.list).toHaveBeenCalledTimes(1);
    expect(mocks.list).toHaveBeenCalledWith(
      { list: true, foo: 'bar' },
      {
        project: 'foo',
        tasks: { bar: {}, foo: {} },
        compose: { services: { bar: {}, foo: {} } }
      }
    );
  });
  test(`fails`, async () => {
    mocks.list.mockImplementationOnce(() => {
      throw Error();
    });

    await expect(run({ list: true })).rejects.toThrowError();
  });
});
describe(`control/trunk call`, () => {
  describe(`safety checks`, () => {
    test(`fails when opts wo/ tasks`, async () => {
      await expect(
        run({ list: false })
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"No tasks to run"`);
      await expect(run({ list: false, tasks: [] })).rejects.toThrowError();
    });
    test(`fails when config wo/ tasks`, async () => {
      mocks.builder.mockImplementationOnce(async () => {
        const ans = await builder();
        return {
          ...ans,
          config: { ...ans.config, tasks: undefined }
        };
      });
      await expect(run(opts)).rejects.toThrowErrorMatchingInlineSnapshot(
        `"There are no tasks defined"`
      );
    });
    test(`fails when task in opts doesn't exist in config`, async () => {
      await expect(
        run({ tasks: ['foo', 'baz'] })
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"Task baz is not defined"`);
    });
  });
  describe(`sandbox`, () => {
    test(`doesn't change project name on sandbox = false`, async () => {
      const build = await builder();
      const project = build.config.project;
      mocks.builder.mockImplementationOnce(async () => build);

      await expect(run({ ...opts, sandbox: false })).resolves.toBeUndefined();
      expect(build.config.project).toBe(project);
    });
    test(`changes project name on sandbox = true`, async () => {
      const build = await builder();
      const project = build.config.project;
      mocks.builder.mockImplementationOnce(async () => build);

      await expect(run({ ...opts, sandbox: true })).resolves.toBeUndefined();
      expect(build.config.project).not.toBe(project);
    });
  });
  describe(`getCleanCmd call`, () => {
    test(`succeeds`, async () => {
      await expect(run(opts)).resolves.toBeUndefined();
      expect(mocks.getCleanCmd).toHaveBeenCalled();
      expect(mocks.getCleanCmd.mock.calls[0][0].config).toEqual({
        project: 'foo',
        tasks: { foo: {}, bar: {} },
        compose: { services: { foo: {}, bar: {} } }
      });
    });
    test(`fails`, async () => {
      mocks.getCleanCmd.mockImplementationOnce(() => Promise.reject(Error()));

      await expect(run(opts)).rejects.toThrowError();
      expect(mocks.runTask).not.toHaveBeenCalled();
    });
  });
  describe(`write call`, () => {
    test(`succeeds`, async () => {
      await expect(run(opts)).resolves.toBeUndefined();
      expect(mocks.write).toHaveBeenCalledTimes(1);
      expect(mocks.write).toHaveBeenCalledWith({
        data: { services: { bar: {}, foo: {} } }
      });
    });
    test(`fails`, async () => {
      mocks.write.mockImplementationOnce(() => Promise.reject(Error()));

      await expect(run(opts)).rejects.toThrowError();
      expect(mocks.runTask).not.toHaveBeenCalled();
    });
  });
  describe(`getCmd call`, () => {
    test(`succeeds`, async () => {
      const build = await mocks.builder();
      const getCmd = jest.fn().mockImplementation(() => build.getCmd());
      mocks.builder.mockImplementationOnce(async () => ({ ...build, getCmd }));

      await expect(run(opts)).resolves.toBeUndefined();
      expect(getCmd).toHaveBeenCalledWith({ file: 'foo/bar/baz.js' });
    });
    test(`fails`, async () => {
      const build = await builder();
      const getCmd = jest.fn().mockImplementation(() => {
        throw Error();
      });
      mocks.builder.mockImplementationOnce(async () => ({ ...build, getCmd }));

      await expect(run(opts)).rejects.toThrowError();
      await expect(mocks.runTask).not.toHaveBeenCalled();
    });
  });
  describe(`add calls`, () => {
    test(`succeeds wo/ sandbox`, async () => {
      await expect(run(opts)).resolves.toBeUndefined();
      expect(mocks.add).toHaveBeenCalledTimes(2);
      expect(typeof mocks.add.mock.calls[0][2]).toBe('function');
      expect(typeof mocks.add.mock.calls[1][2]).toBe('function');

      mocks.spawn.mockClear();
      mocks.add.mock.calls[0][2]();
      mocks.add.mock.calls[1][2]();

      expect(mocks.spawn).toHaveBeenCalledTimes(2);
      expect(mocks.spawn).toHaveBeenNthCalledWith(1, 'foo', [
        'bar',
        'baz',
        'stop',
        '--time',
        String(STOP_WAIT_TIME)
      ]);
      expect(mocks.spawn).toHaveBeenNthCalledWith(
        2,
        'foo',
        ['down', 'bar', 'baz'],
        {
          stdio: 'ignore'
        }
      );
    });
    test(`succeeds w/ sandbox`, async () => {
      await expect(run({ ...opts, sandbox: true })).resolves.toBeUndefined();
      expect(mocks.add).toHaveBeenCalledTimes(2);
      expect(typeof mocks.add.mock.calls[0][2]).toBe('function');
      expect(typeof mocks.add.mock.calls[1][2]).toBe('function');

      mocks.spawn.mockClear();
      mocks.add.mock.calls[0][2]();
      mocks.add.mock.calls[1][2]();

      expect(mocks.spawn).toHaveBeenCalledTimes(2);
      expect(mocks.spawn).toHaveBeenCalledWith('foo', [
        'bar',
        'baz',
        'stop',
        '--time',
        String(STOP_WAIT_TIME)
      ]);
      expect(mocks.spawn).toHaveBeenCalledWith('foo', [
        'bar',
        'baz',
        'down',
        '--volumes'
      ]);
    });
  });
  describe(`runTask call`, () => {
    test(`succeeds`, async () => {
      const config = {
        compose: { services: { bar: {}, foo: {} } },
        project: 'foo',
        tasks: { bar: {}, foo: {} }
      };

      await expect(run(opts)).resolves.toBeUndefined();
      expect(mocks.runTask).toBeCalledTimes(2);
      [mocks.runTask.mock.calls[0], mocks.runTask.mock.calls[1]].forEach(
        (args) => {
          expect(args.slice(0, 5)).toEqual([
            {},
            config,
            'foo/bar',
            'foo',
            ['bar', 'baz']
          ]);
        }
      );
    });
    test(`runs serially`, async () => {
      mocks.runTask.mockImplementationOnce(() => wait(1000));

      const p = run(opts);
      await wait(750);
      expect(mocks.runTask).toHaveBeenCalledTimes(1);
      await wait(500);
      expect(mocks.runTask).toHaveBeenCalledTimes(2);
      await expect(p).resolves.toBeUndefined();
    });
    test(`fails`, async () => {
      mocks.runTask.mockImplementationOnce(() => Promise.reject(Error()));
      await expect(run(opts)).rejects.toThrowError();
      expect(mocks.runTask).toHaveBeenCalledTimes(1);
    });
  });
});

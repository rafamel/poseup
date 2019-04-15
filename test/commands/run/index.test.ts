import run from '~/commands/run';
import _initialize from '~/utils/initialize';
import _builder from '~/builder';
import _list from '~/commands/run/list';
import { getCmd as _getCleanCmd } from '~/commands/clean';
import _spawn from '~/utils/spawn';
import _write from '~/utils/write-yaml';
import { add as _add } from '~/utils/teardown';
import _runTask from '~/commands/run/task';
import { setLevel } from '~/utils/logger';
import { wait } from 'promist';
import { STOP_WAIT_TIME } from '~/constants';

setLevel('silent');
const initialize: any = _initialize;
const builder: any = _builder;
const list: any = _list;
const getCleanCmd: any = _getCleanCmd;
const spawn: any = _spawn;
const write: any = _write;
const add: any = _add;
const runTask: any = _runTask;
jest.mock('~/utils/initialize');
jest.mock('~/builder');
jest.mock('~/commands/run/list');
jest.mock('~/commands/clean');
jest.mock('~/utils/spawn');
jest.mock('~/utils/write-yaml');
jest.mock('~/utils/teardown');
jest.mock('~/commands/run/task');

const opts = { tasks: ['foo', 'bar'] };
describe(`initialize call`, () => {
  test(`succeeds`, async () => {
    initialize.mockClear();
    initialize.mockImplementation(() => wait(200));

    const before = Date.now();
    await expect(run(opts)).resolves.toBeUndefined();
    await expect(run({ ...opts, list: false })).resolves.toBeUndefined();
    await expect(run({ list: true })).resolves.toBeUndefined();
    expect(Date.now() - before).toBeGreaterThanOrEqual(600);

    expect(initialize).toHaveBeenCalledTimes(3);
    expect(initialize).toHaveBeenNthCalledWith(1, opts);
    expect(initialize).toHaveBeenNthCalledWith(2, { ...opts, list: false });
    expect(initialize).toHaveBeenNthCalledWith(3, { list: true });

    initialize.mockImplementation(() => Promise.resolve());
  });
  test(`fails`, async () => {
    builder.mockClear();
    initialize.mockImplementationOnce(() => Promise.reject(Error()));

    await expect(run(opts)).rejects.toBeInstanceOf(Error);
    await expect(builder).not.toHaveBeenCalled();
  });
});
describe(`builder call`, () => {
  test(`succeeds`, async () => {
    builder.mockClear();

    await expect(run(opts)).resolves.toBeUndefined();
    await expect(run({ list: true })).resolves.toBeUndefined();
    expect(builder).toHaveBeenCalledTimes(2);
    expect(builder).toHaveBeenNthCalledWith(1, opts);
    expect(builder).toHaveBeenNthCalledWith(2, { list: true });
  });
  test(`fails`, async () => {
    getCleanCmd.mockClear();
    spawn.mockClear();
    list.mockClear();

    builder.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(run(opts)).rejects.toBeInstanceOf(Error);
    builder.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(run({ list: true })).rejects.toBeInstanceOf(Error);

    expect(getCleanCmd).not.toHaveBeenCalled();
    expect(spawn).not.toHaveBeenCalled();
    expect(list).not.toHaveBeenCalled();
  });
});
describe(`list call`, () => {
  test(`succeeds`, async () => {
    list.mockClear();

    await expect(run(opts)).resolves.toBeUndefined();
    expect(list).not.toHaveBeenCalled();

    getCleanCmd.mockClear();
    spawn.mockClear();
    await expect(
      run({ list: true, foo: 'bar' } as any)
    ).resolves.toBeUndefined();
    expect(getCleanCmd).not.toHaveBeenCalled();
    expect(spawn).not.toHaveBeenCalled();
    expect(list).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledWith(
      { list: true, foo: 'bar' },
      {
        project: 'foo',
        tasks: { bar: {}, foo: {} },
        compose: { services: { bar: {}, foo: {} } }
      }
    );
  });
  test(`fails`, async () => {
    list.mockImplementationOnce(() => {
      throw Error();
    });

    await expect(run({ list: true })).rejects.toBeInstanceOf(Error);
  });
});
describe(`control/trunk call`, () => {
  describe(`safety checks`, () => {
    test(`fails when opts wo/ tasks`, async () => {
      await expect(run({ list: false })).rejects.toBeInstanceOf(Error);
      await expect(run({ list: false, tasks: [] })).rejects.toBeInstanceOf(
        Error
      );
    });
    test(`fails when config wo/ tasks`, async () => {
      builder.mockImplementationOnce(async () => {
        const ans = await builder();
        return {
          ...ans,
          config: { ...ans.config, tasks: undefined }
        };
      });
      await expect(run(opts)).rejects.toBeInstanceOf(Error);
    });
    test(`fails when task in opts doesn't exist in config`, async () => {
      await expect(run({ tasks: ['foo', 'baz'] })).rejects.toBeInstanceOf(
        Error
      );
    });
  });
  describe(`sandbox`, () => {
    test(`doesn't change project name on sandbox = false`, async () => {
      const build = await builder();
      const project = build.config.project;
      builder.mockImplementationOnce(async () => build);

      await expect(run({ ...opts, sandbox: false })).resolves.toBeUndefined();
      expect(build.config.project).toBe(project);
    });
    test(`changes project name on sandbox = true`, async () => {
      const build = await builder();
      const project = build.config.project;
      builder.mockImplementationOnce(async () => build);

      await expect(run({ ...opts, sandbox: true })).resolves.toBeUndefined();
      expect(build.config.project).not.toBe(project);
    });
  });
  describe(`getCleanCmd call`, () => {
    test(`succeeds`, async () => {
      getCleanCmd.mockClear();

      await expect(run(opts)).resolves.toBeUndefined();
      expect(getCleanCmd).toHaveBeenCalled();
      expect(getCleanCmd.mock.calls[0][0].config).toEqual({
        project: 'foo',
        tasks: { foo: {}, bar: {} },
        compose: { services: { foo: {}, bar: {} } }
      });
    });
    test(`fails`, async () => {
      runTask.mockClear();
      getCleanCmd.mockImplementationOnce(() => Promise.reject(Error()));

      await expect(run(opts)).rejects.toBeInstanceOf(Error);
      expect(runTask).not.toHaveBeenCalled();
    });
  });
  describe(`write call`, () => {
    test(`succeeds`, async () => {
      write.mockClear();

      await expect(run(opts)).resolves.toBeUndefined();
      expect(write).toHaveBeenCalledTimes(1);
      expect(write).toHaveBeenCalledWith({
        data: { services: { bar: {}, foo: {} } }
      });
    });
    test(`fails`, async () => {
      runTask.mockClear();
      write.mockImplementationOnce(() => Promise.reject(Error()));

      await expect(run(opts)).rejects.toBeInstanceOf(Error);
      expect(runTask).not.toHaveBeenCalled();
    });
  });
  describe(`getCmd call`, () => {
    test(`succeeds`, async () => {
      const build = await builder();
      const getCmd = jest.fn().mockImplementation(() => build.getCmd());
      builder.mockImplementationOnce(async () => ({ ...build, getCmd }));

      await expect(run(opts)).resolves.toBeUndefined();
      expect(getCmd).toHaveBeenCalledWith({ file: 'foo/bar/baz.js' });
    });
    test(`fails`, async () => {
      runTask.mockClear();
      const build = await builder();
      const getCmd = jest.fn().mockImplementation(() => {
        throw Error();
      });
      builder.mockImplementationOnce(async () => ({ ...build, getCmd }));

      await expect(run(opts)).rejects.toBeInstanceOf(Error);
      await expect(runTask).not.toHaveBeenCalled();
    });
  });
  describe(`add calls`, () => {
    test(`succeeds wo/ sandbox`, async () => {
      add.mockClear();

      await expect(run(opts)).resolves.toBeUndefined();
      expect(add).toHaveBeenCalledTimes(2);
      expect(typeof add.mock.calls[0][2]).toBe('function');
      expect(typeof add.mock.calls[1][2]).toBe('function');

      spawn.mockClear();
      add.mock.calls[0][2]();
      add.mock.calls[1][2]();

      expect(spawn).toHaveBeenCalledTimes(2);
      expect(spawn).toHaveBeenNthCalledWith(1, 'foo', [
        'bar',
        'baz',
        'stop',
        '--time',
        String(STOP_WAIT_TIME)
      ]);
      expect(spawn).toHaveBeenNthCalledWith(2, 'foo', ['down', 'bar', 'baz'], {
        stdio: 'ignore'
      });
    });
    test(`succeeds w/ sandbox`, async () => {
      add.mockClear();

      await expect(run({ ...opts, sandbox: true })).resolves.toBeUndefined();
      expect(add).toHaveBeenCalledTimes(2);
      expect(typeof add.mock.calls[0][2]).toBe('function');
      expect(typeof add.mock.calls[1][2]).toBe('function');

      spawn.mockClear();
      add.mock.calls[0][2]();
      add.mock.calls[1][2]();

      expect(spawn).toHaveBeenCalledTimes(2);
      expect(spawn).toHaveBeenCalledWith('foo', [
        'bar',
        'baz',
        'stop',
        '--time',
        String(STOP_WAIT_TIME)
      ]);
      expect(spawn).toHaveBeenCalledWith('foo', [
        'bar',
        'baz',
        'down',
        '--volumes'
      ]);
    });
  });
  describe(`runTask call`, () => {
    test(`succeeds`, async () => {
      runTask.mockClear();
      const config = {
        compose: { services: { bar: {}, foo: {} } },
        project: 'foo',
        tasks: { bar: {}, foo: {} }
      };

      await expect(run(opts)).resolves.toBeUndefined();
      expect(runTask).toBeCalledTimes(2);
      [runTask.mock.calls[0], runTask.mock.calls[1]].forEach((args) => {
        expect(args.slice(0, 4)).toEqual([{}, config, 'foo', ['bar', 'baz']]);
      });
    });
    test(`runs serially`, async () => {
      runTask.mockClear();
      runTask.mockImplementationOnce(() => wait(1000));

      const p = run(opts);
      await wait(750);
      expect(runTask).toHaveBeenCalledTimes(1);
      await wait(500);
      expect(runTask).toHaveBeenCalledTimes(2);
      await expect(p).resolves.toBeUndefined();
    });
    test(`fails`, async () => {
      runTask.mockClear();
      runTask.mockImplementationOnce(() => Promise.reject(Error()));
      await expect(run(opts)).rejects.toBeInstanceOf(Error);
      expect(runTask).toHaveBeenCalledTimes(1);
    });
  });
});

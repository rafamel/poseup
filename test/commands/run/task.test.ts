import runTask from '~/commands/run/task';
import runPrimary from '~/commands/run/primary';
import runCmd from '~/commands/run/cmd';
import waitDetect from '~/commands/run/wait-detect';
import spawn from '~/utils/spawn';
import { setLevel } from '~/utils/logger';
import { RUN_WAIT_TIMEOUT } from '~/constants';
import { wait } from 'promist';
import { IOfType } from '~/types';

setLevel('silent');
jest.mock('~/commands/run/primary');
jest.mock('~/commands/run/wait-detect');
jest.mock('~/commands/run/cmd');
jest.mock('~/utils/spawn');
jest.mock('promist');

const mocks: IOfType<jest.Mock<any, any>> = {
  runPrimary,
  runCmd,
  waitDetect,
  spawn,
  wait
} as any;
beforeEach(() => Object.values(mocks).forEach((mocks) => mocks.mockClear()));

mocks.wait.mockImplementation(() => Promise.resolve());

const getSpawnCalls = (signature: string): number => {
  return mocks.spawn.mock.calls.reduce((acc: number, args: any[]) => {
    return args[1].includes(signature) ? acc + 1 : acc;
  }, 0);
};
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const TASK = { primary: 'bar' };
const CONFIG = {
  project: 'foo',
  compose: {
    // eslint-disable-next-line @typescript-eslint/camelcase
    services: { foo: {}, bar: { depends_on: ['foo', 'baz'] }, baz: {} }
  }
};
const CLEAN = jest.fn().mockImplementation(() => Promise.resolve());

describe(`empty`, () => {
  test(`succeeds`, async () => {
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
  });
  test(`doesn't call runPrimary or runCmd`, async () => {
    await expect(
      runTask({}, CONFIG, 'foo/bar', 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(mocks.runPrimary).not.toHaveBeenCalled();
    expect(mocks.runCmd).not.toHaveBeenCalled();
  });
});
describe(`linked services`, () => {
  test(`succeeds for task.services`, async () => {
    await expect(
      runTask(
        { ...TASK, services: ['a', 'b', 'c'] },
        CONFIG,
        'foo/bar',
        'foo',
        ['d', 'e'],
        CLEAN,
        0
      )
    ).resolves.toBeUndefined();
    expect(mocks.spawn).toHaveBeenCalledWith(
      'foo',
      ['d', 'e', 'up', '--detach', 'a', 'b', 'c'],
      { stdio: 'ignore' }
    );
    expect(mocks.spawn).not.toHaveBeenCalledWith(
      'foo',
      ['d', 'e', 'up', '--detach', 'foo', 'baz'],
      { stdio: 'ignore' }
    );
  });
  test(`succeeds for depends_on`, async () => {
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', ['d', 'e'], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(mocks.spawn).not.toHaveBeenCalledWith(
      'foo',
      ['d', 'e', 'up', '--detach', 'a', 'b', 'c'],
      { stdio: 'ignore' }
    );
    expect(mocks.spawn).toHaveBeenCalledWith(
      'foo',
      ['d', 'e', 'up', '--detach', 'foo', 'baz'],
      { stdio: 'ignore' }
    );
  });
  test(`fails for task.services`, async () => {
    mocks.spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('--detach')) throw Error();
      return null;
    });

    await expect(
      runTask(
        { ...TASK, services: ['a', 'b', 'c'] },
        CONFIG,
        'foo/bar',
        'foo',
        ['d', 'e'],
        CLEAN,
        0
      )
    ).rejects.toThrowError();

    mocks.spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`fails for task.services on signal`, async () => {
    mocks.spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('--detach')) return 'SIGINT';
      return null;
    });

    await expect(
      runTask(
        { ...TASK, services: ['a', 'b', 'c'] },
        CONFIG,
        'foo/bar',
        'foo',
        ['d', 'e'],
        CLEAN,
        0
      )
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Process finished early (SIGINT)"`
    );

    mocks.spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`fails for depends_on on signal`, async () => {
    mocks.spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('--detach')) return 'SIGINT';
      return null;
    });

    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', ['d', 'e'], CLEAN, 0)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Process finished early (SIGINT)"`
    );

    mocks.spawn.mockImplementation(() => Promise.resolve(null));
  });
});
describe(`wait after bringing up services`, () => {
  test(`doesn't wait on timeout = 0`, async () => {
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(mocks.wait).not.toHaveBeenCalled();
    expect(mocks.waitDetect).not.toHaveBeenCalled();
  });
  test(`waits wo/ detect`, async () => {
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN)
    ).resolves.toBeUndefined();
    expect(mocks.wait).toHaveBeenCalledWith(RUN_WAIT_TIMEOUT * 1000);
  });
  test(`waits > 0 wo/ detect`, async () => {
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, 1)
    ).resolves.toBeUndefined();
    expect(mocks.wait).toHaveBeenCalledWith(1000);
    expect(mocks.waitDetect).not.toHaveBeenCalled();
  });
  test(`calls waitDetect w/ args`, async () => {
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, undefined, true)
    ).resolves.toBeUndefined();
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, 1, true)
    ).resolves.toBeUndefined();

    expect(mocks.waitDetect).toHaveBeenCalledTimes(2);
    expect(mocks.waitDetect).toHaveBeenNthCalledWith(
      1,
      ['foo', 'baz'],
      RUN_WAIT_TIMEOUT,
      'foo',
      []
    );
    expect(mocks.waitDetect).toHaveBeenNthCalledWith(
      2,
      ['foo', 'baz'],
      1,
      'foo',
      []
    );
  });
  test(`fails on < 0`, async () => {
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, -1)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Waiting time must be greater than or equal to 0"`
    );
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, -1, true)
    ).rejects.toThrowError();
  });
  test(`waits only when bringing up services`, async () => {
    await expect(
      runTask({ primary: 'foo' }, CONFIG, 'foo/bar', 'foo', [], CLEAN, 1)
    ).resolves.toBeUndefined();
    await expect(
      runTask(
        { primary: 'foo' },
        CONFIG,
        'foo/bar',
        'foo',
        [],
        CLEAN,
        undefined,
        true
      )
    ).resolves.toBeUndefined();
    expect(mocks.wait).not.toHaveBeenCalledWith(1000);
    expect(mocks.waitDetect).not.toHaveBeenCalled();
  });
});
describe(`task.exec`, () => {
  test(`doesn't run if no exec`, async () => {
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(getSpawnCalls('exec')).toBe(0);
  });
  test(`suceeds`, async () => {
    await expect(
      runTask(
        {
          ...TASK,
          exec: [
            { bar: ['a', 'b', 'c'], baz: ['i', 'j', 'k'] },
            { baz: ['f', 'g', 'h'] }
          ]
        },
        CONFIG,
        'foo/bar',
        'foo',
        ['d', 'e'],
        CLEAN,
        0
      )
    ).resolves.toBeUndefined();

    expect(mocks.spawn).toHaveBeenCalledWith('foo', [
      'd',
      'e',
      'exec',
      'bar',
      'a',
      'b',
      'c'
    ]);
    expect(mocks.spawn).toHaveBeenCalledWith('foo', [
      'd',
      'e',
      'exec',
      'baz',
      'i',
      'j',
      'k'
    ]);
    expect(mocks.spawn).toHaveBeenCalledWith('foo', [
      'd',
      'e',
      'exec',
      'baz',
      'f',
      'g',
      'h'
    ]);
  });
  test(`calls after wait`, async () => {
    mocks.wait.mockImplementationOnce(() => sleep(1000));

    const p = runTask(
      { ...TASK, exec: [{ bar: ['a'] }] },
      CONFIG,
      'foo/bar',
      'foo',
      [],
      CLEAN,
      1
    );

    await sleep(750);
    expect(getSpawnCalls('exec')).toBe(0);

    await expect(p).resolves.toBeUndefined();
    expect(getSpawnCalls('exec')).toBe(1);
  });
  test(`calls serially`, async () => {
    mocks.spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('exec')) await sleep(1000);
      return null;
    });

    const p = runTask(
      { ...TASK, exec: [{ bar: ['a'] }, { baz: ['b'] }] },
      CONFIG,
      'foo/bar',
      'foo',
      [],
      CLEAN,
      0
    );

    await sleep(750);
    expect(getSpawnCalls('exec')).toBe(1);

    await sleep(1000);
    expect(getSpawnCalls('exec')).toBe(2);

    await expect(p).resolves.toBeUndefined();
    expect(getSpawnCalls('exec')).toBe(2);

    mocks.spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`fails`, async () => {
    mocks.spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('exec')) throw Error();
      return null;
    });

    await expect(
      runTask(
        { ...TASK, exec: [{ bar: ['a'] }] },
        CONFIG,
        'foo/bar',
        'foo',
        [],
        CLEAN,
        0
      )
    ).rejects.toThrowError();

    mocks.spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`fails on signal`, async () => {
    mocks.spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('exec')) return 'SIGINT';
      return null;
    });

    await expect(
      runTask(
        { ...TASK, exec: [{ bar: ['a'] }] },
        CONFIG,
        'foo/bar',
        'foo',
        [],
        CLEAN,
        0
      )
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Process finished early (SIGINT)"`
    );

    mocks.spawn.mockImplementation(() => Promise.resolve(null));
  });
});
describe(`runPrimary call`, () => {
  test(`suceeds`, async () => {
    const task = { ...TASK, cmd: ['a', 'b'] };
    await expect(
      runTask(task, CONFIG, 'foo/bar', 'foo', ['a', 'b'], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(mocks.runCmd).not.toHaveBeenCalled();
    expect(mocks.runPrimary).toHaveBeenCalledTimes(1);
    expect(mocks.runPrimary).toHaveBeenCalledWith(task, CONFIG, 'foo', [
      'a',
      'b'
    ]);
  });
  test(`fails`, async () => {
    mocks.runPrimary.mockImplementationOnce(() => Promise.reject(Error()));

    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', ['a', 'b'], CLEAN, 0)
    ).rejects.toThrowError();
  });
  test(`calls after exec`, async () => {
    mocks.spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('exec')) await sleep(1000);
      return null;
    });

    const p = runTask(
      { ...TASK, exec: [{ bar: ['a'] }] },
      CONFIG,
      'foo/bar',
      'foo',
      [],
      CLEAN,
      0
    );
    await sleep(750);
    expect(mocks.runPrimary).not.toHaveBeenCalled();
    await expect(p).resolves.toBeUndefined();
    expect(mocks.runPrimary).toHaveBeenCalled();

    mocks.spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`doesn't execute when no primary`, async () => {
    await expect(
      runTask({ cmd: [] }, CONFIG, 'foo/bar', 'foo', ['a', 'b'], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(mocks.runPrimary).not.toHaveBeenCalled();
  });
});
describe(`runCmd call`, () => {
  test(`suceeds`, async () => {
    await expect(
      runTask({ cmd: ['c', 'd'] }, CONFIG, 'foo/bar', 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(mocks.runPrimary).not.toHaveBeenCalled();
    expect(mocks.runCmd).toHaveBeenCalledTimes(1);
    expect(mocks.runCmd).toHaveBeenCalledWith({ cmd: ['c', 'd'] }, 'foo/bar');
  });
  test(`fails`, async () => {
    mocks.runCmd.mockImplementationOnce(() => Promise.reject(Error()));

    await expect(
      runTask({ cmd: ['c', 'd'] }, CONFIG, 'foo/bar', 'foo', [], CLEAN, 0)
    ).rejects.toThrowError();
  });
  test(`calls after exec`, async () => {
    mocks.spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('exec')) await sleep(1000);
      return null;
    });

    const p = runTask(
      { cmd: ['c', 'd'], exec: [{ bar: ['a'] }], services: ['bar'] },
      CONFIG,
      'foo/bar',
      'foo',
      [],
      CLEAN,
      0
    );
    await sleep(750);
    expect(mocks.runCmd).not.toHaveBeenCalled();
    await expect(p).resolves.toBeUndefined();
    expect(mocks.runCmd).toHaveBeenCalled();

    mocks.spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`doesn't execute when primary`, async () => {
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', ['a', 'b'], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(mocks.runCmd).not.toHaveBeenCalled();
  });
});
describe(`clean call`, () => {
  test(`succeeds`, async () => {
    CLEAN.mockClear();
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(CLEAN).toHaveBeenCalledTimes(1);
  });
  test(`fails`, async () => {
    CLEAN.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, 0)
    ).rejects.toThrowError();
  });
  test(`fails on signal`, async () => {
    CLEAN.mockImplementationOnce(async () => 'SIGINT');
    await expect(
      runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, 0)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Process finished early (SIGINT)"`
    );
  });
  test(`executes after all`, async () => {
    CLEAN.mockClear();
    mocks.runPrimary.mockImplementationOnce(() => sleep(1000));

    const p = runTask(TASK, CONFIG, 'foo/bar', 'foo', [], CLEAN, 0);
    await sleep(750);
    expect(CLEAN).not.toHaveBeenCalled();
    await expect(p).resolves.toBeUndefined();
    expect(CLEAN).toHaveBeenCalledTimes(1);
  });
});

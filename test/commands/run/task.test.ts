import runTask from '~/commands/run/task';
import _runPrimary from '~/commands/run/primary';
import _runCmd from '~/commands/run/cmd';
import _waitDetect from '~/commands/run/wait-detect';
import _spawn from '~/utils/spawn';
import { setLevel } from '~/utils/logger';
import { RUN_WAIT_TIMEOUT } from '~/constants';
import { wait as _wait } from 'promist';

setLevel('silent');
jest.mock('~/commands/run/primary');
jest.mock('~/commands/run/wait-detect');
jest.mock('~/commands/run/cmd');
jest.mock('~/utils/spawn');
jest.mock('promist');
const runPrimary: any = _runPrimary;
const runCmd: any = _runCmd;
const waitDetect: any = _waitDetect;
const spawn: any = _spawn;
const getSpawnCalls = (signature: string): number => {
  return spawn.mock.calls.reduce((acc: number, args: any[]) => {
    return args[1].includes(signature) ? acc + 1 : acc;
  }, 0);
};
const wait: any = _wait;
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
wait.mockImplementation(() => Promise.resolve());

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
      runTask(TASK, CONFIG, 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
  });
  test(`doesn't call runPrimary or runCmd`, async () => {
    runPrimary.mockClear();
    runCmd.mockClear();
    await expect(
      runTask({}, CONFIG, 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(runPrimary).not.toHaveBeenCalled();
    expect(runCmd).not.toHaveBeenCalled();
  });
});
describe(`linked services`, () => {
  test(`succeeds for task.services`, async () => {
    spawn.mockClear();

    await expect(
      runTask(
        { ...TASK, services: ['a', 'b', 'c'] },
        CONFIG,
        'foo',
        ['d', 'e'],
        CLEAN,
        0
      )
    ).resolves.toBeUndefined();
    expect(spawn).toHaveBeenCalledWith(
      'foo',
      ['d', 'e', 'up', '--detach', 'a', 'b', 'c'],
      { stdio: 'ignore' }
    );
    expect(spawn).not.toHaveBeenCalledWith(
      'foo',
      ['d', 'e', 'up', '--detach', 'foo', 'baz'],
      { stdio: 'ignore' }
    );
  });
  test(`succeeds for depends_on`, async () => {
    spawn.mockClear();

    await expect(
      runTask(TASK, CONFIG, 'foo', ['d', 'e'], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(spawn).not.toHaveBeenCalledWith(
      'foo',
      ['d', 'e', 'up', '--detach', 'a', 'b', 'c'],
      { stdio: 'ignore' }
    );
    expect(spawn).toHaveBeenCalledWith(
      'foo',
      ['d', 'e', 'up', '--detach', 'foo', 'baz'],
      { stdio: 'ignore' }
    );
  });
  test(`fails for task.services`, async () => {
    spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('--detach')) throw Error();
      return null;
    });

    await expect(
      runTask(
        { ...TASK, services: ['a', 'b', 'c'] },
        CONFIG,
        'foo',
        ['d', 'e'],
        CLEAN,
        0
      )
    ).rejects.toBeInstanceOf(Error);

    spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`fails for task.services on signal`, async () => {
    spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('--detach')) return 'SIGINT';
      return null;
    });

    await expect(
      runTask(
        { ...TASK, services: ['a', 'b', 'c'] },
        CONFIG,
        'foo',
        ['d', 'e'],
        CLEAN,
        0
      )
    ).rejects.toBeInstanceOf(Error);

    spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`fails for depends_on on signal`, async () => {
    spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('--detach')) return 'SIGINT';
      return null;
    });

    await expect(
      runTask(TASK, CONFIG, 'foo', ['d', 'e'], CLEAN, 0)
    ).rejects.toBeInstanceOf(Error);

    spawn.mockImplementation(() => Promise.resolve(null));
  });
});
describe(`wait after bringing up services`, () => {
  test(`doesn't wait on timeout = 0`, async () => {
    wait.mockClear();
    waitDetect.mockClear();

    await expect(
      runTask(TASK, CONFIG, 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(wait).not.toHaveBeenCalled();
    expect(waitDetect).not.toHaveBeenCalled();
  });
  test(`waits wo/ detect`, async () => {
    wait.mockClear();
    waitDetect.mockClear();

    await expect(
      runTask(TASK, CONFIG, 'foo', [], CLEAN)
    ).resolves.toBeUndefined();
    expect(wait).toHaveBeenCalledWith(RUN_WAIT_TIMEOUT * 1000);
  });
  test(`waits > 0 wo/ detect`, async () => {
    wait.mockClear();
    waitDetect.mockClear();

    await expect(
      runTask(TASK, CONFIG, 'foo', [], CLEAN, 1)
    ).resolves.toBeUndefined();
    expect(wait).toHaveBeenCalledWith(1000);
    expect(waitDetect).not.toHaveBeenCalled();
  });
  test(`calls waitDetect w/ args`, async () => {
    waitDetect.mockClear();

    await expect(
      runTask(TASK, CONFIG, 'foo', [], CLEAN, undefined, true)
    ).resolves.toBeUndefined();
    await expect(
      runTask(TASK, CONFIG, 'foo', [], CLEAN, 1, true)
    ).resolves.toBeUndefined();

    expect(waitDetect).toHaveBeenCalledTimes(2);
    expect(waitDetect).toHaveBeenNthCalledWith(
      1,
      ['foo', 'baz'],
      RUN_WAIT_TIMEOUT,
      'foo',
      []
    );
    expect(waitDetect).toHaveBeenNthCalledWith(2, ['foo', 'baz'], 1, 'foo', []);
  });
  test(`fails on < 0`, async () => {
    await expect(
      runTask(TASK, CONFIG, 'foo', [], CLEAN, -1)
    ).rejects.toBeInstanceOf(Error);
    await expect(
      runTask(TASK, CONFIG, 'foo', [], CLEAN, -1, true)
    ).rejects.toBeInstanceOf(Error);
  });
  test(`waits only when bringing up services`, async () => {
    wait.mockClear();
    waitDetect.mockClear();

    await expect(
      runTask({ primary: 'foo' }, CONFIG, 'foo', [], CLEAN, 1)
    ).resolves.toBeUndefined();
    await expect(
      runTask({ primary: 'foo' }, CONFIG, 'foo', [], CLEAN, undefined, true)
    ).resolves.toBeUndefined();
    expect(wait).not.toHaveBeenCalledWith(1000);
    expect(waitDetect).not.toHaveBeenCalled();
  });
});
describe(`task.exec`, () => {
  test(`doesn't run if no exec`, async () => {
    spawn.mockClear();
    await expect(
      runTask(TASK, CONFIG, 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(getSpawnCalls('exec')).toBe(0);
  });
  test(`suceeds`, async () => {
    spawn.mockClear();
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
        'foo',
        ['d', 'e'],
        CLEAN,
        0
      )
    ).resolves.toBeUndefined();

    expect(spawn).toHaveBeenCalledWith('foo', [
      'd',
      'e',
      'exec',
      'bar',
      'a',
      'b',
      'c'
    ]);
    expect(spawn).toHaveBeenCalledWith('foo', [
      'd',
      'e',
      'exec',
      'baz',
      'i',
      'j',
      'k'
    ]);
    expect(spawn).toHaveBeenCalledWith('foo', [
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
    spawn.mockClear();
    wait.mockImplementationOnce(() => sleep(1000));

    const p = runTask(
      { ...TASK, exec: [{ bar: ['a'] }] },
      CONFIG,
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
    spawn.mockClear();
    spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('exec')) await sleep(1000);
      return null;
    });

    const p = runTask(
      { ...TASK, exec: [{ bar: ['a'] }, { baz: ['b'] }] },
      CONFIG,
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

    spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`fails`, async () => {
    spawn.mockClear();
    spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('exec')) throw Error();
      return null;
    });

    await expect(
      runTask({ ...TASK, exec: [{ bar: ['a'] }] }, CONFIG, 'foo', [], CLEAN, 0)
    ).rejects.toBeInstanceOf(Error);

    spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`fails on signal`, async () => {
    spawn.mockClear();
    spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('exec')) return 'SIGINT';
      return null;
    });

    await expect(
      runTask({ ...TASK, exec: [{ bar: ['a'] }] }, CONFIG, 'foo', [], CLEAN, 0)
    ).rejects.toBeInstanceOf(Error);

    spawn.mockImplementation(() => Promise.resolve(null));
  });
});
describe(`runPrimary call`, () => {
  test(`suceeds`, async () => {
    runCmd.mockClear();
    runPrimary.mockClear();

    const task = { ...TASK, cmd: ['a', 'b'] };
    await expect(
      runTask(task, CONFIG, 'foo', ['a', 'b'], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(runCmd).not.toHaveBeenCalled();
    expect(runPrimary).toHaveBeenCalledTimes(1);
    expect(runPrimary).toHaveBeenCalledWith(task, CONFIG, 'foo', ['a', 'b']);
  });
  test(`fails`, async () => {
    runPrimary.mockImplementationOnce(() => Promise.reject(Error()));

    await expect(
      runTask(TASK, CONFIG, 'foo', ['a', 'b'], CLEAN, 0)
    ).rejects.toBeInstanceOf(Error);
  });
  test(`calls after exec`, async () => {
    runPrimary.mockClear();
    spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('exec')) await sleep(1000);
      return null;
    });

    const p = runTask(
      { ...TASK, exec: [{ bar: ['a'] }] },
      CONFIG,
      'foo',
      [],
      CLEAN,
      0
    );
    await sleep(750);
    expect(runPrimary).not.toHaveBeenCalled();
    await expect(p).resolves.toBeUndefined();
    expect(runPrimary).toHaveBeenCalled();

    spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`doesn't execute when no primary`, async () => {
    runPrimary.mockClear();

    await expect(
      runTask({ cmd: [] }, CONFIG, 'foo', ['a', 'b'], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(runPrimary).not.toHaveBeenCalled();
  });
});
describe(`runCmd call`, () => {
  test(`suceeds`, async () => {
    runPrimary.mockClear();
    runCmd.mockClear();

    await expect(
      runTask({ cmd: ['c', 'd'] }, CONFIG, 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(runPrimary).not.toHaveBeenCalled();
    expect(runCmd).toHaveBeenCalledTimes(1);
    expect(runCmd).toHaveBeenCalledWith({ cmd: ['c', 'd'] });
  });
  test(`fails`, async () => {
    runCmd.mockImplementationOnce(() => Promise.reject(Error()));

    await expect(
      runTask({ cmd: ['c', 'd'] }, CONFIG, 'foo', [], CLEAN, 0)
    ).rejects.toBeInstanceOf(Error);
  });
  test(`calls after exec`, async () => {
    runCmd.mockClear();
    spawn.mockImplementation(async (...args: any[]) => {
      if (args[1].includes('exec')) await sleep(1000);
      return null;
    });

    const p = runTask(
      { cmd: ['c', 'd'], exec: [{ bar: ['a'] }], services: ['bar'] },
      CONFIG,
      'foo',
      [],
      CLEAN,
      0
    );
    await sleep(750);
    expect(runCmd).not.toHaveBeenCalled();
    await expect(p).resolves.toBeUndefined();
    expect(runCmd).toHaveBeenCalled();

    spawn.mockImplementation(() => Promise.resolve(null));
  });
  test(`doesn't execute when primary`, async () => {
    runCmd.mockClear();

    await expect(
      runTask(TASK, CONFIG, 'foo', ['a', 'b'], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(runCmd).not.toHaveBeenCalled();
  });
});
describe(`clean call`, () => {
  test(`succeeds`, async () => {
    CLEAN.mockClear();
    await expect(
      runTask(TASK, CONFIG, 'foo', [], CLEAN, 0)
    ).resolves.toBeUndefined();
    expect(CLEAN).toHaveBeenCalledTimes(1);
  });
  test(`fails`, async () => {
    CLEAN.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(
      runTask(TASK, CONFIG, 'foo', [], CLEAN, 0)
    ).rejects.toBeInstanceOf(Error);
  });
  test(`fails on signal`, async () => {
    CLEAN.mockImplementationOnce(async () => 'SIGINT');
    await expect(
      runTask(TASK, CONFIG, 'foo', [], CLEAN, 0)
    ).rejects.toBeInstanceOf(Error);
  });
  test(`executes after all`, async () => {
    CLEAN.mockClear();
    runPrimary.mockImplementationOnce(() => sleep(1000));

    const p = runTask(TASK, CONFIG, 'foo', [], CLEAN, 0);
    await sleep(750);
    expect(CLEAN).not.toHaveBeenCalled();
    await expect(p).resolves.toBeUndefined();
    expect(CLEAN).toHaveBeenCalledTimes(1);
  });
});

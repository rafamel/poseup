import runPrimary from '~/commands/run/primary';
import _spawn from '~/utils/spawn';
import _uuid from 'uuid/v4';
import { setLevel } from '~/utils/logger';

setLevel('silent');
jest.mock('uuid/v4');
jest.mock('~/utils/spawn');
const uuid: any = _uuid;
const spawn: any = _spawn;
uuid.mockImplementation(() => '6812723d-2fa6-4a89-98e3-55f6ab32dc46');

const run = (task: any = { primary: 'bar' }): Promise<void> =>
  runPrimary(
    task,
    { project: 'foo', compose: { services: { foo: {}, bar: {} } } },
    'foo',
    ['bar', 'baz']
  );

describe(`task.primary`, () => {
  test(`succeeds`, async () => {
    await expect(run()).resolves.toBeUndefined();
  });
  test(`fails`, async () => {
    await expect(run({})).rejects.toBeInstanceOf(Error);
  });
});
describe(`spawn call`, () => {
  test(`suceeds wo/ task.cmd`, async () => {
    spawn.mockClear();

    await expect(run()).resolves.toBeUndefined();
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledWith(
      'foo',
      ['bar', 'baz', 'run', '--name', 'foo_bar_run_6812723d', '--rm', 'bar'],
      { stdio: ['pipe', 'inherit', 'inherit'] }
    );
  });
  test(`suceeds w/ task.cmd`, async () => {
    spawn.mockClear();

    await expect(
      run({ primary: 'bar', cmd: ['foobar', 'barbaz'] })
    ).resolves.toBeUndefined();
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(spawn).toHaveBeenCalledWith(
      'foo',
      [
        'bar',
        'baz',
        'run',
        '--name',
        'foo_bar_run_6812723d',
        '--rm',
        'bar',
        'foobar',
        'barbaz'
      ],
      { stdio: ['pipe', 'inherit', 'inherit'] }
    );
  });
  test(`fails`, async () => {
    spawn.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(run()).rejects.toBeInstanceOf(Error);
  });
});

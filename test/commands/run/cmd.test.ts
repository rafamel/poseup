import runCmd from '~/commands/run/cmd';
import _spawn from '~/utils/spawn';
import { setLevel } from '~/utils/logger';

setLevel('silent');
jest.mock('~/utils/spawn');
const spawn: any = _spawn;

describe(`task.command`, () => {
  test(`succeeds`, async () => {
    await expect(runCmd({ cmd: ['foo'] })).resolves.toBeUndefined();
  });
  test(`fails`, async () => {
    await expect(runCmd({})).rejects.toBeInstanceOf(Error);
    await expect(runCmd({ cmd: [] })).rejects.toBeInstanceOf(Error);
  });
});
describe(`spawn call`, () => {
  test(`succeeds`, async () => {
    spawn.mockClear();

    await expect(runCmd({ cmd: ['foo'] })).resolves.toBeUndefined();
    await expect(
      runCmd({ cmd: ['foo', 'bar', 'baz'] })
    ).resolves.toBeUndefined();
    expect(spawn).toHaveBeenCalledTimes(2);
    expect(spawn).toHaveBeenNthCalledWith(1, 'foo', []);
    expect(spawn).toHaveBeenNthCalledWith(2, 'foo', ['bar', 'baz']);
  });
  test(`fails`, async () => {
    spawn.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(runCmd({ cmd: ['foo'] })).rejects.toBeInstanceOf(Error);
  });
});

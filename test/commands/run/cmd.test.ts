import runCmd from '~/commands/run/cmd';
import _spawn from '~/utils/spawn';
import { setLevel } from '~/utils/logger';

setLevel('silent');
jest.mock('~/utils/spawn');
const spawn: any = _spawn;

test(`fails on !task.command`, async () => {
  await expect(runCmd({})).rejects.toBeInstanceOf(Error);
  await expect(runCmd({ cmd: [] })).rejects.toBeInstanceOf(Error);
});
test(`succeeds on task.command`, async () => {
  await expect(runCmd({ cmd: ['foo'] })).resolves.toBeUndefined();
});
test(`spawn call is successful`, async () => {
  spawn.mockClear();

  await expect(runCmd({ cmd: ['foo'] })).resolves.toBeUndefined();
  await expect(runCmd({ cmd: ['foo', 'bar', 'baz'] })).resolves.toBeUndefined();
  expect(spawn).toHaveBeenCalledTimes(2);
  expect(spawn).toHaveBeenNthCalledWith(1, 'foo', []);
  expect(spawn).toHaveBeenNthCalledWith(2, 'foo', ['bar', 'baz']);
});

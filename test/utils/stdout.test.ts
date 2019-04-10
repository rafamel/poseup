import stdout from '~/utils/stdout';
import { spawn as _spawn } from 'child_process';
import uuid from 'uuid/v4';

jest.mock('child_process');
const spawn: any = _spawn;

spawn.mockImplementation(() => {
  jest.unmock('child_process');
  return require('child_process').spawn('shx', ['echo', 'foo']);
});

test(`succeeds`, async () => {
  spawn.mockClear();

  await expect(stdout('foo', ['bar', 'baz'])).resolves.toBe('foo\n');
  expect(spawn).toHaveBeenCalledTimes(1);
  expect(spawn).toHaveBeenCalledWith('foo', ['bar', 'baz']);
});
test(`fails on non existent binary`, async () => {
  spawn.mockClear();
  spawn.mockImplementationOnce(() => {
    return require('child_process').spawn(uuid().replace(/-/g, ''));
  });

  await expect(stdout('foo', ['bar', 'baz'])).rejects.toBeInstanceOf(Error);
});
test(`Fails on spawn process error`, async () => {
  spawn.mockClear();
  spawn.mockImplementationOnce(() => {
    return require('child_process').spawn('shx', ['error']);
  });

  await expect(stdout('foo', ['bar', 'baz'])).rejects.toBeInstanceOf(Error);
});

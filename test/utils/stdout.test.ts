import stdout from '~/utils/stdout';
import { spawn } from 'child_process';
import uuid from 'uuid/v4';
import { IOfType } from '~/types';

jest.mock('child_process');

const mocks: IOfType<jest.Mock<any, any>> = {
  spawn
} as any;
beforeEach(() => Object.values(mocks).forEach((mocks) => mocks.mockClear()));

mocks.spawn.mockImplementation(() => {
  jest.unmock('child_process');
  return require('child_process').spawn('node', ['-e', `console.log('foo');`]);
});

test(`succeeds`, async () => {
  await expect(stdout('foo', ['bar', 'baz'])).resolves.toBe('foo\n');
  expect(mocks.spawn).toHaveBeenCalledTimes(1);
  expect(mocks.spawn).toHaveBeenCalledWith('foo', ['bar', 'baz']);
});
test(`fails on non existent binary`, async () => {
  mocks.spawn.mockImplementationOnce(() => {
    jest.unmock('child_process');
    return require('child_process').spawn(uuid().replace(/-/g, ''));
  });

  await expect(stdout('foo', ['bar', 'baz'])).rejects.toThrowError();
});
test(`Fails on spawn process error`, async () => {
  mocks.spawn.mockImplementation(() => {
    jest.unmock('child_process');
    return require('child_process').spawn('node', ['-e', 'process.exit(1);']);
  });

  await expect(
    stdout('foo', ['bar', 'baz'])
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"foo process failed"`);
});

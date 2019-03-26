import path from 'path';
import { spawn as _spawn } from 'child_process';
import containerLs from '../../src/utils/container-ls';
import uuid from 'uuid/v4';
import out from '../fixtures/container-ls/out';

const at = (str?: string): string => {
  return path.join(__dirname, '../fixtures/container-ls', str || '');
};
jest.mock('child_process');

const spawn: any = _spawn;
spawn.mockImplementation(() => {
  jest.unmock('child_process');
  return require('child_process').spawn('shx', ['cat', at('in.txt')]);
});

test(`Calls spawn`, async () => {
  await containerLs();

  expect(spawn).toHaveBeenCalledTimes(1);
  expect(spawn).toHaveBeenCalledWith('docker', [
    'container',
    'ls',
    '--format',
    '"{{json .}}"'
  ]);
});
test(`Calls spawn w/ all`, async () => {
  spawn.mockClear();
  await containerLs({ all: true });

  expect(spawn).toHaveBeenCalledTimes(1);
  expect(spawn).toHaveBeenCalledWith('docker', [
    'container',
    'ls',
    '--all',
    '--format',
    '"{{json .}}"'
  ]);
});
test(`Fails on spawn process error`, async () => {
  spawn.mockClear();
  spawn.mockImplementationOnce(() => {
    return require('child_process').spawn('shx', ['error']);
  });

  await expect(containerLs()).rejects.toBeInstanceOf(Error);
});
test(`Fails on non existent binary`, async () => {
  spawn.mockClear();
  spawn.mockImplementationOnce(() => {
    return require('child_process').spawn(uuid().replace(/-/g, ''));
  });

  await expect(containerLs()).rejects.toBeInstanceOf(Error);
});
test(`Succeeds: expected response`, async () => {
  await expect(containerLs()).resolves.toEqual(out);
});

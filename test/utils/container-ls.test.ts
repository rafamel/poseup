import path from 'path';
import fs from 'fs';
import containerLs from '~/utils/container-ls';
import out from '../fixtures/container-ls/out';
import _stdout from '~/utils/stdout';

const at = (str?: string): string => {
  return path.join(__dirname, '../fixtures/container-ls', str || '');
};
jest.mock('~/utils/stdout');
const stdout: any = _stdout;

test(`Calls stdout`, async () => {
  stdout.mockClear();
  await containerLs();

  expect(stdout).toHaveBeenCalledTimes(1);
  expect(stdout).toHaveBeenCalledWith('docker', [
    'container',
    'ls',
    '--format',
    '"{{json .}}"'
  ]);
});
test(`Calls stdout w/ all`, async () => {
  stdout.mockClear();
  await containerLs({ all: true });

  expect(stdout).toHaveBeenCalledTimes(1);
  expect(stdout).toHaveBeenCalledWith('docker', [
    'container',
    'ls',
    '--all',
    '--format',
    '"{{json .}}"'
  ]);
});
test(`Succeeds: expected response`, async () => {
  stdout.mockClear();
  stdout.mockImplementationOnce(() =>
    Promise.resolve(fs.readFileSync(at('in.txt')).toString())
  );
  await expect(containerLs()).resolves.toEqual(out);
});

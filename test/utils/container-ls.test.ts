import path from 'path';
import fs from 'fs';
import containerLs from '~/utils/container-ls';
import out from '../fixtures/container-ls/out';
import stdout from '~/utils/stdout';
import { IOfType } from '~/types';

const at = (str?: string): string => {
  return path.join(__dirname, '../fixtures/container-ls', str || '');
};
jest.mock('~/utils/stdout');

const mocks: IOfType<jest.Mock<any, any>> = {
  stdout
} as any;
beforeEach(() => Object.values(mocks).forEach((mocks) => mocks.mockClear()));

test(`Calls stdout`, async () => {
  await containerLs();

  expect(mocks.stdout).toHaveBeenCalledTimes(1);
  expect(mocks.stdout).toHaveBeenCalledWith('docker', [
    'container',
    'ls',
    '--format',
    '"{{json .}}"'
  ]);
});
test(`Calls stdout w/ all`, async () => {
  await containerLs({ all: true });

  expect(mocks.stdout).toHaveBeenCalledTimes(1);
  expect(mocks.stdout).toHaveBeenCalledWith('docker', [
    'container',
    'ls',
    '--all',
    '--format',
    '"{{json .}}"'
  ]);
});
test(`Succeeds: expected response`, async () => {
  mocks.stdout.mockImplementationOnce(() =>
    Promise.resolve(fs.readFileSync(at('in.txt')).toString())
  );
  await expect(containerLs()).resolves.toEqual(out);
});

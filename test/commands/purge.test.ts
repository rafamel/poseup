import purge from '~/commands/purge';
import initialize from '~/utils/initialize';
import spawn from '~/utils/spawn';
import containerLs from '~/utils/container-ls';
import { setLevel } from '~/utils/logger';
import { wait } from 'promist';
import out from '../fixtures/container-ls/out';
import { IOfType } from '~/types';

setLevel('silent');
afterEach(() => setLevel('silent'));

jest.mock('~/utils/initialize');
jest.mock('~/utils/spawn');
jest.mock('~/utils/container-ls');

const mocks: IOfType<jest.Mock<any, any>> = {
  initialize,
  spawn,
  containerLs
} as any;
beforeEach(() => Object.values(mocks).forEach((mocks) => mocks.mockClear()));

mocks.containerLs.mockImplementation(() => Promise.resolve(out));

test(`doesn't reject`, async () => {
  await expect(purge()).resolves.toBeUndefined();
});
test(`calls initialize`, async () => {
  await expect(purge()).resolves.toBeUndefined();
  expect(initialize).toHaveBeenCalledTimes(1);
});
test(`calls initialize with log`, async () => {
  await expect(purge()).resolves.toBeUndefined();
  await expect(purge({})).resolves.toBeUndefined();
  await expect(purge({ log: 'warn' })).resolves.toBeUndefined();
  expect(mocks.initialize).toHaveBeenCalledTimes(3);
  expect(mocks.initialize).toHaveBeenNthCalledWith(1, { log: undefined });
  expect(mocks.initialize).toHaveBeenNthCalledWith(2, { log: undefined });
  expect(mocks.initialize).toHaveBeenNthCalledWith(3, { log: 'warn' });
});
test(`calls docker prune in series`, async () => {
  mocks.spawn.mockImplementation(() => wait(300));
  const p = purge();

  await wait(100);
  expect(mocks.spawn).toHaveBeenCalledTimes(1);
  expect(mocks.spawn).toHaveBeenLastCalledWith('docker', ['volume', 'prune']);

  await wait(300);
  expect(mocks.spawn).toHaveBeenCalledTimes(2);
  expect(mocks.spawn).toHaveBeenLastCalledWith('docker', ['network', 'prune']);

  await wait(300);
  expect(mocks.spawn).toHaveBeenCalledTimes(3);
  expect(mocks.spawn).toHaveBeenLastCalledWith('docker', [
    'image',
    'prune',
    '--all'
  ]);

  await expect(p).resolves.toBeUndefined();

  mocks.spawn.mockImplementation(() => Promise.resolve());
});
test(`calls docker prune with --force if options.force = true`, async () => {
  await expect(purge({ force: true })).resolves.toBeUndefined();
  expect(mocks.spawn).toHaveBeenNthCalledWith(1, 'docker', [
    'volume',
    'prune',
    '--force'
  ]);
  expect(mocks.spawn).toHaveBeenNthCalledWith(2, 'docker', [
    'network',
    'prune',
    '--force'
  ]);
  expect(mocks.spawn).toHaveBeenNthCalledWith(3, 'docker', [
    'image',
    'prune',
    '--all',
    '--force'
  ]);
});
test(`calls containerLs after docker prunes`, async () => {
  await expect(purge()).resolves.toBeUndefined();
  expect(mocks.containerLs).toHaveBeenCalledTimes(1);
  expect(mocks.containerLs).toHaveBeenCalledWith({ all: true });
});
test(`fails if initialize fails`, async () => {
  mocks.initialize.mockImplementationOnce(() => Promise.reject(Error()));

  await expect(purge()).rejects.toBeInstanceOf(Error);
});
test(`fails if docker prune fails`, async () => {
  mocks.spawn.mockImplementationOnce(() => Promise.reject(Error()));

  await expect(purge()).rejects.toBeInstanceOf(Error);
});
test(`fails if containerLs fails`, async () => {
  mocks.containerLs.mockImplementationOnce(() => Promise.reject(Error()));

  await expect(purge()).rejects.toBeInstanceOf(Error);
});

import purge from '~/commands/purge';
import _initialize from '~/utils/initialize';
import _spawn from '~/utils/spawn';
import _containerLs from '~/utils/container-ls';
import { setLevel } from '~/utils/logger';
import { wait } from 'promist';
import out from '../fixtures/container-ls/out';

setLevel('silent');
afterEach(() => setLevel('silent'));

jest.mock('~/utils/initialize');
jest.mock('~/utils/spawn');
jest.mock('~/utils/container-ls');
const initialize: any = _initialize;
const spawn: any = _spawn;
const containerLs: any = _containerLs;
spawn.mockImplementation(() => Promise.resolve());
containerLs.mockImplementation(() => Promise.resolve(out));

test(`doesn't reject`, async () => {
  await expect(purge()).resolves.toBeUndefined();
});
test(`calls initialize`, async () => {
  initialize.mockClear();

  await expect(purge()).resolves.toBeUndefined();
  expect(initialize).toHaveBeenCalledTimes(1);
});
test(`calls initialize with log`, async () => {
  initialize.mockClear();

  await expect(purge()).resolves.toBeUndefined();
  await expect(purge({})).resolves.toBeUndefined();
  await expect(purge({ log: 'warn' })).resolves.toBeUndefined();
  expect(initialize).toHaveBeenCalledTimes(3);
  expect(initialize).toHaveBeenNthCalledWith(1, { log: undefined });
  expect(initialize).toHaveBeenNthCalledWith(2, { log: undefined });
  expect(initialize).toHaveBeenNthCalledWith(3, { log: 'warn' });
});
test(`calls docker prune in series`, async () => {
  spawn.mockClear();
  spawn.mockImplementation(() => wait(300));
  const p = purge();

  await wait(100);
  expect(spawn).toHaveBeenCalledTimes(1);
  expect(spawn).toHaveBeenLastCalledWith('docker', ['volume', 'prune']);

  await wait(300);
  expect(spawn).toHaveBeenCalledTimes(2);
  expect(spawn).toHaveBeenLastCalledWith('docker', ['network', 'prune']);

  await wait(300);
  expect(spawn).toHaveBeenCalledTimes(3);
  expect(spawn).toHaveBeenLastCalledWith('docker', ['image', 'prune', '--all']);

  await expect(p).resolves.toBeUndefined();

  spawn.mockImplementation(() => Promise.resolve());
});
test(`calls docker prune with --force if options.force = true`, async () => {
  spawn.mockClear();

  await expect(purge({ force: true })).resolves.toBeUndefined();
  expect(spawn).toHaveBeenNthCalledWith(1, 'docker', [
    'volume',
    'prune',
    '--force'
  ]);
  expect(spawn).toHaveBeenNthCalledWith(2, 'docker', [
    'network',
    'prune',
    '--force'
  ]);
  expect(spawn).toHaveBeenNthCalledWith(3, 'docker', [
    'image',
    'prune',
    '--all',
    '--force'
  ]);
});
test(`calls containerLs after docker prunes`, async () => {
  containerLs.mockClear();

  await expect(purge()).resolves.toBeUndefined();
  expect(containerLs).toHaveBeenCalledTimes(1);
  expect(containerLs).toHaveBeenCalledWith({ all: true });
});
test(`fails if initialize fails`, async () => {
  initialize.mockImplementationOnce(() => Promise.reject(Error()));

  await expect(purge()).rejects.toBeInstanceOf(Error);
});
test(`fails if docker prune fails`, async () => {
  spawn.mockImplementationOnce(() => Promise.reject(Error()));

  await expect(purge()).rejects.toBeInstanceOf(Error);
});
test(`fails if containerLs fails`, async () => {
  containerLs.mockImplementationOnce(() => Promise.reject(Error()));

  await expect(purge()).rejects.toBeInstanceOf(Error);
});

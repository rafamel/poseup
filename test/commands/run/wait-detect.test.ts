import waitDetect from '~/commands/run/wait-detect';
import stdout from '~/utils/stdout';
import { wait, control } from 'promist';
import uuid from 'uuid/v4';
import { setLevel } from '~/utils/logger';
import { IOfType } from '~/types';

setLevel('silent');
jest.mock('~/utils/stdout');
jest.mock('promist');

const mocks: IOfType<jest.Mock<any, any>> = {
  stdout,
  wait,
  control
} as any;
beforeEach(() => Object.values(mocks).forEach((mocks) => mocks.mockClear()));

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

mocks.wait.mockImplementation(() => sleep(1000));
mocks.stdout.mockImplementation(() => Promise.resolve(''));
mocks.control.mockImplementation((...args: any[]) => {
  jest.unmock('promist');
  return require('promist').control(...args);
});

test(`returns immediately for no services`, async () => {
  let before = Date.now();
  await expect(waitDetect([], 10, 'baz', ['foobar'])).resolves.toBeUndefined();
  expect(Date.now() - before).toBeLessThan(1000);
});
test(`stops waiting at first run if there are no changes`, async () => {
  let before = Date.now();
  const p = waitDetect(['foo', 'bar'], 10, 'baz', ['foobar']);

  await sleep(500);
  expect(mocks.stdout).not.toHaveBeenCalled();

  for (let i of [2, 4]) {
    await sleep(1000);
    expect(mocks.stdout).toHaveBeenCalledTimes(i);
    expect(mocks.stdout).toHaveBeenNthCalledWith(i - 1, 'baz', [
      'foobar',
      'logs',
      'foo'
    ]);
    expect(mocks.stdout).toHaveBeenNthCalledWith(i, 'baz', [
      'foobar',
      'logs',
      'bar'
    ]);
  }

  await expect(p).resolves.toBeUndefined();
  expect(mocks.stdout).toHaveBeenCalledTimes(4);
  expect(Date.now() - before).toBeLessThan(3000);
});
test(`waits until changes stop`, async () => {
  let before = Date.now();
  const p = waitDetect(['foo', 'bar'], 10, 'baz', ['foobar']);

  await sleep(500);
  expect(mocks.stdout).not.toHaveBeenCalled();

  for (let i of [2, 4, 6, 8]) {
    if (i === 4) {
      mocks.stdout.mockImplementationOnce(() => Promise.resolve('hello'));
    }

    await sleep(1000);
    expect(mocks.stdout).toHaveBeenCalledTimes(i);
    expect(mocks.stdout).toHaveBeenNthCalledWith(i - 1, 'baz', [
      'foobar',
      'logs',
      'foo'
    ]);
    expect(mocks.stdout).toHaveBeenNthCalledWith(i, 'baz', [
      'foobar',
      'logs',
      'bar'
    ]);
  }

  await expect(p).resolves.toBeUndefined();
  expect(mocks.stdout).toHaveBeenCalledTimes(8);
  expect(Date.now() - before).toBeLessThan(5000);
});
test(`exits on timeout`, async () => {
  let before = Date.now();
  const p = waitDetect(['foo', 'bar'], 2, 'baz', ['foobar']);

  await sleep(500);
  expect(mocks.stdout).not.toHaveBeenCalled();

  for (let i of [2, 4]) {
    mocks.stdout.mockImplementationOnce(() => Promise.resolve(uuid()));
    await sleep(1000);
    expect(mocks.stdout).toHaveBeenCalledTimes(i);
  }

  await expect(p).resolves.toBeUndefined();
  expect(mocks.stdout).toHaveBeenCalledTimes(4);
  expect(Date.now() - before).toBeLessThan(3000);
});

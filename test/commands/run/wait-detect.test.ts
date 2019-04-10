import waitDetect from '~/commands/run/wait-detect';
import _stdout from '~/utils/stdout';
import { wait as _wait, control as _control } from 'promist';
import uuid from 'uuid/v4';
import { setLevel } from '~/utils/logger';

setLevel('silent');
jest.mock('~/utils/stdout');
jest.mock('promist');
const stdout: any = _stdout;
const wait: any = _wait;
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
wait.mockImplementation(() => sleep(1000));
const control: any = _control;
control.mockImplementation((...args: any[]) => {
  jest.unmock('promist');
  return require('promist').control(...args);
});
stdout.mockImplementation(() => Promise.resolve(''));

test(`returns immediately for no services`, async () => {
  stdout.mockClear();
  let before = Date.now();
  await expect(waitDetect([], 10, 'baz', ['foobar'])).resolves.toBeUndefined();
  expect(Date.now() - before).toBeLessThan(1000);
});
test(`stops waiting at first run if there are no changes`, async () => {
  stdout.mockClear();
  let before = Date.now();
  const p = waitDetect(['foo', 'bar'], 10, 'baz', ['foobar']);

  await sleep(500);
  expect(stdout).not.toHaveBeenCalled();

  for (let i of [2, 4]) {
    await sleep(1000);
    expect(stdout).toHaveBeenCalledTimes(i);
    expect(stdout).toHaveBeenNthCalledWith(i - 1, 'baz', [
      'foobar',
      'logs',
      'foo'
    ]);
    expect(stdout).toHaveBeenNthCalledWith(i, 'baz', ['foobar', 'logs', 'bar']);
  }

  await expect(p).resolves.toBeUndefined();
  expect(stdout).toHaveBeenCalledTimes(4);
  expect(Date.now() - before).toBeLessThan(3000);
});
test(`waits until changes stop`, async () => {
  stdout.mockClear();
  let before = Date.now();
  const p = waitDetect(['foo', 'bar'], 10, 'baz', ['foobar']);

  await sleep(500);
  expect(stdout).not.toHaveBeenCalled();

  for (let i of [2, 4, 6, 8]) {
    if (i === 4) {
      stdout.mockImplementationOnce(() => Promise.resolve('hello'));
    }

    await sleep(1000);
    expect(stdout).toHaveBeenCalledTimes(i);
    expect(stdout).toHaveBeenNthCalledWith(i - 1, 'baz', [
      'foobar',
      'logs',
      'foo'
    ]);
    expect(stdout).toHaveBeenNthCalledWith(i, 'baz', ['foobar', 'logs', 'bar']);
  }

  await expect(p).resolves.toBeUndefined();
  expect(stdout).toHaveBeenCalledTimes(8);
  expect(Date.now() - before).toBeLessThan(5000);
});
test(`exits on timeout`, async () => {
  stdout.mockClear();
  let before = Date.now();
  const p = waitDetect(['foo', 'bar'], 2, 'baz', ['foobar']);

  await sleep(500);
  expect(stdout).not.toHaveBeenCalled();

  for (let i of [2, 4]) {
    stdout.mockImplementationOnce(() => Promise.resolve(uuid()));
    await sleep(1000);
    expect(stdout).toHaveBeenCalledTimes(i);
  }

  await expect(p).resolves.toBeUndefined();
  expect(stdout).toHaveBeenCalledTimes(4);
  expect(Date.now() - before).toBeLessThan(3000);
});

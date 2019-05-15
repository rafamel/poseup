import run from '~/bin/main/run';
import { run as command } from '~/commands';
import { IOfType, IOptions } from '~/types';

jest.mock('~/commands');
const mocks: IOfType<jest.Mock<any, any>> = {
  run: command,
  // eslint-disable-next-line no-console
  console: console.log = jest.fn()
} as any;

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

const base: IOptions = {
  directory: 'foo/bar',
  file: 'baz.js',
  environment: 'foo',
  log: 'debug'
};

test(`shows help`, async () => {
  await expect(run(['--help'], {})).resolves.toBeUndefined();
  await expect(run(['-h'], {})).resolves.toBeUndefined();
  await expect(run('-t 10 --help'.split(' '), {})).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(3);
  expect(mocks.run).not.toHaveBeenCalled();
});
test(`doesn't fail on positional`, async () => {
  await expect(run(['pos'], {})).resolves.toBeUndefined();
  await expect(run('-t 10 pos'.split(' '), {})).resolves.toBeUndefined();
  await expect(run('pos -t 10'.split(' '), {})).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(3);
});
test(`fails on unknown arg`, async () => {
  await expect(
    run('-t 10 -p'.split(' '), {})
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown or unexpected option: -p"`
  );

  expect(mocks.run).not.toHaveBeenCalled();
});
test(`suceeds w/ no args`, async () => {
  await expect(run([], {})).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(1);
  expect(mocks.run).toHaveBeenCalledWith({
    tasks: [],
    list: undefined,
    sandbox: undefined,
    timeout: undefined,
    detect: true
  });
});
test(`passes tasks`, async () => {
  await expect(
    run('task1 task2 task3'.split(' '), {})
  ).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(1);
  expect(mocks.run).toHaveBeenCalledWith({
    tasks: ['task1', 'task2', 'task3'],
    list: undefined,
    sandbox: undefined,
    timeout: undefined,
    detect: true
  });
});
test(`passes all args`, async () => {
  const args = '--list --sandbox --timeout 10 --no-detect'.split(' ');
  await expect(run(args, base)).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(1);
  expect(mocks.run).toHaveBeenCalledWith({
    ...base,
    tasks: [],
    list: true,
    sandbox: true,
    timeout: 10,
    detect: false
  });
});
test(`passes all args as aliases and tasks`, async () => {
  const args = '-l -s -t 10 task1 task2 task3'.split(' ');
  await expect(run(args, base)).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(1);
  expect(mocks.run).toHaveBeenCalledWith({
    ...base,
    tasks: ['task1', 'task2', 'task3'],
    list: true,
    sandbox: true,
    timeout: 10,
    detect: true
  });
});

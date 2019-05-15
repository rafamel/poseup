import run from '~/bin/main/run';
import { run as command } from '~/commands';
import { IOfType } from '~/types';
import { oneLine } from 'common-tags';

jest.mock('~/commands');
const mocks: IOfType<jest.Mock<any, any>> = {
  run: command,
  // eslint-disable-next-line no-console
  console: console.log = jest.fn()
} as any;
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`shows help`, async () => {
  await expect(run(['--help'])).resolves.toBeUndefined();
  await expect(run(['-h'])).resolves.toBeUndefined();
  await expect(run('-e dev --help'.split(' '))).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(3);
  expect(mocks.run).not.toHaveBeenCalled();
});
test(`doesn't fail on positional`, async () => {
  await expect(run(['pos'])).resolves.toBeUndefined();
  await expect(run('-e dev pos'.split(' '))).resolves.toBeUndefined();
  await expect(run('pos -e dev'.split(' '))).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(3);
});
test(`fails on unknown arg`, async () => {
  await expect(
    run('-e dev -p'.split(' '))
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown or unexpected option: -p"`
  );

  expect(mocks.run).not.toHaveBeenCalled();
});
test(`suceeds w/ no args`, async () => {
  await expect(run([])).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(1);
  expect(mocks.run).toHaveBeenCalledWith({
    tasks: [],
    list: undefined,
    sandbox: undefined,
    timeout: undefined,
    detect: true,
    file: undefined,
    environment: undefined,
    directory: undefined,
    log: undefined
  });
});
test(`passes tasks`, async () => {
  await expect(run('task1 task2 task3'.split(' '))).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(1);
  expect(mocks.run).toHaveBeenCalledWith({
    tasks: ['task1', 'task2', 'task3'],
    list: undefined,
    sandbox: undefined,
    timeout: undefined,
    detect: true,
    file: undefined,
    environment: undefined,
    directory: undefined,
    log: undefined
  });
});
test(`passes all args`, async () => {
  const args = oneLine`--list --sandbox --timeout 10 --no-detect --env dev
    --dir ./foo/bar --file foo/bar.js --log debug`.split(' ');
  await expect(run(args)).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(1);
  expect(mocks.run).toHaveBeenCalledWith({
    tasks: [],
    list: true,
    sandbox: true,
    timeout: 10,
    detect: false,
    file: 'foo/bar.js',
    environment: 'dev',
    directory: './foo/bar',
    log: 'debug'
  });
});
test(`passes all args as aliases and tasks`, async () => {
  const args = oneLine`-l -s -t 10 -e dev -d ./foo/bar
    -f foo/bar.js task1 task2 task3`.split(' ');
  await expect(run(args)).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(1);
  expect(mocks.run).toHaveBeenCalledWith({
    tasks: ['task1', 'task2', 'task3'],
    list: true,
    sandbox: true,
    timeout: 10,
    detect: true,
    file: 'foo/bar.js',
    environment: 'dev',
    directory: './foo/bar',
    log: undefined
  });
});

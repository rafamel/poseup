import run from '~/bin/main/run';
import { run as command } from '~/commands';
import { IOfType } from '~/types';
import argv from 'string-argv';

jest.mock('~/commands');
const mocks: IOfType<jest.Mock<any, any>> = {
  run: command,
  // eslint-disable-next-line no-console
  console: console.log = jest.fn()
} as any;
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`shows help`, async () => {
  await expect(run(argv('--help'))).resolves.toBeUndefined();
  await expect(run(argv('-h'))).resolves.toBeUndefined();
  await expect(run(argv('-e dev --help'))).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(3);
  expect(mocks.run).not.toHaveBeenCalled();
});
test(`doesn't fail on positional`, async () => {
  await expect(run(argv('pos'))).resolves.toBeUndefined();
  await expect(run(argv('-e dev pos'))).resolves.toBeUndefined();
  await expect(run(argv('pos -e dev'))).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(3);
});
test(`fails on unknown arg`, async () => {
  await expect(run(argv('-e dev -p'))).rejects.toBeInstanceOf(Error);

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
  await expect(run(argv('task1 task2 task3'))).resolves.toBeUndefined();

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
  const args = argv(
    '--list --sandbox --timeout 10 --no-detect --env dev --dir ./foo/bar --file foo/bar.js --log debug'
  );
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
  const args = argv(
    '-l -s -t 10 -e dev -d ./foo/bar -f foo/bar.js task1 task2 task3'
  );
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

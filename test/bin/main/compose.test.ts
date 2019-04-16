import compose from '~/bin/main/compose';
import { compose as command } from '~/commands';
import { IOfType } from '~/types';
import argv from 'string-argv';

jest.mock('~/commands');
const mocks: IOfType<jest.Mock<any, any>> = {
  compose: command,
  // eslint-disable-next-line no-console
  console: console.log = jest.fn()
} as any;
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`shows help`, async () => {
  await expect(compose(argv('--help'))).resolves.toBeUndefined();
  await expect(compose(argv('-h'))).resolves.toBeUndefined();
  await expect(compose(argv('-e dev --help'))).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(3);
  expect(mocks.compose).not.toHaveBeenCalled();
});
test(`fails on positional`, async () => {
  await expect(compose(argv('pos'))).rejects.toBeInstanceOf(Error);
  await expect(compose(argv('-e dev pos'))).rejects.toBeInstanceOf(Error);
  await expect(compose(argv('pos -e dev'))).rejects.toBeInstanceOf(Error);

  expect(mocks.compose).not.toHaveBeenCalled();
});
test(`fails on unknown arg`, async () => {
  await expect(compose(argv('-e dev -p'))).rejects.toBeInstanceOf(Error);

  expect(mocks.compose).not.toHaveBeenCalled();
});
test(`suceeds w/ no args`, async () => {
  await expect(compose([])).resolves.toBeUndefined();

  expect(mocks.compose).toHaveBeenCalledTimes(1);
  expect(mocks.compose).toHaveBeenCalledWith({
    file: undefined,
    environment: undefined,
    directory: undefined,
    write: undefined,
    log: undefined,
    args: [],
    dry: undefined,
    clean: undefined,
    stop: undefined
  });
});
test(`passes docker args`, async () => {
  await expect(compose(argv('-- foo --bar baz'))).resolves.toBeUndefined();

  expect(mocks.compose).toHaveBeenCalledTimes(1);
  expect(mocks.compose).toHaveBeenCalledWith({
    file: undefined,
    environment: undefined,
    directory: undefined,
    write: undefined,
    log: undefined,
    args: ['foo', '--bar', 'baz'],
    dry: undefined,
    clean: undefined,
    stop: undefined
  });
});
test(`passes all args`, async () => {
  const args = argv(
    '--write foo/bar.yml --stop --clean --dry --env dev --dir ./foo/bar --file foo/bar.js --log debug'
  );
  await expect(compose(args)).resolves.toBeUndefined();

  expect(mocks.compose).toHaveBeenCalledTimes(1);
  expect(mocks.compose).toHaveBeenCalledWith({
    file: 'foo/bar.js',
    environment: 'dev',
    directory: './foo/bar',
    write: 'foo/bar.yml',
    log: 'debug',
    args: [],
    dry: true,
    clean: true,
    stop: true
  });
});
test(`passes all args as aliases and docker args`, async () => {
  const args = argv(
    '-w foo/bar.yml -s -c -e dev -d ./foo/bar -f foo/bar.js -- foo --bar baz'
  );
  await expect(compose(args)).resolves.toBeUndefined();

  expect(mocks.compose).toHaveBeenCalledTimes(1);
  expect(mocks.compose).toHaveBeenCalledWith({
    file: 'foo/bar.js',
    environment: 'dev',
    directory: './foo/bar',
    write: 'foo/bar.yml',
    log: undefined,
    args: ['foo', '--bar', 'baz'],
    dry: undefined,
    clean: true,
    stop: true
  });
});

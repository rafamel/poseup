import compose from '~/bin/main/compose';
import { compose as command } from '~/commands';
import { IOfType } from '~/types';
import { oneLine } from 'common-tags';

jest.mock('~/commands');
const mocks: IOfType<jest.Mock<any, any>> = {
  compose: command,
  // eslint-disable-next-line no-console
  console: console.log = jest.fn()
} as any;
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`shows help`, async () => {
  await expect(compose(['--help'])).resolves.toBeUndefined();
  await expect(compose(['-h'])).resolves.toBeUndefined();
  await expect(compose('-e dev --help'.split(' '))).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(3);
  expect(mocks.compose).not.toHaveBeenCalled();
});
test(`fails on positional`, async () => {
  await expect(compose(['pos'])).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown command: pos"`
  );
  await expect(compose('-e dev pos'.split(' '))).rejects.toThrowError();
  await expect(compose('pos -e dev'.split(' '))).rejects.toThrowError();

  expect(mocks.compose).not.toHaveBeenCalled();
});
test(`fails on unknown arg`, async () => {
  await expect(
    compose('-e dev -p'.split(' '))
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown or unexpected option: -p"`
  );

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
  await expect(compose('-- foo --bar baz'.split(' '))).resolves.toBeUndefined();

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
  const args = oneLine`--write foo/bar.yml --stop --clean --dry --env dev
    --dir ./foo/bar --file foo/bar.js --log debug`.split(' ');
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
  const args = oneLine`-w foo/bar.yml -s -c -e dev -d ./foo/bar
    -f foo/bar.js -- foo --bar baz`.split(' ');
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

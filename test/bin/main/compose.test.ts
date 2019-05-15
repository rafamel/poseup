import compose from '~/bin/main/compose';
import { compose as command } from '~/commands';
import { IOfType, IOptions } from '~/types';

jest.mock('~/commands');
const mocks: IOfType<jest.Mock<any, any>> = {
  compose: command,
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
  await expect(
    compose(
      ['--help'],
      {}
    )
  ).resolves.toBeUndefined();
  await expect(
    compose(
      ['-h'],
      {}
    )
  ).resolves.toBeUndefined();
  await expect(
    compose(
      '-w file --help'.split(' '),
      {}
    )
  ).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(3);
  expect(mocks.compose).not.toHaveBeenCalled();
});
test(`fails on positional`, async () => {
  await expect(
    compose(
      ['pos'],
      {}
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(`"Unknown command: pos"`);
  await expect(
    compose(
      '-w file pos'.split(' '),
      {}
    )
  ).rejects.toThrowError();
  await expect(
    compose(
      'pos -w file'.split(' '),
      {}
    )
  ).rejects.toThrowError();

  expect(mocks.compose).not.toHaveBeenCalled();
});
test(`fails on unknown arg`, async () => {
  await expect(
    compose(
      '-w file -p'.split(' '),
      {}
    )
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown or unexpected option: -p"`
  );

  expect(mocks.compose).not.toHaveBeenCalled();
});
test(`suceeds w/ no args`, async () => {
  await expect(
    compose(
      [],
      {}
    )
  ).resolves.toBeUndefined();

  expect(mocks.compose).toHaveBeenCalledTimes(1);
  expect(mocks.compose).toHaveBeenCalledWith({
    write: undefined,
    args: [],
    dry: undefined,
    clean: undefined,
    stop: undefined
  });
});
test(`passes docker args`, async () => {
  await expect(
    compose(
      '-- foo --bar baz'.split(' '),
      {}
    )
  ).resolves.toBeUndefined();

  expect(mocks.compose).toHaveBeenCalledTimes(1);
  expect(mocks.compose).toHaveBeenCalledWith({
    write: undefined,
    args: ['foo', '--bar', 'baz'],
    dry: undefined,
    clean: undefined,
    stop: undefined
  });
});
test(`passes all args`, async () => {
  const args = '--write foo/bar.yml --stop --clean --dry'.split(' ');
  await expect(
    compose(
      args,
      base
    )
  ).resolves.toBeUndefined();

  expect(mocks.compose).toHaveBeenCalledTimes(1);
  expect(mocks.compose).toHaveBeenCalledWith({
    ...base,
    write: 'foo/bar.yml',
    args: [],
    dry: true,
    clean: true,
    stop: true
  });
});
test(`passes all args as aliases and docker args`, async () => {
  const args = '-w foo/bar.yml -s -c -- foo --bar baz'.split(' ');
  await expect(
    compose(
      args,
      base
    )
  ).resolves.toBeUndefined();

  expect(mocks.compose).toHaveBeenCalledTimes(1);
  expect(mocks.compose).toHaveBeenCalledWith({
    ...base,
    write: 'foo/bar.yml',
    args: ['foo', '--bar', 'baz'],
    dry: undefined,
    clean: true,
    stop: true
  });
});

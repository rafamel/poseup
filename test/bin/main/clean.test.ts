import clean from '~/bin/main/clean';
import { clean as command } from '~/commands';
import { IOfType, IOptions } from '~/types';

jest.mock('~/commands');
const mocks: IOfType<jest.Mock<any, any>> = {
  clean: command,
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
  await expect(clean(['--help'], {})).resolves.toBeUndefined();
  await expect(clean(['-h'], {})).resolves.toBeUndefined();
  await expect(clean('-v --help'.split(' '), {})).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(3);
  expect(mocks.clean).not.toHaveBeenCalled();
});
test(`fails on positional`, async () => {
  await expect(clean(['pos'], {})).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown command: pos"`
  );
  await expect(clean('-v pos'.split(' '), {})).rejects.toThrowError();
  await expect(clean('pos -v'.split(' '), {})).rejects.toThrowError();

  expect(mocks.clean).not.toHaveBeenCalled();
});
test(`fails on unknown arg`, async () => {
  await expect(
    clean('-p'.split(' '), {})
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown or unexpected option: -p"`
  );

  expect(mocks.clean).not.toHaveBeenCalled();
});
test(`suceeds w/ no args`, async () => {
  await expect(clean([], {})).resolves.toBeUndefined();

  expect(mocks.clean).toHaveBeenCalledTimes(1);
  expect(mocks.clean).toHaveBeenCalledWith({
    volumes: undefined
  });
});
test(`passes all args`, async () => {
  const args = ['--volumes'];
  await expect(clean(args, base)).resolves.toBeUndefined();

  expect(mocks.clean).toHaveBeenCalledTimes(1);
  expect(mocks.clean).toHaveBeenCalledWith({
    ...base,
    volumes: true
  });
});
test(`passes all args as aliases`, async () => {
  const args = ['-v'];
  await expect(clean(args, base)).resolves.toBeUndefined();

  expect(mocks.clean).toHaveBeenCalledTimes(1);
  expect(mocks.clean).toHaveBeenCalledWith({
    ...base,
    volumes: true
  });
});

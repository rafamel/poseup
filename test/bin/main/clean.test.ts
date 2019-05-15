import clean from '~/bin/main/clean';
import { clean as command } from '~/commands';
import { IOfType } from '~/types';
import { oneLine } from 'common-tags';

jest.mock('~/commands');
const mocks: IOfType<jest.Mock<any, any>> = {
  clean: command,
  // eslint-disable-next-line no-console
  console: console.log = jest.fn()
} as any;
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`shows help`, async () => {
  await expect(clean(['--help'])).resolves.toBeUndefined();
  await expect(clean(['-h'])).resolves.toBeUndefined();
  await expect(clean('-e dev --help'.split(' '))).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(3);
  expect(mocks.clean).not.toHaveBeenCalled();
});
test(`fails on positional`, async () => {
  await expect(clean(['pos'])).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown command: pos"`
  );
  await expect(clean('-e dev pos'.split(' '))).rejects.toThrowError();
  await expect(clean('pos -e dev'.split(' '))).rejects.toThrowError();

  expect(mocks.clean).not.toHaveBeenCalled();
});
test(`fails on unknown arg`, async () => {
  await expect(
    clean('-e dev -p'.split(' '))
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown or unexpected option: -p"`
  );

  expect(mocks.clean).not.toHaveBeenCalled();
});
test(`suceeds w/ no args`, async () => {
  await expect(clean([])).resolves.toBeUndefined();

  expect(mocks.clean).toHaveBeenCalledTimes(1);
  expect(mocks.clean).toHaveBeenCalledWith({
    volumes: undefined,
    file: undefined,
    directory: undefined,
    environment: undefined,
    log: undefined
  });
});
test(`passes all args`, async () => {
  const args = oneLine`--volumes --env dev --dir ./foo/bar
    --file foo/bar.js --log debug`.split(' ');
  await expect(clean(args)).resolves.toBeUndefined();

  expect(mocks.clean).toHaveBeenCalledTimes(1);
  expect(mocks.clean).toHaveBeenCalledWith({
    volumes: true,
    file: 'foo/bar.js',
    directory: './foo/bar',
    environment: 'dev',
    log: 'debug'
  });
});
test(`passes all args as aliases`, async () => {
  const args = '-v -e dev -d ./foo/bar -f foo/bar.js'.split(' ');
  await expect(clean(args)).resolves.toBeUndefined();

  expect(mocks.clean).toHaveBeenCalledTimes(1);
  expect(mocks.clean).toHaveBeenCalledWith({
    volumes: true,
    file: 'foo/bar.js',
    directory: './foo/bar',
    environment: 'dev',
    log: undefined
  });
});

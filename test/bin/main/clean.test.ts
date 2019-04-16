import clean from '~/bin/main/clean';
import { clean as command } from '~/commands';
import { IOfType } from '~/types';
import argv from 'string-argv';

jest.mock('~/commands');
const mocks: IOfType<jest.Mock<any, any>> = {
  clean: command,
  // eslint-disable-next-line no-console
  console: console.log = jest.fn()
} as any;
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`shows help`, async () => {
  await expect(clean(argv('--help'))).resolves.toBeUndefined();
  await expect(clean(argv('-h'))).resolves.toBeUndefined();
  await expect(clean(argv('-e dev --help'))).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(3);
  expect(mocks.clean).not.toHaveBeenCalled();
});
test(`fails on positional`, async () => {
  await expect(clean(argv('pos'))).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown command: pos"`
  );
  await expect(clean(argv('-e dev pos'))).rejects.toThrowError();
  await expect(clean(argv('pos -e dev'))).rejects.toThrowError();

  expect(mocks.clean).not.toHaveBeenCalled();
});
test(`fails on unknown arg`, async () => {
  await expect(
    clean(argv('-e dev -p'))
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
  const args = argv(
    '--volumes --env dev --dir ./foo/bar --file foo/bar.js --log debug'
  );
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
  const args = argv('-v -e dev -d ./foo/bar -f foo/bar.js');
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

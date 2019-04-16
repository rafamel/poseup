import purge from '~/bin/main/purge';
import { purge as command } from '~/commands';
import { IOfType } from '~/types';
import argv from 'string-argv';

jest.mock('~/commands');
const mocks: IOfType<jest.Mock<any, any>> = {
  purge: command,
  // eslint-disable-next-line no-console
  console: console.log = jest.fn()
} as any;
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`shows help`, async () => {
  await expect(purge(argv('--help'))).resolves.toBeUndefined();
  await expect(purge(argv('-h'))).resolves.toBeUndefined();
  await expect(purge(argv('-f --help'))).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(3);
  expect(mocks.purge).not.toHaveBeenCalled();
});
test(`fails on positional`, async () => {
  await expect(purge(argv('pos'))).rejects.toBeInstanceOf(Error);
  await expect(purge(argv('-f pos'))).rejects.toBeInstanceOf(Error);
  await expect(purge(argv('pos -f'))).rejects.toBeInstanceOf(Error);

  expect(mocks.purge).not.toHaveBeenCalled();
});
test(`fails on unknown arg`, async () => {
  await expect(purge(argv('-f -p'))).rejects.toBeInstanceOf(Error);

  expect(mocks.purge).not.toHaveBeenCalled();
});
test(`suceeds w/ no args`, async () => {
  await expect(purge([])).resolves.toBeUndefined();

  expect(mocks.purge).toHaveBeenCalledTimes(1);
  expect(mocks.purge).toHaveBeenCalledWith({
    force: undefined,
    log: undefined
  });
});
test(`passes all args`, async () => {
  await expect(purge(argv('--force --log debug'))).resolves.toBeUndefined();

  expect(mocks.purge).toHaveBeenCalledTimes(1);
  expect(mocks.purge).toHaveBeenCalledWith({
    force: true,
    log: 'debug'
  });
});
test(`passes all args as aliases`, async () => {
  await expect(purge(argv('-f'))).resolves.toBeUndefined();

  expect(mocks.purge).toHaveBeenCalledTimes(1);
  expect(mocks.purge).toHaveBeenCalledWith({
    force: true,
    log: undefined
  });
});

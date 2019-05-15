import purge from '~/bin/main/purge';
import { purge as command } from '~/commands';
import { IOfType } from '~/types';

jest.mock('~/commands');
const mocks: IOfType<jest.Mock<any, any>> = {
  purge: command,
  // eslint-disable-next-line no-console
  console: console.log = jest.fn()
} as any;

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`shows help`, async () => {
  await expect(purge(['--help'], {})).resolves.toBeUndefined();
  await expect(purge(['-h'], {})).resolves.toBeUndefined();
  await expect(purge('-f --help'.split(' '), {})).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(3);
  expect(mocks.purge).not.toHaveBeenCalled();
});
test(`fails on positional`, async () => {
  await expect(purge(['pos'], {})).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown command: pos"`
  );
  await expect(purge('-f pos'.split(' '), {})).rejects.toThrowError();
  await expect(purge('pos -f'.split(' '), {})).rejects.toThrowError();

  expect(mocks.purge).not.toHaveBeenCalled();
});
test(`fails on unknown arg`, async () => {
  await expect(
    purge('-f -p'.split(' '), {})
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown or unexpected option: -p"`
  );

  expect(mocks.purge).not.toHaveBeenCalled();
});
test(`suceeds w/ no args`, async () => {
  await expect(purge([], {})).resolves.toBeUndefined();

  expect(mocks.purge).toHaveBeenCalledTimes(1);
  expect(mocks.purge).toHaveBeenCalledWith({
    force: undefined
  });
});
test(`passes all args`, async () => {
  await expect(
    purge('--force'.split(' '), { log: 'debug' })
  ).resolves.toBeUndefined();

  expect(mocks.purge).toHaveBeenCalledTimes(1);
  expect(mocks.purge).toHaveBeenCalledWith({
    force: true,
    log: 'debug'
  });
});
test(`passes all args as aliases`, async () => {
  await expect(purge(['-f'], { log: 'debug' })).resolves.toBeUndefined();

  expect(mocks.purge).toHaveBeenCalledTimes(1);
  expect(mocks.purge).toHaveBeenCalledWith({
    force: true,
    log: 'debug'
  });
});

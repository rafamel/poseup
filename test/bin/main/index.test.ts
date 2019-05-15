import main from '~/bin/main';
import compose from '~/bin/main/compose';
import run from '~/bin/main/run';
import clean from '~/bin/main/clean';
import purge from '~/bin/main/purge';
import { setLevel } from '~/utils/logger';
import { IOfType } from '~/types';
import { oneLine } from 'common-tags';

jest.mock('~/bin/main/compose');
jest.mock('~/bin/main/run');
jest.mock('~/bin/main/clean');
jest.mock('~/bin/main/purge');
jest.mock('~/utils/logger');
const mocks: IOfType<jest.Mock<any, any>> = {
  compose,
  run,
  clean,
  purge,
  // eslint-disable-next-line no-console
  console: console.log = jest.fn(),
  setLevel
} as any;

const mv = [mocks.console, mocks.compose, mocks.run, mocks.clean, mocks.purge];
beforeEach(() => mv.forEach((mock) => mock.mockClear()));

test(`shows help`, async () => {
  await expect(main(['--help'])).resolves.toBeUndefined();
  await expect(main(['-h'])).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(2);
  mv.slice(1).forEach((mock) => expect(mock).not.toHaveBeenCalled());
});
test(`shows version`, async () => {
  await expect(main(['--version'])).resolves.toBeUndefined();
  await expect(main(['-v'])).resolves.toBeUndefined();

  expect(mocks.console).toHaveBeenCalledTimes(2);
  mv.slice(1).forEach((mock) => expect(mock).not.toHaveBeenCalled());
});
test(`fails on unknown command`, async () => {
  await expect(main(['pos'])).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown command: pos"`
  );

  mv.forEach((mock) => expect(mock).not.toHaveBeenCalled());
});
test(`shows help and fails on no command`, async () => {
  await expect(main([])).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Poseup requires a command"`
  );

  expect(mocks.console).toHaveBeenCalledTimes(1);
  mv.slice(1).forEach((mock) => expect(mock).not.toHaveBeenCalled());
});
test(`fails on unknown arg`, async () => {
  await expect(
    main('-g dev'.split(' '))
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown or unexpected option: -g"`
  );

  mv.forEach((mock) => expect(mock).not.toHaveBeenCalled());
});
test(`suceeds on compose`, async () => {
  const args = oneLine`-d foo/bar -f baz.js -e foo --log bar
    compose --foo bar baz`.split(' ');
  await expect(main(args)).resolves.toBeUndefined();

  expect(mocks.compose).toHaveBeenCalledTimes(1);
  expect(mocks.compose).toHaveBeenCalledWith(['--foo', 'bar', 'baz'], {
    directory: 'foo/bar',
    file: 'baz.js',
    environment: 'foo',
    log: 'bar'
  });

  mv.slice(2)
    .concat(mv[0])
    .forEach((mock) => expect(mock).not.toHaveBeenCalled());
});
test(`suceeds on run`, async () => {
  const args = oneLine`-d foo/bar -f baz.js -e foo --log bar
    run --foo bar baz`.split(' ');
  await expect(main(args)).resolves.toBeUndefined();

  expect(mocks.run).toHaveBeenCalledTimes(1);
  expect(mocks.run).toHaveBeenCalledWith(['--foo', 'bar', 'baz'], {
    directory: 'foo/bar',
    file: 'baz.js',
    environment: 'foo',
    log: 'bar'
  });

  mv.slice(3)
    .concat(mv.slice(0, 2))
    .forEach((mock) => expect(mock).not.toHaveBeenCalled());
});
test(`suceeds on clean`, async () => {
  const args = oneLine`-d foo/bar -f baz.js -e foo --log bar
    clean --foo bar baz`.split(' ');
  await expect(main(args)).resolves.toBeUndefined();

  expect(mocks.clean).toHaveBeenCalledTimes(1);
  expect(mocks.clean).toHaveBeenCalledWith(['--foo', 'bar', 'baz'], {
    directory: 'foo/bar',
    file: 'baz.js',
    environment: 'foo',
    log: 'bar'
  });

  mv.slice(4)
    .concat(mv.slice(0, 3))
    .forEach((mock) => expect(mock).not.toHaveBeenCalled());
});
test(`suceeds on purge`, async () => {
  const args = oneLine`-d foo/bar -f baz.js -e foo --log bar
    purge --foo bar baz`.split(' ');
  await expect(main(args)).resolves.toBeUndefined();

  expect(mocks.purge).toHaveBeenCalledTimes(1);
  expect(mocks.purge).toHaveBeenCalledWith(['--foo', 'bar', 'baz'], {
    directory: 'foo/bar',
    file: 'baz.js',
    environment: 'foo',
    log: 'bar'
  });

  mv.slice(0, 4).forEach((mock) => expect(mock).not.toHaveBeenCalled());
});
test(`sets logging level`, async () => {
  mocks.setLevel.mockClear();

  await expect(main(['compose'])).resolves.toBeUndefined();
  expect(mocks.setLevel).not.toHaveBeenCalled();

  await expect(main('--log debug compose'.split(' '))).resolves.toBeUndefined();
  expect(mocks.setLevel).toHaveBeenCalledTimes(1);
  expect(mocks.setLevel).toHaveBeenCalledWith('debug');
});

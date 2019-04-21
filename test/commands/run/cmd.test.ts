import runCmd from '~/commands/run/cmd';
import spawn from '~/utils/spawn';
import up from 'find-up';
import { setLevel } from '~/utils/logger';
import { IOfType } from '~/types';

setLevel('silent');
jest.mock('~/utils/spawn');
jest.mock('find-up');

const mocks: IOfType<jest.Mock<any, any>> = {
  spawn,
  up
} as any;

beforeEach(() => Object.values(mocks).forEach((mocks) => mocks.mockClear()));

mocks.up.mockImplementation(async () => null);

describe(`task.command`, () => {
  test(`succeeds`, async () => {
    await expect(runCmd({ cmd: ['foo'] }, '')).resolves.toBeUndefined();
  });
  test(`fails`, async () => {
    await expect(runCmd({}, '')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Task has no cmd"`
    );
    await expect(runCmd({ cmd: [] }, '')).rejects.toThrowError();
  });
});
describe(`spawn call`, () => {
  test(`succeeds`, async () => {
    mocks.up.mockImplementationOnce(async () => '/up/foo/bar');

    await expect(runCmd({ cmd: ['foo'] }, 'foo/bar')).resolves.toBeUndefined();
    await expect(
      runCmd({ cmd: ['foo', 'bar', 'baz'] }, 'foo/bar')
    ).resolves.toBeUndefined();
    expect(mocks.up).toHaveBeenCalledTimes(2);
    expect(mocks.up).toHaveBeenNthCalledWith(1, 'node_modules/.bin', {
      cwd: 'foo/bar'
    });
    expect(mocks.up).toHaveBeenNthCalledWith(2, 'node_modules/.bin', {
      cwd: 'foo/bar'
    });
    expect(mocks.spawn).toHaveBeenCalledTimes(2);
    expect(mocks.spawn.mock.calls[0][0]).toBe('foo');
    expect(mocks.spawn.mock.calls[0][1]).toEqual([]);
    expect(mocks.spawn.mock.calls[0][2]).toHaveProperty('env');
    expect(
      mocks.spawn.mock.calls[0][2].env.PATH.split(':')[0].includes(
        '/up/foo/bar'
      )
    ).toBe(true);

    expect(mocks.spawn.mock.calls[1][0]).toBe('foo');
    expect(mocks.spawn.mock.calls[1][1]).toEqual(['bar', 'baz']);
    expect(mocks.spawn.mock.calls[1][2]).toHaveProperty('env');
    expect(
      mocks.spawn.mock.calls[1][2].env.PATH.split(':')[0].includes(
        '/up/foo/bar'
      )
    ).toBe(false);
  });
  test(`fails`, async () => {
    mocks.spawn.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(runCmd({ cmd: ['foo'] }, '')).rejects.toThrowError();
  });
});

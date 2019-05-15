import runCmd from '~/commands/run/cmd';
import spawn from '~/utils/spawn';
import nrp from 'npm-run-path';
import { setLevel } from '~/utils/logger';
import { IOfType } from '~/types';

setLevel('silent');
jest.mock('~/utils/spawn');
jest.mock('npm-run-path');

const mocks: IOfType<jest.Mock<any, any>> = {
  spawn,
  env: nrp.env
} as any;

beforeEach(() => Object.values(mocks).forEach((mocks) => mocks.mockClear()));

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
    const response = {};
    mocks.env.mockImplementationOnce(() => response);

    await expect(runCmd({ cmd: ['foo'] }, 'foo/bar')).resolves.toBeUndefined();
    await expect(
      runCmd({ cmd: ['foo', 'bar', 'baz'] }, 'foo/bar')
    ).resolves.toBeUndefined();
    expect(mocks.env).toHaveBeenCalledTimes(2);
    expect(mocks.env).toHaveBeenNthCalledWith(1, { cwd: 'foo/bar' });
    expect(mocks.env).toHaveBeenNthCalledWith(2, { cwd: 'foo/bar' });
    expect(mocks.spawn).toHaveBeenCalledTimes(2);
    expect(mocks.spawn.mock.calls[0][0]).toBe('foo');
    expect(mocks.spawn.mock.calls[0][1]).toEqual([]);
    expect(mocks.spawn.mock.calls[0][2]).toEqual({ cwd: 'foo/bar', env: {} });
    expect(mocks.spawn.mock.calls[0][2].env).toBe(response);

    expect(mocks.spawn.mock.calls[1][0]).toBe('foo');
    expect(mocks.spawn.mock.calls[1][1]).toEqual(['bar', 'baz']);
    expect(mocks.spawn.mock.calls[0][2]).toEqual({ cwd: 'foo/bar', env: {} });
    expect(mocks.spawn.mock.calls[0][2].env).toBe(response);
  });
  test(`fails`, async () => {
    mocks.spawn.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(runCmd({ cmd: ['foo'] }, '')).rejects.toThrowError();
  });
});

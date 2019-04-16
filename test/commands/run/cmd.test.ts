import runCmd from '~/commands/run/cmd';
import spawn from '~/utils/spawn';
import { setLevel } from '~/utils/logger';
import { IOfType } from '~/types';

setLevel('silent');
jest.mock('~/utils/spawn');

const mocks: IOfType<jest.Mock<any, any>> = {
  spawn
} as any;
beforeEach(() => Object.values(mocks).forEach((mocks) => mocks.mockClear()));

describe(`task.command`, () => {
  test(`succeeds`, async () => {
    await expect(runCmd({ cmd: ['foo'] })).resolves.toBeUndefined();
  });
  test(`fails`, async () => {
    await expect(runCmd({})).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Task has no cmd"`
    );
    await expect(runCmd({ cmd: [] })).rejects.toThrowError();
  });
});
describe(`spawn call`, () => {
  test(`succeeds`, async () => {
    await expect(runCmd({ cmd: ['foo'] })).resolves.toBeUndefined();
    await expect(
      runCmd({ cmd: ['foo', 'bar', 'baz'] })
    ).resolves.toBeUndefined();
    expect(mocks.spawn).toHaveBeenCalledTimes(2);
    expect(mocks.spawn).toHaveBeenNthCalledWith(1, 'foo', []);
    expect(mocks.spawn).toHaveBeenNthCalledWith(2, 'foo', ['bar', 'baz']);
  });
  test(`fails`, async () => {
    mocks.spawn.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(runCmd({ cmd: ['foo'] })).rejects.toThrowError();
  });
});

import getCmd from '~/commands/clean/get-cmd';
import strip from '~/commands/clean/strip-services';
import write from '~/utils/write-yaml';
import { IBuild } from '~/builder';
import { IOfType } from '~/types';

jest.mock('~/commands/clean/strip-services');
jest.mock('~/utils/write-yaml');

const mocks: IOfType<jest.Mock<any, any>> = {
  strip,
  write
} as any;
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

let args: any[] | null = null;
const build: IBuild = {
  config: { persist: ['foo', 'bar'], compose: { baz: 'foobar' } },
  getCmd(...x: any[]): any {
    args = x;
    return 'response';
  }
} as any;

describe(`strip call`, () => {
  test(`succeeds`, async () => {
    await expect(getCmd(build)).resolves.toBe('response');
    expect(mocks.strip).toHaveBeenCalledTimes(1);
    expect(mocks.strip).toHaveBeenCalledWith(['foo', 'bar'], { baz: 'foobar' });
  });
  test(`fails`, async () => {
    mocks.strip.mockImplementationOnce(() => {
      throw Error();
    });
    await expect(getCmd(build)).rejects.toBeInstanceOf(Error);
  });
});
describe(`write call`, () => {
  test(`succeeds`, async () => {
    await expect(getCmd(build)).resolves.toBe('response');
    expect(mocks.write).toHaveBeenCalledTimes(1);
    expect(mocks.write).toHaveBeenCalledWith({ data: { baz: 'foobar' } });
  });
  test(`fails`, async () => {
    mocks.write.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(getCmd(build)).rejects.toBeInstanceOf(Error);
  });
});
describe(`builder().getCmd call`, () => {
  test(`succeeds wo/ volumes`, async () => {
    args = [];
    await expect(getCmd(build)).resolves.toBe('response');
    expect(args).toEqual([{ file: 'foo/bar/baz.js', args: ['down'] }]);

    args = [];
    await expect(getCmd(build, false)).resolves.toBe('response');
    expect(args).toEqual([{ file: 'foo/bar/baz.js', args: ['down'] }]);
  });
  test(`succeeds w/ volumes`, async () => {
    args = [];

    await expect(getCmd(build, true)).resolves.toBe('response');
    expect(args).toEqual([
      { file: 'foo/bar/baz.js', args: ['down', '--volumes'] }
    ]);
  });
});

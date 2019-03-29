import getCmd from '../../../src/commands/clean/get-cmd';
import _strip from '../../../src/commands/clean/strip-services';
import _write from '../../../src/utils/write-yaml';
import { IBuild } from '../../../src/builder';

const strip: any = _strip;
const write: any = _write;
jest.mock('../../../src/commands/clean/strip-services');
jest.mock('../../../src/utils/write-yaml');

strip.mockImplementation((a: string[], b: any) => b);
write.mockImplementation(() => Promise.resolve('foo/bar'));
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
    strip.mockClear();

    await expect(getCmd(build)).resolves.toBe('response');
    expect(strip).toHaveBeenCalledTimes(1);
    expect(strip).toHaveBeenCalledWith(['foo', 'bar'], { baz: 'foobar' });
  });
  test(`fails`, async () => {
    strip.mockImplementationOnce(() => {
      throw Error();
    });
    await expect(getCmd(build)).rejects.toBeInstanceOf(Error);
  });
});
describe(`write call`, () => {
  test(`succeeds`, async () => {
    write.mockClear();

    await expect(getCmd(build)).resolves.toBe('response');
    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith({ data: { baz: 'foobar' } });
  });
  test(`fails`, async () => {
    write.mockImplementationOnce(() => Promise.reject(Error()));
    await expect(getCmd(build)).rejects.toBeInstanceOf(Error);
  });
});
describe(`builder().getCmd call`, () => {
  test(`succeeds wo/ volumes`, async () => {
    args = [];
    await expect(getCmd(build)).resolves.toBe('response');
    expect(args).toEqual([{ file: 'foo/bar', args: ['down'] }]);

    args = [];
    await expect(getCmd(build, false)).resolves.toBe('response');
    expect(args).toEqual([{ file: 'foo/bar', args: ['down'] }]);
  });
  test(`succeeds w/ volumes`, async () => {
    args = [];

    await expect(getCmd(build, true)).resolves.toBe('response');
    expect(args).toEqual([{ file: 'foo/bar', args: ['down', '--volumes'] }]);
  });
});

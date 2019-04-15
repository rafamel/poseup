import getFile from '~/builder/get-file';
import readFile from '~/builder/read-file';
import validate from '~/builder/validate';
import cmdBuilder from '~/builder/cmd-builder';
import builder from '~/builder';
import { IOfType } from '~/types';

jest.mock('~/builder/get-file');
jest.mock('~/builder/read-file');
jest.mock('~/builder/validate');
jest.mock('~/builder/cmd-builder');

const mocks: IOfType<jest.Mock<any, any>> = {
  getFile,
  readFile,
  validate,
  cmdBuilder
} as any;
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

describe(`args`, () => {
  test(`succeeds on empty`, async () => {
    await expect(builder()).resolves.not.toBeUndefined();
    await expect(builder({})).resolves.not.toBeUndefined();
  });
});
describe(`getFile()`, () => {
  test(`succeeds`, async () => {
    await expect(builder({ directory: 'bar/baz' }));
    await expect(builder({ file: 'foo.js', directory: 'bar/baz' }));
    await expect(
      builder({ file: 'foo.js', directory: 'bar/baz' })
    ).resolves.not.toBeUndefined();
    expect(mocks.getFile).toHaveBeenCalledTimes(3);
    expect(mocks.getFile).toHaveBeenNthCalledWith(1, { directory: 'bar/baz' });
    expect(getFile).toHaveBeenNthCalledWith(2, {
      file: 'foo.js',
      directory: 'bar/baz'
    });
    expect(mocks.getFile).toHaveBeenNthCalledWith(3, {
      file: 'foo.js',
      directory: 'bar/baz'
    });
  });
  test(`fails`, async () => {
    const err = Error();
    mocks.getFile.mockImplementationOnce(() => Promise.reject(err));
    const opts = { file: 'foo.js', directory: '/bar/baz' };

    await expect(builder(opts)).rejects.toBe(err);
  });
});
describe(`readFile()`, () => {
  test(`succeeds`, async () => {
    await expect(builder()).resolves.not.toBeUndefined();
    expect(mocks.readFile).toHaveBeenCalledTimes(1);
    expect(mocks.readFile).toHaveBeenCalledWith('foo/bar/baz.js');
  });
  test(`fails`, async () => {
    const err = Error();
    mocks.readFile.mockImplementationOnce(() => Promise.reject(err));

    await expect(builder()).rejects.toBe(err);
  });
});
describe(`validate()`, () => {
  test(`succeeds`, async () => {
    await expect(builder()).resolves.not.toBeUndefined();
    expect(mocks.validate).toHaveBeenCalledTimes(1);
    expect(mocks.validate).toHaveBeenCalledWith({
      project: 'foo',
      compose: { services: { foo: {}, bar: {} } }
    });
  });
  test(`fails`, async () => {
    const err = Error();
    mocks.validate.mockImplementationOnce(() => {
      throw err;
    });

    await expect(builder()).rejects.toBe(err);
  });
});
describe(`response`, () => {
  test(`config`, async () => {
    await expect(builder()).resolves.toHaveProperty('config', {
      project: 'foo',
      compose: { services: { foo: {}, bar: {} } }
    });
  });
  test(`directory`, async () => {
    await expect(builder()).resolves.toHaveProperty('directory', 'foo/bar');
  });
  test(`getCmd with no dir, no args`, async () => {
    const res = await builder();
    expect(typeof res.getCmd).toBe('function');

    const getCmd = res.getCmd;
    expect(getCmd({ file: 'some/file.js' })).toEqual({
      cmd: 'foo',
      args: ['bar', 'baz']
    });
    expect(mocks.cmdBuilder).toHaveBeenCalledTimes(1);
    expect(mocks.cmdBuilder).toHaveBeenCalledWith({
      project: 'foo',
      args: undefined,
      file: 'some/file.js',
      directory: 'foo/bar'
    });
  });
  test(`getCmd with no args`, async () => {
    const res = await builder();
    expect(typeof res.getCmd).toBe('function');

    const getCmd = res.getCmd;
    expect(getCmd({ file: 'some/file.js' })).toEqual({
      cmd: 'foo',
      args: ['bar', 'baz']
    });
    expect(mocks.cmdBuilder).toHaveBeenCalledTimes(1);
    expect(mocks.cmdBuilder).toHaveBeenCalledWith({
      project: 'foo',
      args: undefined,
      file: 'some/file.js',
      directory: 'foo/bar'
    });
  });
  test(`getCmd with no dir`, async () => {
    const res = await builder();
    expect(typeof res.getCmd).toBe('function');

    const getCmd = res.getCmd;
    expect(getCmd({ file: 'some/file.js', args: ['foo'] })).toEqual({
      cmd: 'foo',
      args: ['bar', 'baz']
    });
    expect(mocks.cmdBuilder).toHaveBeenCalledTimes(1);
    expect(mocks.cmdBuilder).toHaveBeenCalledWith({
      project: 'foo',
      args: ['foo'],
      file: 'some/file.js',
      directory: 'foo/bar'
    });
  });
});

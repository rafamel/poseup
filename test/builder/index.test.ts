import _getFile from '../../src/builder/get-file';
import _readFile from '../../src/builder/read-file';
import _validate from '../../src/builder/validate';
import _cmdBuilder from '../../src/builder/cmd-builder';
import builder from '../../src/builder';

const getFile: any = _getFile;
const readFile: any = _readFile;
const validate: any = _validate;
const cmdBuilder: any = _cmdBuilder;
jest.mock('../../src/builder/get-file');
jest.mock('../../src/builder/read-file');
jest.mock('../../src/builder/validate');
jest.mock('../../src/builder/cmd-builder');

readFile.mockImplementation(() => ({ project: 'foo' }));
getFile.mockImplementation(() => 'bar/baz/foo.js');
cmdBuilder.mockImplementation(() => 'CMD');

describe(`args`, () => {
  test(`succeeds on empty`, async () => {
    await expect(builder()).resolves.not.toBeUndefined();
    await expect(builder({})).resolves.not.toBeUndefined();
  });
});
describe(`getFile()`, () => {
  test(`succeeds`, async () => {
    getFile.mockClear();
    const opts = { file: 'foo.js', directory: 'bar/baz' };

    await expect(builder(opts)).resolves.not.toBeUndefined();
    expect(getFile).toHaveBeenCalledTimes(1);
    expect(getFile).toHaveBeenCalledWith(opts);
  });
  test(`fails`, async () => {
    getFile.mockClear();
    const err = Error();
    getFile.mockImplementationOnce(() => Promise.reject(err));
    const opts = { file: 'foo.js', directory: 'bar/baz' };

    await expect(builder(opts)).rejects.toBe(err);
  });
});
describe(`readFile()`, () => {
  test(`succeeds`, async () => {
    readFile.mockClear();

    await expect(builder()).resolves.not.toBeUndefined();
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith('bar/baz/foo.js');
  });
  test(`fails`, async () => {
    readFile.mockClear();
    const err = Error();
    readFile.mockImplementationOnce(() => Promise.reject(err));

    await expect(builder()).rejects.toBe(err);
  });
});
describe(`validate()`, () => {
  test(`succeeds`, async () => {
    validate.mockClear();

    await expect(builder()).resolves.not.toBeUndefined();
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledWith({ project: 'foo' });
  });
  test(`fails`, async () => {
    validate.mockClear();
    const err = Error();
    validate.mockImplementationOnce(() => {
      throw err;
    });

    await expect(builder()).rejects.toBe(err);
  });
});
describe(`response`, () => {
  test(`config`, async () => {
    await expect(builder()).resolves.toHaveProperty('config', {
      project: 'foo'
    });
  });
  test(`getCmd with no dir, no args`, async () => {
    cmdBuilder.mockClear();

    const res = await builder();
    expect(typeof res.getCmd).toBe('function');

    const getCmd = res.getCmd;
    expect(getCmd({ file: 'some/file.js' })).toBe('CMD');
    expect(cmdBuilder).toHaveBeenCalledTimes(1);
    expect(cmdBuilder).toHaveBeenCalledWith({
      project: 'foo',
      args: undefined,
      file: 'some/file.js',
      directory: 'some'
    });
  });
  test(`getCmd with no args`, async () => {
    cmdBuilder.mockClear();

    const res = await builder({ directory: 'foobar' });
    expect(typeof res.getCmd).toBe('function');

    const getCmd = res.getCmd;
    expect(getCmd({ file: 'some/file.js' })).toBe('CMD');
    expect(cmdBuilder).toHaveBeenCalledTimes(1);
    expect(cmdBuilder).toHaveBeenCalledWith({
      project: 'foo',
      args: undefined,
      file: 'some/file.js',
      directory: 'foobar'
    });
  });
  test(`getCmd with no dir`, async () => {
    cmdBuilder.mockClear();

    const res = await builder();
    expect(typeof res.getCmd).toBe('function');

    const getCmd = res.getCmd;
    expect(getCmd({ file: 'some/file.js', args: ['foo'] })).toBe('CMD');
    expect(cmdBuilder).toHaveBeenCalledTimes(1);
    expect(cmdBuilder).toHaveBeenCalledWith({
      project: 'foo',
      args: ['foo'],
      file: 'some/file.js',
      directory: 'some'
    });
  });
});

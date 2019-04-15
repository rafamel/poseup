import { add } from '~/utils/teardown';
import writeYaml from '~/utils/write-yaml';
import ensure from '~/utils/ensure';
import { TMP_DIR } from '~/constants';
import fs from 'fs-extra';
import path from 'path';
import uuid from 'uuid/v4';
import pify from 'pify';
import { IOfType } from '~/types';

jest.mock('~/utils/teardown');
const mocks: IOfType<jest.Mock<any, any>> = {
  add
} as any;
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

const file = path.join(TMP_DIR, 'foo.yml');
const nested = path.join(TMP_DIR, uuid(), 'foo.yml');
const files = [file];
afterAll(async () => {
  for (let file of files) {
    try {
      await pify(fs.unlink)(file);
    } catch (e) {}
  }
  await pify(fs.remove)(path.parse(nested).dir);
});

const read = (file: string): Promise<string> => {
  return ensure.rejection(() =>
    pify(fs.readFile)(file).then((x) => String(x).trim())
  );
};

describe(`explicit path`, () => {
  test(`creates file`, async () => {
    await expect(
      writeYaml({
        path: file,
        data: 'foo'
      })
    ).resolves.toBe(file);
    await expect(read(file)).resolves.toBe('foo');
  });
  test(`creates dir if not non existent`, async () => {
    await expect(
      writeYaml({
        path: nested,
        data: 'foo'
      })
    ).resolves.toBe(nested);
    await expect(read(nested)).resolves.toBe('foo');
  });
  test(`doesn't call add`, async () => {
    await expect(
      writeYaml({
        path: file,
        data: 'foo'
      })
    ).resolves.toBe(file);
    expect(mocks.add).not.toHaveBeenCalled();
  });
});
describe(`random path`, () => {
  test(`creates file`, async () => {
    const file = await writeYaml({ data: 'foo' }).catch(() => 'fail');
    files.push(file);

    await expect(read(file)).resolves.toBe('foo');
  });
  test(`calls add w/ file removing callback`, async () => {
    let rm = (): void => {};
    mocks.add.mockImplementationOnce((...args: any[]) => (rm = args[2]));
    const file = await writeYaml({ data: 'foo' }).catch(() => 'fail');
    files.push(file);

    await expect(read(file)).resolves.toBe('foo');
    expect(mocks.add).toHaveBeenCalledTimes(1);
    await expect(rm()).resolves.not.toBeInstanceOf(Error);
    await expect(read(file)).rejects.toBeInstanceOf(Error);
  });
});

import path from 'path';
import getFile from '~/builder/get-file';

const at = (str?: string): string => {
  return path.join(__dirname, '../fixtures', str || '');
};

describe(`explicit file`, () => {
  test(`succeeds for js`, async () => {
    const opts = {
      file: at('js/poseup.config.js'),
      directory: at()
    };
    await expect(getFile(opts)).resolves.toBe(opts.file);
  });
  test(`succeeds for json`, async () => {
    const opts = {
      file: at('json/poseup.config.json'),
      directory: at()
    };
    await expect(getFile(opts)).resolves.toBe(opts.file);
  });
  test(`succeeds for yml`, async () => {
    const opts = {
      file: at('yml/poseup.config.yml'),
      directory: at()
    };
    await expect(getFile(opts)).resolves.toBe(opts.file);
  });
  test(`succeeds for yaml`, async () => {
    const opts = {
      file: at('yaml/poseup.config.yaml'),
      directory: at()
    };
    await expect(getFile(opts)).resolves.toBe(opts.file);
  });
  test(`fails for other ext`, async () => {
    const opts = {
      file: at('fail/poseup.config.ts'),
      directory: at()
    };
    await expect(getFile(opts)).rejects.toBeInstanceOf(Error);
  });
  test(`fails if it doesn't exist`, async () => {
    const opts = {
      file: at('fail/poseup.config.js'),
      directory: at()
    };
    await expect(getFile(opts)).rejects.toBeInstanceOf(Error);
  });
});
describe(`default file`, () => {
  test(`succeeds for js`, async () => {
    const opts = { directory: at('js') };
    await expect(getFile(opts)).resolves.toBe(at('js/poseup.config.js'));
  });
  test(`succeeds for json`, async () => {
    const opts = { directory: at('json') };
    await expect(getFile(opts)).resolves.toBe(at('json/poseup.config.json'));
  });
  test(`succeeds for yml`, async () => {
    const opts = { directory: at('yml') };
    await expect(getFile(opts)).resolves.toBe(at('yml/poseup.config.yml'));
  });
  test(`succeeds for yaml`, async () => {
    const opts = { directory: at('yaml') };
    await expect(getFile(opts)).resolves.toBe(at('yaml/poseup.config.yaml'));
  });
  test(`succeeds for nested`, async () => {
    const opts = { directory: at('nested/inner') };
    await expect(getFile(opts)).resolves.toBe(at('nested/poseup.config.js'));
  });
  test(`fails`, async () => {
    const opts = { directory: at('fail') };
    await expect(getFile(opts)).rejects.toBeInstanceOf(Error);
  });
});

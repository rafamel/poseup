import path from 'path';
import getFile, { exists } from '~/builder/get-file';

const at = (str?: string): string => {
  return path.join(__dirname, '../fixtures', str || '');
};

process.cwd = jest.fn().mockImplementation(() => at('nested'));
const cwd: any = process.cwd;

describe(`explicit file`, () => {
  describe(`absolute`, () => {
    test(`succeeds for js`, async () => {
      const opts = {
        file: at('js/poseup.config.js'),
        directory: at()
      };
      await expect(getFile(opts)).resolves.toEqual(opts);
    });
    test(`succeeds for json`, async () => {
      const opts = {
        file: at('json/poseup.config.json'),
        directory: at()
      };
      await expect(getFile(opts)).resolves.toEqual(opts);
    });
    test(`succeeds for yml`, async () => {
      const opts = {
        file: at('yml/poseup.config.yml'),
        directory: at()
      };
      await expect(getFile(opts)).resolves.toEqual(opts);
    });
    test(`succeeds for yaml`, async () => {
      const opts = {
        file: at('yaml/poseup.config.yaml'),
        directory: at()
      };
      await expect(getFile(opts)).resolves.toEqual(opts);
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
  describe(`relative`, () => {
    describe(`directory`, () => {
      test(`succeeds`, async () => {
        const opts = {
          file: 'js/poseup.config.js',
          directory: at()
        };
        await expect(getFile(opts)).resolves.toEqual({
          ...opts,
          file: at(opts.file)
        });
      });
      test(`fails`, async () => {
        const opts = {
          file: 'js/foo.config.js',
          directory: at()
        };
        await expect(getFile(opts)).rejects.toBeInstanceOf(Error);
      });
    });
    describe(`cwd`, () => {
      test(`succeeds`, async () => {
        const opts = {
          file: 'poseup.config.js'
        };
        await expect(getFile(opts)).resolves.toEqual({
          file: at('nested/poseup.config.js'),
          directory: at('nested')
        });
      });
      test(`fails`, async () => {
        const opts = {
          file: 'foo.config.js'
        };
        await expect(getFile(opts)).rejects.toBeInstanceOf(Error);
      });
    });
  });
});
describe(`default file`, () => {
  describe(`absolute`, () => {
    test(`succeeds for js`, async () => {
      const opts = { directory: at('js') };
      await expect(getFile(opts)).resolves.toEqual({
        ...opts,
        file: at('js/poseup.config.js')
      });
    });
    test(`succeeds for json`, async () => {
      const opts = { directory: at('json') };
      await expect(getFile(opts)).resolves.toEqual({
        ...opts,
        file: at('json/poseup.config.json')
      });
    });
    test(`succeeds for yml`, async () => {
      const opts = { directory: at('yml') };
      await expect(getFile(opts)).resolves.toEqual({
        ...opts,
        file: at('yml/poseup.config.yml')
      });
    });
    test(`succeeds for yaml`, async () => {
      const opts = { directory: at('yaml') };
      await expect(getFile(opts)).resolves.toEqual({
        ...opts,
        file: at('yaml/poseup.config.yaml')
      });
    });
    test(`succeeds for nested`, async () => {
      const opts = { directory: at('nested/inner') };
      await expect(getFile(opts)).resolves.toEqual({
        ...opts,
        file: at('nested/poseup.config.js')
      });
    });
    test(`fails`, async () => {
      const opts = { directory: at('fail') };
      await expect(getFile(opts)).rejects.toBeInstanceOf(Error);
    });
  });
  describe(`relative`, () => {
    describe(`directory`, () => {
      test(`succeeds`, async () => {
        const opts = { directory: 'inner' };
        await expect(getFile(opts)).resolves.toEqual({
          file: at('nested/poseup.config.js'),
          directory: at('nested/inner')
        });
      });
      test(`fails`, async () => {
        cwd.mockImplementationOnce(() => at('foo'));
        const opts = { directory: 'inner' };
        await expect(getFile(opts)).rejects.toBeInstanceOf(Error);
      });
    });
    describe(`cwd`, () => {
      test(`succeeds`, async () => {
        await expect(getFile({})).resolves.toEqual({
          file: at('nested/poseup.config.js'),
          directory: at('nested')
        });
      });
      test(`fails`, async () => {
        cwd.mockImplementationOnce(() => at('foo'));
        await expect(getFile({})).rejects.toBeInstanceOf(Error);
      });
    });
  });
});

describe(`exists`, () => {
  test(`succeeds w/ file`, async () => {
    await expect(exists(at('js/poseup.config.js'))).resolves.toBeUndefined();
  });
  test(`succeeds w/ dir`, async () => {
    await expect(exists(at('js'))).resolves.toBeUndefined();
  });
  test(`fails`, async () => {
    await expect(exists(at('foo'))).rejects.toBeInstanceOf(Error);
  });
});

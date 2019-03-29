import path from 'path';
import getFile from '~/builder/get-file';

const at = (str?: string): string => {
  return path.join(__dirname, '../fixtures', str || '');
};

describe(`explicit file`, () => {
  describe(`absolute paths`, () => {
    test(`succeeds for js wo/ dir`, async () => {
      const opts = { file: at('js/poseup.config.js') };
      await expect(getFile(opts)).resolves.toBe(opts.file);
    });
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
  describe(`relative paths`, () => {
    describe(`explicit dir`, () => {
      test(`succeeds (1)`, async () => {
        const opts = {
          file: 'js/poseup.config.js',
          directory: at()
        };
        await expect(getFile(opts)).resolves.toBe(at(opts.file));
      });
      test(`succeeds (2)`, async () => {
        const opts = {
          file: './js/poseup.config.js',
          directory: at()
        };
        await expect(getFile(opts)).resolves.toBe(at(opts.file));
      });
      test(`fails`, async () => {
        const opts = {
          file: 'fail/poseup.config.ts',
          directory: at()
        };
        await expect(getFile(opts)).rejects.toBeInstanceOf(Error);
      });
    });
    describe(`dir is process.cwd()`, () => {
      process.cwd = () => at();
      test(`succeeds (1)`, async () => {
        const opts = { file: 'js/poseup.config.js' };
        await expect(getFile(opts)).resolves.toBe(at(opts.file));
      });
      test(`succeeds (2)`, async () => {
        const opts = { file: './js/poseup.config.js' };
        await expect(getFile(opts)).resolves.toBe(at(opts.file));
      });
      test(`fails`, async () => {
        const opts = { file: 'fail/poseup.config.ts' };
        await expect(getFile(opts)).rejects.toBeInstanceOf(Error);
      });
    });
  });
});
describe(`default file`, () => {
  describe(`explicit dir`, () => {
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
  describe(`dir is process.cwd()`, () => {
    test(`succeeds`, async () => {
      process.cwd = () => at('js');
      await expect(getFile()).resolves.toBe(at('js/poseup.config.js'));
    });
    test(`succeeds on nested`, async () => {
      process.cwd = () => at('nested/inner');
      await expect(getFile()).resolves.toBe(at('nested/poseup.config.js'));
    });
    test(`fails`, async () => {
      process.cwd = () => at('fail');
      await expect(getFile()).rejects.toBeInstanceOf(Error);
    });
  });
});

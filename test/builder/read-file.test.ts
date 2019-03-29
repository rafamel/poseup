import path from 'path';
import readFile from '~/builder/read-file';

const at = (str?: string): string => {
  return path.join(__dirname, '../fixtures', str || '');
};

const to = { project: 'foo' };

test(`reads js`, async () => {
  await expect(readFile(at('js/poseup.config.js'))).resolves.toEqual(to);
});

test(`reads json`, async () => {
  await expect(readFile(at('json/poseup.config.json'))).resolves.toEqual(to);
});

test(`reads yml`, async () => {
  await expect(readFile(at('yml/poseup.config.yml'))).resolves.toEqual(to);
});

test(`reads yaml`, async () => {
  await expect(readFile(at('yaml/poseup.config.yaml'))).resolves.toEqual(to);
});

test(`fails for invalid ext`, async () => {
  await expect(readFile(at('fail/poseup.config.ts'))).rejects.toBeInstanceOf(
    Error
  );
});

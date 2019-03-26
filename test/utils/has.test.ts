import has from '../../src/utils/has';
import uuid from 'uuid/v4';

describe(`bin`, () => {
  test(`succeeds`, async () => {
    await expect(has.bin('jest')).resolves.toBe(true);
  });
  test(`fails`, async () => {
    await expect(has.bin('')).resolves.toBe(false);
    await expect(has.bin(uuid().replace(/-/g, ''))).resolves.toBe(false);
  });
});

describe(`all`, () => {
  test(`all = true`, async () => {
    await expect(has.all('jest', 'tsc', 'typedoc')).resolves.toEqual({
      all: true,
      jest: true,
      tsc: true,
      typedoc: true
    });
  });
  test(`all = false`, async () => {
    const nid = uuid().replace(/-/g, '');
    await expect(has.all('jest', 'tsc', 'typedoc', nid)).resolves.toEqual({
      all: false,
      jest: true,
      tsc: true,
      typedoc: true,
      [nid]: false
    });
  });
});

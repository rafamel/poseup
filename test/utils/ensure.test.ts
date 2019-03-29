import ensure, { DEFAULT_MESSAGE } from '~/utils/ensure';

describe(`error`, () => {
  test(`returns same object when instance of Error`, () => {
    const err = Error();
    const res = ensure.error(err);
    expect(res).toBe(err);
  });
  test(`returns same object when instance of Error inheriting class`, () => {
    const err = new class extends Error {}();
    const res = ensure.error(err);
    expect(res).toBe(err);
    expect(res).toBeInstanceOf(Error);
  });
  test(`returns new error when empty`, () => {
    const res = ensure.error();
    expect(res).toHaveProperty('message', DEFAULT_MESSAGE);
    expect(res).toBeInstanceOf(Error);
  });
  test(`returns new error w/ string message when string`, () => {
    const res = ensure.error('Some error');
    expect(res).toHaveProperty('message', 'Some error');
    expect(res).toBeInstanceOf(Error);
  });
  test(`returns new error w/ string message when obj.message`, () => {
    const res = ensure.error({ message: 'Some error' });
    expect(res).toHaveProperty('message', 'Some error');
    expect(res).toBeInstanceOf(Error);
  });
  test(`returns new error for other types`, () => {
    const obj: any = {
      a: ensure.error({}),
      b: ensure.error({ foo: 1 }),
      c: ensure.error([{}]),
      d: ensure.error(1)
    };
    ['a', 'b', 'c', 'd'].forEach((key) => {
      expect(obj[key]).toHaveProperty('message', DEFAULT_MESSAGE);
      expect(obj[key]).toBeInstanceOf(Error);
    });
  });
});

describe(`rejection`, () => {
  test(`returns promise result`, async () => {
    await expect(ensure.rejection(() => Promise.resolve(5))).resolves.toBe(5);
  });
  test(`throws`, async () => {
    await expect(
      // eslint-disable-next-line prefer-promise-reject-errors
      ensure.rejection(() => Promise.reject(null))
    ).rejects.toBeInstanceOf(Error);
  });
});

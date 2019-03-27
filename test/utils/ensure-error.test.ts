import ensureError, { DEFAULT_MESSAGE } from '../../src/utils/ensure-error';

test(`returns same object when instance of Error`, () => {
  const err = Error();
  const res = ensureError(err);
  expect(res).toBe(err);
});
test(`returns same object when instance of Error inheriting class`, () => {
  const err = new class extends Error {}();
  const res = ensureError(err);
  expect(res).toBe(err);
  expect(res).toBeInstanceOf(Error);
});
test(`returns new error when empty`, () => {
  const res = ensureError();
  expect(res).toHaveProperty('message', DEFAULT_MESSAGE);
  expect(res).toBeInstanceOf(Error);
});
test(`returns new error w/ string message when string`, () => {
  const res = ensureError('Some error');
  expect(res).toHaveProperty('message', 'Some error');
  expect(res).toBeInstanceOf(Error);
});
test(`returns new error w/ string message when obj.message`, () => {
  const res = ensureError({ message: 'Some error' });
  expect(res).toHaveProperty('message', 'Some error');
  expect(res).toBeInstanceOf(Error);
});
test(`returns new error for other types`, () => {
  const obj: any = {
    a: ensureError({}),
    b: ensureError({ foo: 1 }),
    c: ensureError([{}]),
    d: ensureError(1)
  };
  ['a', 'b', 'c', 'd'].forEach((key) => {
    expect(obj[key]).toHaveProperty('message', DEFAULT_MESSAGE);
    expect(obj[key]).toBeInstanceOf(Error);
  });
});

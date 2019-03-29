import add from '~/utils/add';
import logger from '~/utils/logger';
import { add as _exitsAdd } from 'exits';

logger.setLevel('silent');
jest.mock('exits');
const exitsAdd: any = _exitsAdd;

test(`successfully calls exits add()`, () => {
  const exitsAddRes = {};
  let args: any[] = [];
  let innerArgs: any[] = [];
  exitsAdd.mockImplementationOnce((...x: any[]) => {
    args = x;
    return exitsAddRes;
  });

  let res;
  expect(
    () => (res = add(1, '', (...x: any[]) => (innerArgs = x)))
  ).not.toThrow();
  expect(res).toBe(exitsAddRes);
  expect(exitsAdd).toHaveBeenCalledTimes(1);
  expect(typeof args[0]).toBe('function');
  expect(args[1]).toBe(1);

  args[0](1, 2, 3);
  expect(innerArgs).toEqual([1, 2, 3]);
});

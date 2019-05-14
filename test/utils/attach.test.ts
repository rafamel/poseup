import attach, { isAttached, onDone } from '~/utils/attach';
import { attach as _attach, options, resolver, add, on } from 'exits';
import logger from '~/utils/logger';
import { IOfType } from '~/types';

logger.setLevel('silent');
jest.mock('exits');
jest.mock('~/utils/has');

const mocks: IOfType<jest.Mock<any, any>> = {
  attach: _attach,
  options,
  resolver,
  add,
  on
} as any;

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

describe(`attach`, () => {
  test(`isAttached() = false before attachment`, () => {
    expect(isAttached()).toBe(false);
  });
  test(`succeeds`, () => {
    expect(attach()).toBeUndefined();
  });
  test(`isAttached() = true after attachment`, () => {
    expect(isAttached()).toBe(true);
  });
  test(`calls exits attach() and options()`, () => {
    attach();

    expect(mocks.attach).toHaveBeenCalledTimes(1);
    expect(mocks.options).toHaveBeenCalledTimes(1);
  });
});

describe(`exits callbacks`, () => {
  test(`resolver returns exit 1 for exceptions and rejections`, () => {
    let opts: any = {};
    mocks.options.mockImplementationOnce((x: any) => (opts = x));

    attach();
    expect(opts).toHaveProperty('resolver');

    expect(() => opts.resolver('foo', 'bar')).not.toThrow();
    expect(mocks.resolver).toHaveBeenCalledTimes(1);
    expect(mocks.resolver).toHaveBeenCalledWith('foo', 'bar');

    expect(() => opts.resolver('exit', 1)).not.toThrow();
    expect(mocks.resolver).toHaveBeenLastCalledWith('exit', 1);

    expect(() => opts.resolver('exit', 0)).not.toThrow();
    expect(mocks.resolver).toHaveBeenLastCalledWith('exit', 0);

    expect(() => opts.resolver('exception', 'foo')).not.toThrow();
    expect(mocks.resolver).toHaveBeenLastCalledWith('exit', 1);

    expect(() => opts.resolver('rejection', 'foo')).not.toThrow();
    expect(mocks.resolver).toHaveBeenLastCalledWith('exit', 1);
  });
  test(`calls on('done', onDone)`, () => {
    expect(attach()).resolves.toBeUndefined();

    expect(mocks.on).toHaveBeenCalledTimes(2);
    expect(mocks.on.mock.calls[1][0]).toBe('done');
    expect(mocks.on.mock.calls[1][1]).toBe(onDone);
  });
  test(`onDone doesn't throw`, () => {
    expect(() => onDone(() => ({ triggered: null } as any))).not.toThrow();
    expect(() =>
      onDone(() => ({ triggered: { type: 'exception', arg: Error() } } as any))
    ).not.toThrow();
    expect(() =>
      onDone(() => ({ triggered: { type: 'rejection', arg: Error() } } as any))
    ).not.toThrow();
    expect(() =>
      onDone(() => ({ triggered: { type: 'exit', arg: 0 } } as any))
    ).not.toThrow();
    expect(() =>
      onDone(() => ({ triggered: { type: 'exit', arg: 1 } } as any))
    ).not.toThrow();
    expect(() =>
      onDone(() => ({ triggered: { type: 'foo' } } as any))
    ).not.toThrow();
  });
});

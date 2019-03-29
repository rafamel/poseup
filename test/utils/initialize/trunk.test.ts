import trunk, { onDone } from '~/utils/initialize/trunk';
import {
  attach as _attach,
  options as _options,
  resolver as _resolver
} from 'exits';
import _has from '~/utils/has';
import logger from '~/utils/logger';

logger.setLevel('silent');

jest.mock('exits');
jest.mock('~/utils/has');
const attach: any = _attach;
const options: any = _options;
const resolver: any = _resolver;
const has: any = _has;

describe(`trunk`, () => {
  test(`succeeds`, async () => {
    await expect(trunk()).resolves.toBeUndefined();
  });
  test(`calls exits attach() and options()`, async () => {
    attach.mockClear();
    options.mockClear();
    await trunk();

    expect(attach).toHaveBeenCalledTimes(1);
    expect(options).toHaveBeenCalledTimes(1);
  });
  test(`checks for docker & docker-compose binaries`, async () => {
    has.all.mockClear();

    await trunk();
    expect(has.all).toHaveBeenCalledTimes(1);
    expect(has.all).toHaveBeenCalledWith('docker', 'docker-compose');
  });
  test(`fails if has.all().all is false`, async () => {
    has.all.mockImplementationOnce(() =>
      Promise.resolve({ all: false, docker: true, 'docker-compose': false })
    );
    await expect(trunk()).rejects.toBeInstanceOf(Error);

    has.all.mockImplementationOnce(() =>
      Promise.resolve({ all: false, docker: false, 'docker-compose': true })
    );
    await expect(trunk()).rejects.toBeInstanceOf(Error);
  });
});

describe(`exits callbacks`, () => {
  test(`resolver returns exit 1 for exceptions and rejections`, async () => {
    let opts: any = {};
    options.mockImplementationOnce((x: any) => (opts = x));

    await trunk();
    expect(opts).toHaveProperty('resolver');

    resolver.mockClear();
    expect(() => opts.resolver('foo', 'bar')).not.toThrow();
    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith('foo', 'bar');

    expect(() => opts.resolver('exit', 1)).not.toThrow();
    expect(resolver).toHaveBeenLastCalledWith('exit', 1);

    expect(() => opts.resolver('exit', 0)).not.toThrow();
    expect(resolver).toHaveBeenLastCalledWith('exit', 0);

    expect(() => opts.resolver('exception', 'foo')).not.toThrow();
    expect(resolver).toHaveBeenLastCalledWith('exit', 1);

    expect(() => opts.resolver('rejection', 'foo')).not.toThrow();
    expect(resolver).toHaveBeenLastCalledWith('exit', 1);
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

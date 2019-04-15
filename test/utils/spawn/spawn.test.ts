import { spawn as _spawn, state as _state } from 'exits';
import { DEFAULT_STDIO } from '~/constants';
import spawn from '~/utils/spawn';
import { IOfType } from '~/types';

jest.mock('exits');
jest.mock('~/utils/spawn/silent');

const mocks: IOfType<jest.Mock<any, any>> = {
  spawn: _spawn,
  state: _state
} as any;
beforeEach(() => Object.values(mocks).forEach((mocks) => mocks.mockClear()));

const spawnResponse = { promise: Promise.resolve() };
mocks.spawn.mockImplementation(() => spawnResponse);
mocks.state.mockImplementation(() => ({ triggered: {} }));
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const noenv = (args?: string[]) => spawn('foo', args, { env: {} });

describe(`spawn`, () => {
  test(`doesn't throw`, () => {
    expect(() => spawn('foo')).not.toThrow();
  });
  test(`returns spawn promise`, () => {
    expect(spawn('foo')).toBe(spawnResponse.promise);
  });
  test(`pasess environment variables by default`, () => {
    expect(spawn('foo', undefined, { stdio: 'baz' } as any)).toBe(
      spawnResponse.promise
    );
    expect(mocks.spawn).toHaveBeenCalledTimes(1);
    expect(mocks.spawn).toHaveBeenCalledWith('foo', undefined, {
      stdio: 'baz',
      env: process.env
    });
  });
  test(`passes default stdio w/ state triggered`, () => {
    expect(noenv()).toBe(spawnResponse.promise);
    expect(mocks.spawn).toHaveBeenCalledTimes(1);
    expect(mocks.spawn).toHaveBeenCalledWith('foo', undefined, {
      stdio: 'ignore',
      env: {}
    });
  });
  test(`passes default stdio wo/ state triggered`, () => {
    mocks.state.mockImplementationOnce(() => ({ triggered: null }));

    expect(noenv()).toBe(spawnResponse.promise);
    expect(mocks.spawn).toHaveBeenCalledTimes(1);
    expect(mocks.spawn).toHaveBeenCalledWith('foo', undefined, {
      stdio: DEFAULT_STDIO,
      env: {}
    });
  });
  test(`passes opts`, () => {
    expect(
      spawn('foo', undefined, { bar: 'baz', env: { foo: 'bar' } } as any)
    ).toBe(spawnResponse.promise);
    expect(mocks.spawn).toHaveBeenCalledTimes(1);
    expect(mocks.spawn).toHaveBeenCalledWith('foo', undefined, {
      stdio: 'ignore',
      env: { foo: 'bar' },
      bar: 'baz'
    });
  });
  test(`passes args`, () => {
    expect(noenv(['a', 'b', 'c'])).toBe(spawnResponse.promise);
    expect(mocks.spawn).toHaveBeenCalledTimes(1);
    expect(mocks.spawn).toHaveBeenCalledWith('foo', ['a', 'b', 'c'], {
      stdio: 'ignore',
      env: {}
    });
  });
  test(`passes all`, () => {
    expect(
      spawn('foo', ['a', 'b', 'c'], {
        bar: 'baz',
        stdio: 'barbaz',
        env: { foo: 'bar' }
      } as any)
    ).toBe(spawnResponse.promise);
    expect(mocks.spawn).toHaveBeenCalledTimes(1);
    expect(mocks.spawn).toHaveBeenCalledWith('foo', ['a', 'b', 'c'], {
      bar: 'baz',
      stdio: 'barbaz',
      env: { foo: 'bar' }
    });
  });
});

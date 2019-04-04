import { spawn as _exitsSpawn, state as _exitsState } from 'exits';
import { DEFAULT_STDIO } from '~/constants';
import spawn from '~/utils/spawn';

jest.mock('exits');
jest.mock('~/utils/spawn/silent');
const exitsSpawn: any = _exitsSpawn;
const exitsState: any = _exitsState;

const spawnResponse = { promise: Promise.resolve() };
exitsSpawn.mockImplementation(() => spawnResponse);
exitsState.mockImplementation(() => ({ triggered: {} }));
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
    exitsSpawn.mockClear();

    expect(spawn('foo', undefined, { stdio: 'baz' } as any)).toBe(
      spawnResponse.promise
    );
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', undefined, {
      stdio: 'baz',
      env: process.env
    });
  });
  test(`passes default stdio w/ state triggered`, () => {
    exitsSpawn.mockClear();

    expect(noenv()).toBe(spawnResponse.promise);
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', undefined, {
      stdio: 'ignore',
      env: {}
    });
  });
  test(`passes default stdio wo/ state triggered`, () => {
    exitsSpawn.mockClear();
    exitsState.mockImplementationOnce(() => ({ triggered: null }));

    expect(noenv()).toBe(spawnResponse.promise);
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', undefined, {
      stdio: DEFAULT_STDIO,
      env: {}
    });
  });
  test(`passes opts`, () => {
    exitsSpawn.mockClear();

    expect(
      spawn('foo', undefined, { bar: 'baz', env: { foo: 'bar' } } as any)
    ).toBe(spawnResponse.promise);
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', undefined, {
      stdio: 'ignore',
      env: { foo: 'bar' },
      bar: 'baz'
    });
  });
  test(`passes args`, () => {
    exitsSpawn.mockClear();

    expect(noenv(['a', 'b', 'c'])).toBe(spawnResponse.promise);
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', ['a', 'b', 'c'], {
      stdio: 'ignore',
      env: {}
    });
  });
  test(`passes all`, () => {
    exitsSpawn.mockClear();

    expect(
      spawn('foo', ['a', 'b', 'c'], {
        bar: 'baz',
        stdio: 'barbaz',
        env: { foo: 'bar' }
      } as any)
    ).toBe(spawnResponse.promise);
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', ['a', 'b', 'c'], {
      bar: 'baz',
      stdio: 'barbaz',
      env: { foo: 'bar' }
    });
  });
});

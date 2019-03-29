import { spawn as _exitsSpawn, state as _exitsState } from 'exits';
import { DEFAULT_STDIO } from '~/constants';
import spawn, { silent as _silent } from '~/utils/spawn';

jest.mock('exits');
jest.mock('~/utils/spawn/silent');
const exitsSpawn: any = _exitsSpawn;
const exitsState: any = _exitsState;
const silent: any = _silent;

const spawnResponse = { promise: Promise.resolve() };
exitsSpawn.mockImplementation(() => spawnResponse);
exitsState.mockImplementation(() => ({ triggered: {} }));
silent.mockImplementation(() => 'bar');

describe(`spawn`, () => {
  test(`doesn't throw`, () => {
    expect(() => spawn('foo')).not.toThrow();
  });
  test(`returns spawn promise`, () => {
    expect(spawn('foo')).toBe(spawnResponse.promise);
  });
  test(`passes defaults w/ state triggered`, () => {
    exitsSpawn.mockClear();

    expect(spawn('foo')).toBe(spawnResponse.promise);
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', undefined, { stdio: 'bar' });
  });
  test(`passes defaults wo/ state triggered`, () => {
    exitsSpawn.mockClear();
    exitsState.mockImplementationOnce(() => ({ triggered: null }));

    expect(spawn('foo')).toBe(spawnResponse.promise);
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', undefined, {
      stdio: DEFAULT_STDIO
    });
  });
  test(`passes stdio if in opts`, () => {
    exitsSpawn.mockClear();
    exitsState.mockImplementationOnce(() => ({ triggered: null }));
    expect(spawn('foo', undefined, { stdio: 'baz' } as any)).toBe(
      spawnResponse.promise
    );
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', undefined, {
      stdio: 'baz'
    });
  });
  test(`passes opts`, () => {
    exitsSpawn.mockClear();

    expect(spawn('foo', undefined, { bar: 'baz' } as any)).toBe(
      spawnResponse.promise
    );
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', undefined, {
      stdio: 'bar',
      bar: 'baz'
    });
  });
  test(`passes args`, () => {
    exitsSpawn.mockClear();

    expect(spawn('foo', ['a', 'b', 'c'])).toBe(spawnResponse.promise);
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', ['a', 'b', 'c'], {
      stdio: 'bar'
    });
  });
  test(`passes all`, () => {
    exitsSpawn.mockClear();

    expect(
      spawn('foo', ['a', 'b', 'c'], { bar: 'baz', stdio: 'barbaz' } as any)
    ).toBe(spawnResponse.promise);
    expect(exitsSpawn).toHaveBeenCalledTimes(1);
    expect(exitsSpawn).toHaveBeenCalledWith('foo', ['a', 'b', 'c'], {
      bar: 'baz',
      stdio: 'barbaz'
    });
  });
});

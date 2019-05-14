import initialize from '~/lifecycle/initialize';
import has from '~/utils/has';
import logger, { setLevel } from '~/utils/logger';
import { IOfType } from '~/types';

logger.setLevel('silent');
jest.mock('~/utils/logger');
jest.mock('~/utils/has');

const mocks: IOfType<jest.Mock<any, any>> = {
  all: has.all,
  setLevel
} as any;
beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

const env = process.env.NODE_ENV;
afterEach(() => (process.env.NODE_ENV = env));

describe(`options`, () => {
  test(`succeeds w/ empty options object`, async () => {
    await expect(initialize({})).resolves.toBeUndefined();
    expect(mocks.setLevel).not.toHaveBeenCalled();
    expect(process.env.NODE_ENV).toBe(env);
  });
  test(`sets log when passed`, async () => {
    await expect(initialize({ log: 'debug' })).resolves.toBeUndefined();
    expect(mocks.setLevel).toHaveBeenCalledTimes(1);
    expect(mocks.setLevel).toHaveBeenCalledWith('debug');
    expect(process.env.NODE_ENV).toBe(env);
  });
  test(`sets env when passed`, async () => {
    await expect(initialize({ environment: 'foo' })).resolves.toBeUndefined();
    expect(process.env.NODE_ENV).toBe('foo');
  });
  test(`sets log and env`, async () => {
    await expect(
      initialize({ log: 'debug', environment: 'foo' })
    ).resolves.toBeUndefined();
    expect(mocks.setLevel).toHaveBeenCalledTimes(1);
    expect(mocks.setLevel).toHaveBeenCalledWith('debug');
    expect(process.env.NODE_ENV).toBe('foo');
  });
});

describe(`docker & docker-compose binaries`, () => {
  test(`checks for docker & docker-compose binaries`, async () => {
    await initialize({});
    expect(mocks.all).toHaveBeenCalledTimes(1);
    expect(mocks.all).toHaveBeenCalledWith('docker', 'docker-compose');
  });
  test(`fails if has.all().all is false`, async () => {
    mocks.all.mockImplementationOnce(() =>
      Promise.resolve({ all: false, docker: true, 'docker-compose': false })
    );
    await expect(initialize({})).rejects.toThrowErrorMatchingInlineSnapshot(
      `"docker-compose not available"`
    );

    mocks.all.mockImplementationOnce(() =>
      Promise.resolve({ all: false, docker: false, 'docker-compose': true })
    );
    await expect(initialize({})).rejects.toThrowErrorMatchingInlineSnapshot(
      `"docker not available"`
    );
  });
});

export const DEFAULT_MESSAGE = 'An error occurred';

function ensureError(err?: any): Error {
  if (err instanceof Error) return err;
  return err && typeof err === 'object' && err.hasOwnProperty('message')
    ? Error(err.message)
    : Error(typeof err === 'string' ? err : DEFAULT_MESSAGE);
}

async function ensureRejection<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw ensureError(err);
  }
}

export default {
  error: ensureError,
  rejection: ensureRejection
};

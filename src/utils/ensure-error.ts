export const DEFAULT_MESSAGE = 'An error occurred';

export default function ensureError(err?: any): Error {
  if (err instanceof Error) return err;
  return err && typeof err === 'object' && err.hasOwnProperty('message')
    ? Error(err.message)
    : Error(typeof err === 'string' ? err : DEFAULT_MESSAGE);
}

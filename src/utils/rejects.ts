export const DEFAULT_MESSAGE = 'An error occurred';

export default rejects;

function rejects(err: any, condition: true): Promise<never>;
function rejects(err: any, condition: boolean | undefined): Promise<void>;
function rejects(err: any): Promise<never>;
async function rejects(err: any, condition: boolean = true): Promise<void> {
  if (!condition) return;

  if (err instanceof Error) throw err;
  if (err && typeof err === 'object' && err.hasOwnProperty('message')) {
    throw Error(String(err.message));
  }
  throw Error(typeof err === 'string' ? err : DEFAULT_MESSAGE);
}

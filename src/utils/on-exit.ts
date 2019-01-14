import cleanup from 'node-cleanup';
import logger from 'loglevel';
import { deferred, status } from 'promist';

type StackCallback = () => Promise<void> | void;

// Stack of functions to execute on exit/sigterm
const stack: Array<{ task: string; cb: StackCallback }> = [];

let isAttached = false;
let hasCleanup = false;
let hasRun = false;
const p = status(deferred());
export function attach() {
  if (isAttached) return;
  isAttached = true;
  cleanup((code, signal) => {
    if (p.status === 'resolved') return true;
    if (hasCleanup) return false;
    hasCleanup = true;
    run();
    p.then(() => {
      process.kill(process.pid, signal || 'SIGTERM');
    });
    return false;
  });
}

export async function run() {
  if (hasRun) return p;
  hasRun = true;

  if (stack.length) {
    logger.info('\nPreparing exit');
    while (stack.length) {
      // @ts-ignore
      const { task, cb } = stack.shift();
      logger.info('  ' + task);
      try {
        await cb();
      } catch (e) {
        logger.error(e);
      }
    }
    logger.info('Done');
  }
  p.resolve(null);
}

export default function onExit(taskName: string, cb: StackCallback) {
  stack.unshift({ task: taskName, cb });
  return cb;
}

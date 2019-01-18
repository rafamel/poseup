import cleanup from 'node-cleanup';
import logger from 'loglevel';
import { deferred, status } from 'promist';

type StackCallback = () => Promise<void> | void;

// Stack of functions to execute on exit/sigterm
const stack: Array<{ task: string; cb: StackCallback }> = [];

export const state = {
  start: false,
  done: status(deferred())
};

let isAttached = false;
let hasCleanup = false;
export function attach() {
  if (isAttached) return;
  isAttached = true;

  cleanup((code, signal) => {
    if (state.done.status === 'resolved') return true;
    if (hasCleanup) return false;
    hasCleanup = true;
    run();
    state.done.then(() => {
      process.kill(process.pid, signal || 'SIGTERM');
    });
    return false;
  });
}

export async function run() {
  if (state.start) return state.done;
  state.start = true;

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
  state.done.resolve(null);
}

export default function onExit(taskName: string, cb: StackCallback) {
  stack.unshift({ task: taskName, cb });
  return cb;
}

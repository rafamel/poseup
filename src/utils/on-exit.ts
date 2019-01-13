import cleanup from 'node-cleanup';
import logger from 'loglevel';
import { series } from 'promist';

type QueueCallback = () => Promise<void> | void;

// Queue of functions to execute on exit/sigterm
const queue: Array<{ task: string; cb: QueueCallback }> = [];

let isAttached = false;
let hasRun = false;
let isDone = false;

export function attach() {
  if (isAttached) return;
  isAttached = true;
  cleanup((code, signal) => {
    if (hasRun || isDone) return isDone;
    run().then(() => process.kill(process.pid, signal || 'SIGTERM'));
    return false;
  });
}

export async function run() {
  if (hasRun) return;
  hasRun = true;
  if (!queue.length) return (isDone = true);

  logger.info('\nPreparing exit');

  await series.each(queue, async ({ task, cb }) => {
    logger.debug('  ' + task);
    try {
      return cb();
    } catch (e) {
      logger.error(e);
    }
  });

  logger.info('Done');
  isDone = true;
}

export default function onExit(taskName: string, cb: QueueCallback) {
  queue.push({ task: taskName, cb });
  return cb;
}

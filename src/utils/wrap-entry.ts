import logger from 'loglevel';
import { attach, run } from '~/utils/on-exit';

/**
 * Wraps an entry point function:
 * - Sets default logging level
 * - Attaches on-exit hook runner to current node process (executes if terminated)
 * - Runs on-exit hook runner if process is not terminated
 */

export default function wrapEntry<T>(cb: () => Promise<T>): Promise<T>;
export default async function wrapEntry<T>(cb: () => T): Promise<T> {
  // Initialize logger
  logger.setDefaultLevel('info');

  // Attach a cleanup function for graceful exits on signals
  attach();

  // Run and await for cb(), then run onExit hooks when done
  try {
    const res = await cb();
    await run();
    return res;
  } catch (e) {
    await run();
    throw e;
  }
}

import logger from 'loglevel';
import has from '~/utils/has';
import { attach, run } from '~/utils/on-exit';

/**
 * Wraps an entry point function:
 * - Sets default logging level
 * - Checks docker & docker-compose binaries are available
 * - Attaches on-exit hook runner to current node process (executes if terminated)
 * - Runs on-exit hook runner if process is not terminated
 */

export default function wrapEntry<T>(cb: () => Promise<T>): Promise<T>;
export default async function wrapEntry<T>(cb: () => T): Promise<T> {
  // Initialize logger
  logger.setDefaultLevel('info');

  // Check binaries are available: docker docker-compose
  const bins = await has.all('docker', 'docker-compose');
  if (!bins.all) {
    const name = bins.docker ? 'docker-compose' : 'docker';
    logger.info(
      `${name} binary is not available in path.\n` +
        'Install docker at https://www.docker.com/get-started ' +
        'and run this afterwards.'
    );
    throw Error(`${name} not available`);
  }

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

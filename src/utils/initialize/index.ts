import { IOptions } from '~/types';
import { setLevel } from '~/utils/logger';
import trunk from './trunk';

/**
 * Should be called by all functions that are entry points.
 * - Sets default logging level
 * - Checks docker & docker-compose binaries are available
 * - Attaches on-exit hook runner to current node process (executes if terminated)
 * - Sets environment
 * - Sets default logging level
 */

let done = false;
export default async function initialize(options: IOptions): Promise<void> {
  if (options.log) setLevel(options.log);
  if (options.environment) process.env.NODE_ENV = options.environment;

  if (!done) {
    done = true;
    await trunk();
  }
}

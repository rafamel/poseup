import { IPoseup } from '~/types';
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
export default async function initialize(opts: IPoseup): Promise<void> {
  if (opts.log) setLevel(opts.log);
  if (opts.environment) process.env.NODE_ENV = opts.environment;

  if (!done) {
    done = true;
    await trunk();
  }
}

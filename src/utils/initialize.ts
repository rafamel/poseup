import has from '~/utils/has';
import { IOptions } from '~/types';
import logger, { setLevel } from '~/utils/logger';

/**
 * Should be called by command functions.
 * - Sets default logging level
 * - Sets environment
 * - Checks docker & docker-compose binaries are available
 */
export default async function initialize(options: IOptions): Promise<void> {
  if (options.log) setLevel(options.log);
  if (options.environment) process.env.NODE_ENV = options.environment;

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
}

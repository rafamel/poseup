import { IOfType } from '~/types';
import logger from '~/utils/logger';
import stdout from '~/utils/stdout';
import isEqual from 'lodash.isequal';
import { wait } from 'promist';
import chalk from 'chalk';
import { RUN_WAIT_DETECT_INTERVAL } from '~/constants';
import { control } from 'exits';

export default async function waitDetect(
  services: string[],
  timeout: number,
  cmd: string,
  args: string[]
): Promise<void> {
  await control(trunk)(services, timeout, cmd, args);
}

function* trunk(
  services: string[],
  timeout: number,
  cmd: string,
  args: string[]
): IterableIterator<any> {
  if (!services.length) return;

  timeout *= 1000;
  const startAt = Date.now();
  let remaining = timeout;
  const remains = (): number => {
    return (remaining = Math.max(0, timeout - (Date.now() - startAt)));
  };

  // Wait for half the interval before doing first run
  yield wait(Math.min(remaining, RUN_WAIT_DETECT_INTERVAL * 500));
  let previous: IOfType<string> = {};
  let current: IOfType<string> = yield collect(services, cmd, args);

  while (!isEqual(previous, current) && remains() > 0) {
    const sleep = Math.min(remaining, RUN_WAIT_DETECT_INTERVAL * 1000);
    logger.debug(
      'Waiting ' +
        Math.round(sleep / 1000) +
        ' seconds for services to complete initialization'
    );
    yield wait(sleep);
    previous = current;
    current = yield collect(services, cmd, args);
  }
  if (Date.now() - startAt > timeout) {
    logger.info(`  ` + chalk.bold.yellow('Autodetect timed out, continuing'));
  }
}

async function collect(
  services: string[],
  cmd: string,
  args: string[]
): Promise<IOfType<string>> {
  const ans: IOfType<string> = {};
  for (let service of services) {
    ans[service] = await stdout(cmd, args.concat('logs').concat(service));
  }
  return ans;
}

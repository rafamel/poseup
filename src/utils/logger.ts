import loglevel from 'loglevel';
import { options } from 'exits';
import { DEFAULT_LOG_LEVEL } from '~/constants';
import { TLogger } from '~/types';

const logger = loglevel.getLogger('_poseup_logger_');
logger.setDefaultLevel(DEFAULT_LOG_LEVEL);

export default logger;
export function setLevel(level: TLogger): void {
  logger.setLevel(level);
  options({ logger: level });
}

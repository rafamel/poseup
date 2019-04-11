import os from 'os';
import path from 'path';
import { levels } from 'loglevel';

// Temp directory for docker-compose yml files
export const TMP_DIR = path.join(os.tmpdir(), 'poseup');
// Default logging level
export const DEFAULT_LOG_LEVEL = 'info';
// Default stdio for spawned processes
export const DEFAULT_STDIO = 'inherit';
// Threshold log level to use 'ignore' instead of DEFAULT_STDIO
// after termination has been triggered
export const EXIT_LOG_LEVEL_STDIO = levels.DEBUG;
// Wait time to pass to docker-compose stop
export const STOP_WAIT_TIME = 5;
// Timeout for wait time after docker-compose is up
// before running docker-compose run
export const RUN_WAIT_TIMEOUT = 60;
// Interval for checking log changes on service initialization auto detect
export const RUN_WAIT_DETECT_INTERVAL = 6;

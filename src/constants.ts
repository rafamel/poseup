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
// Wait time after docker-compose up before running docker-compose run
export const RUN_DEFAULT_WAIT_BEFORE_EXEC = 5;
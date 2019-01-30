import os from 'os';
import path from 'path';

export const TMP_DIR = path.join(os.tmpdir(), 'poseup');
export const DEFAULT_LOG_LEVEL = 'info';
export const DEFAULT_STDIO = 'inherit';

// TODO npm remove slimconf, remove docker dir

import path from 'path';
import os from 'os';
import uuid from 'uuid/v4';
import { getExplicitFile, getDefaultFile } from './get-file';
import readConfig from './read-config';
import cmdBuilder from './cmd-builder';
import logger from 'loglevel';
import { IPoseupBuild, IPoseupConfig } from '~/types';
import validateConfig from './validate-config';
import writeYaml from './write-yaml';

const TMP_DIR = path.join(os.tmpdir(), 'poseup');

export default async function builder(
  { log, file, write, directory, environment, args }: IPoseupBuild = {},
  cb?: (o: IPoseupConfig) => IPoseupConfig
) {
  const writePath = write || path.join(TMP_DIR, uuid() + '.yml');
  if (environment) process.env.NODE_ENV = environment;
  if (log) logger.setLevel(log);

  // Get config file path
  const configPath = await (file ? getExplicitFile(file) : getDefaultFile());
  // Read configuration
  let config = await readConfig(configPath);
  validateConfig(config);
  if (cb) config = cb(config);
  if (!log && config.log) logger.setLevel(config.log);

  await writeYaml({ data: config.compose, path: writePath, remove: !write });

  return cmdBuilder({
    project: config.project,
    file: writePath,
    directory: directory || path.parse(configPath).dir,
    args: args || []
  });
}

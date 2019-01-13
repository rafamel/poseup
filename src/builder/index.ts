// TODO npm remove slimconf, remove docker dir

import path from 'path';
import fs from 'fs';
import os from 'os';
import pify from 'pify';
import yaml from 'js-yaml';
import uuid from 'uuid/v4';
import { getExplicitFile, getDefaultFile } from './get-file';
import readConfig from './read-config';
import onExit from '~/utils/on-exit';
import cmdBuilder from './cmd-builder';
import logger from 'loglevel';
import { IPoseup, IPoseupConfig } from '~/types';

const TMP_DIR = path.join(os.tmpdir(), 'poseup');

export default async function builder(
  { log, file, write, directory, environment, args }: IPoseup = {},
  cb?: (o: IPoseupConfig) => IPoseupConfig
) {
  if (!write) write = path.join(TMP_DIR, uuid() + '.yml');
  const writeDir = path.parse(write).dir;
  if (environment) process.env.NODE_ENV = environment;
  if (log) logger.setLevel(log);

  // Get config file path
  const configPath = await (file ? getExplicitFile(file) : getDefaultFile());
  // Read configuration
  let config = await readConfig(configPath);
  // TODO validate config
  if (cb) config = cb(config);
  if (!log && config.log) logger.setLevel(config.log);

  // If writeDir doesn't exist, create
  await new Promise((resolve) => {
    fs.access(writeDir, fs.constants.F_OK, (err) => {
      return resolve(err && pify(fs.mkdir)(writeDir));
    });
  });

  // Write docker-compose
  await pify(fs.writeFile)(write, yaml.safeDump(config.compose));
  onExit('Remove temporary files', () => pify(fs.unlink)(write));

  return cmdBuilder({
    project: config.project,
    file: write,
    directory: directory || path.parse(configPath).dir,
    args: args || []
  });
}

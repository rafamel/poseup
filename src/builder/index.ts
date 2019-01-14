// TODO npm remove slimconf, remove docker dir

import path from 'path';
import { getExplicitFile, getDefaultFile } from './get-file';
import readConfig from './read-config';
import cmdBuilder from './cmd-builder';
import logger from 'loglevel';
import { IPoseup, IPoseupConfig } from '~/types';
import validateConfig from './validate-config';

export default async function builder({
  log,
  file,
  directory,
  environment
}: IPoseup = {}) {
  if (environment) process.env.NODE_ENV = environment;
  if (log) logger.setLevel(log);

  // Get config file path
  const configPath = await (file ? getExplicitFile(file) : getDefaultFile());

  // Read configuration
  const config: IPoseupConfig = await readConfig(configPath);
  validateConfig(config);
  if (!log && config.log) logger.setLevel(config.log);

  return {
    config,
    // tslint:disable-next-line no-shadowed-variable
    getCmd({ file, args }: { file: string; args?: string[] }) {
      return cmdBuilder({
        project: config.project,
        file,
        directory: directory || path.parse(configPath).dir,
        args: args || []
      });
    }
  };
}

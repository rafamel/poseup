// TODO npm remove slimconf, remove docker dir

import path from 'path';
import { getExplicitFile, getDefaultFile } from './get-file';
import readConfig from './read-config';
import cmdBuilder from './cmd-builder';
import logger from 'loglevel';
import { IPoseup, IPoseupConfig, IBuild } from '~/types';
import validateConfig from './validate-config';

export default async function builder({
  log,
  file,
  directory
}: IPoseup = {}): Promise<IBuild> {
  // Get config file path
  const configPath = await (file ? getExplicitFile(file) : getDefaultFile());

  // Read configuration
  const config: IPoseupConfig = await readConfig(configPath);
  validateConfig(config);
  if (!log && config.log) logger.setLevel(config.log);

  return {
    config,
    // tslint:disable-next-line no-shadowed-variable
    getCmd({ file, args }) {
      return cmdBuilder({
        project: config.project,
        file,
        directory: directory || path.parse(configPath).dir,
        args: args || []
      });
    }
  };
}

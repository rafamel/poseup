// TODO npm remove slimconf, remove docker dir

import path from 'path';
import getFile from './get-file';
import readConfig from './read-config';
import cmdBuilder from './cmd-builder';
import { setLevel } from '~/utils/logger';
import { IPoseup, IPoseupConfig, IBuild } from '~/types';
import validateConfig from './validate-config';

export default async function builder(opts: IPoseup = {}): Promise<IBuild> {
  // Get poseup file path
  const file = await getFile({
    file: opts.file,
    directory: opts.directory
  });

  // Read poseup file
  const config: IPoseupConfig = await readConfig(file);

  // Validate poseup file
  validateConfig(config);

  // Set logging level as per config file
  // if it hasn't been previously set by args
  if (!opts.log && config.log) setLevel(config.log);

  return {
    config,
    // tslint:disable-next-line no-shadowed-variable
    getCmd({ file, args }) {
      return cmdBuilder({
        project: config.project,
        file,
        directory: opts.directory || path.parse(file).dir,
        args: args || []
      });
    }
  };
}

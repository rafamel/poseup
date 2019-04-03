import path from 'path';
import getFile from './get-file';
import readFile from './read-file';
import validate from './validate';
import cmdBuilder from './cmd-builder';
import { setLevel } from '~/utils/logger';
import { IOptions, IConfig } from '~/types';

export interface IBuild {
  config: IConfig;
  directory: string;
  getCmd(opts: {
    file: string;
    args?: string[];
  }): { cmd: string; args: string[] };
}

export default async function builder(opts: IOptions = {}): Promise<IBuild> {
  if (opts.directory && !path.isAbsolute(opts.directory)) {
    throw Error(`directory must be an absolute path`);
  }

  // Get poseup file path
  const configPath = await getFile({
    file: opts.file,
    directory: opts.directory
  });

  // Read poseup file
  const config: IConfig = await readFile(configPath);
  validate(config);

  // Set logging level as per config file
  // if it hasn't been previously set by args
  if (!opts.log && config.log) setLevel(config.log);

  const directory = opts.directory || path.parse(configPath).dir;
  return {
    config,
    directory,
    getCmd({ file, args }) {
      return cmdBuilder({
        project: config.project,
        args,
        file,
        directory
      });
    }
  };
}

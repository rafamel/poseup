import path from 'path';
import getFile from './get-file';
import readFile from './read-file';
import validate from './validate';
import cmdBuilder from './cmd-builder';
import { setLevel } from '~/utils/logger';
import { IOptions, IConfig } from '~/types';

export interface IBuild {
  config: IConfig;
  getCmd(opts: {
    file: string;
    args?: string[];
  }): { cmd: string; args: string[] };
}

export default async function builder(opts: IOptions = {}): Promise<IBuild> {
  // Get poseup file path
  const file = await getFile({
    file: opts.file,
    directory: opts.directory
  });

  // Read poseup file
  const config: IConfig = await readFile(file);
  validate(config);

  // Set logging level as per config file
  // if it hasn't been previously set by args
  if (!opts.log && config.log) setLevel(config.log);

  return {
    config,
    // tslint:disable-next-line no-shadowed-variable
    getCmd({ file, args }) {
      return cmdBuilder({
        project: config.project,
        args,
        file,
        directory: opts.directory || path.parse(file).dir
      });
    }
  };
}

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
  let directory = opts.directory
    ? path.isAbsolute(opts.directory)
      ? opts.directory
      : path.join(process.cwd(), opts.directory)
    : process.cwd();

  // Get poseup file path
  const configPath = await getFile({
    file:
      opts.file && !path.isAbsolute(opts.file)
        ? path.join(process.cwd(), opts.file)
        : opts.file,
    directory
  });

  // Read poseup file
  const config: IConfig = await readFile(configPath);
  if (!opts.directory) directory = path.parse(configPath).dir;

  // Validate config
  validate(config);

  // Set logging level as per config file
  // if it hasn't been previously set by args
  if (!opts.log && config.log) setLevel(config.log);

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

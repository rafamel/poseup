import Liftoff from 'liftoff';
import fs from 'fs';
import path from 'path';
import ensure from '~/utils/ensure';

export interface IGetFile {
  file?: string;
  directory?: string;
}

export default async function getFile(opts: IGetFile = {}): Promise<string> {
  const dir = opts.directory || process.cwd();
  return opts.file ? getExplicitFile(opts.file, dir) : getDefaultFile(dir);
}

export function getExplicitFile(
  file: string,
  directory: string
): Promise<string> {
  const { ext } = path.parse(file);
  const validExt = ['.js', '.json', '.yml', '.yaml'].includes(ext);
  if (!validExt) return Promise.reject(Error(`Extension ${ext} is not valid`));

  if (!path.isAbsolute(file)) file = path.join(directory, file);

  return ensure.rejection(() => {
    return new Promise((resolve, reject) => {
      fs.access(file, fs.constants.F_OK, (err) => {
        return err
          ? reject(Error(`File ${file} doesn't exist.`))
          : resolve(file);
      });
    });
  });
}

export function getDefaultFile(directory: string): Promise<string> {
  const poseup = new Liftoff({
    name: 'poseup',
    processTitle: 'poseup',
    configName: 'poseup.config',
    extensions: {
      '.js': null,
      '.json': null,
      '.yml': null,
      '.yaml': null
    }
  });

  return new Promise((resolve, reject) => {
    poseup.launch({ cwd: directory }, (env) => {
      return env.configPath
        ? resolve(env.configPath)
        : reject(Error(`poseup.config.{js,json,yml,yaml} could't be found`));
    });
  });
}

import fs from 'fs';
import path from 'path';
import findUp from 'find-up';
import ensure from '~/utils/ensure';
import { FILE_NAME } from '~/constants';

export interface IGetFile {
  file: string;
  directory: string;
}

export default async function getFile(
  opts: Partial<IGetFile>
): Promise<IGetFile> {
  const cwd = process.cwd();

  const directory =
    opts.directory &&
    (path.isAbsolute(opts.directory)
      ? opts.directory
      : path.join(cwd, opts.directory));

  const file =
    opts.file &&
    (path.isAbsolute(opts.file)
      ? opts.file
      : path.join(directory || cwd, opts.file));

  return file
    ? getExplicitFile(file, directory)
    : getDefaultFile(directory || cwd);
}

export async function getExplicitFile(
  file: string,
  directory?: string
): Promise<IGetFile> {
  const { ext } = path.parse(file);
  const validExt = ['.js', '.json', '.yml', '.yaml'].includes(ext);
  if (!validExt) return Promise.reject(Error(`Extension ${ext} is not valid`));

  await exists(file);

  return {
    file,
    directory: directory || path.parse(file).dir
  };
}

export async function getDefaultFile(directory: string): Promise<IGetFile> {
  const file = await findUp(
    ['.js', '.json', '.yml', '.yaml'].map((ext) => FILE_NAME + ext),
    { cwd: directory }
  );
  if (!file) throw Error(`${FILE_NAME}.{js,json,yml,yaml} could't be found`);

  return { file, directory };
}

export async function exists(file: string): Promise<void> {
  await ensure.rejection(() => {
    return new Promise((resolve, reject) => {
      fs.access(file, fs.constants.F_OK, (err) => {
        return err ? reject(Error(`${file} doesn't exist`)) : resolve();
      });
    });
  });
}

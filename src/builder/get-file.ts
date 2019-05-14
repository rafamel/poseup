import fs from 'fs-extra';
import path from 'path';
import up from 'find-up';
import { rejects } from 'errorish';
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
  if (!validExt) throw Error(`Extension ${ext} is not valid`);

  await exists(file);

  return {
    file,
    directory: directory || path.parse(file).dir
  };
}

export async function getDefaultFile(directory: string): Promise<IGetFile> {
  const file = await up(
    ['.js', '.json', '.yml', '.yaml'].map((ext) => FILE_NAME + ext),
    { cwd: directory, type: 'file' }
  );
  if (!file) throw Error(`${FILE_NAME}.{js,json,yml,yaml} could't be found`);

  return { file, directory };
}

export async function exists(file: string): Promise<void> {
  await fs
    .pathExists(file)
    .catch(rejects)
    .then((exists) => rejects(`${file} doesn't exist`, { case: !exists }));
}

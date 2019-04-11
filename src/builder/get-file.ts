import fs from 'fs';
import path from 'path';
import findUp from 'find-up';
import ensure from '~/utils/ensure';
import { FILE_NAME } from '~/constants';

export type TGetFileOpts =
  | { file?: string; directory: string }
  | { file: string; directory?: string };

export default async function getFile(opts: TGetFileOpts): Promise<string> {
  return opts.file
    ? getExplicitFile(opts.file)
    : getDefaultFile(opts.directory as string);
}

export function getExplicitFile(file: string): Promise<string> {
  const { ext } = path.parse(file);
  const validExt = ['.js', '.json', '.yml', '.yaml'].includes(ext);
  if (!validExt) return Promise.reject(Error(`Extension ${ext} is not valid`));

  return ensure.rejection(() => {
    return new Promise((resolve, reject) => {
      fs.access(file, fs.constants.F_OK, (err) => {
        return err
          ? reject(Error(`File ${file} doesn't exist`))
          : resolve(file);
      });
    });
  });
}

export async function getDefaultFile(directory: string): Promise<string> {
  const configPath = await findUp(
    ['.js', '.json', '.yml', '.yaml'].map((ext) => FILE_NAME + ext),
    { cwd: directory }
  );
  if (!configPath) {
    throw Error(`${FILE_NAME}.{js,json,yml,yaml} could't be found`);
  }
  return configPath;
}

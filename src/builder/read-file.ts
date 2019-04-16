import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import rejects from '~/utils/rejects';
import { IConfig } from '~/types';

export default async function readFile(file: string): Promise<IConfig> {
  const { ext } = path.parse(file);

  switch (ext) {
    case '.js':
      return require(file);
    case '.json':
      return fs.readJSON(file).catch(rejects);
    case '.yml':
    case '.yaml':
      return yaml.safeLoad(
        await fs
          .readFile(file)
          .then(String)
          .catch(rejects)
      );
    default:
      throw Error(`Extension not valid`);
  }
}

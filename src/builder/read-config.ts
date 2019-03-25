import fs from 'fs';
import path from 'path';
import pify from 'pify';
import yaml from 'js-yaml';
import { IPoseupConfig } from '~/types';

export default async function readConfig(
  configPath: string
): Promise<IPoseupConfig> {
  const { ext } = path.parse(configPath);

  switch (ext) {
    case '.js':
      return require(configPath);
    case '.json':
      return JSON.parse(await pify(fs.readFile)(configPath));
    case '.yml':
    case '.yaml':
      return yaml.safeLoad(await pify(fs.readFile)(configPath));
    default:
      throw Error(`Extension not valid`);
  }
}

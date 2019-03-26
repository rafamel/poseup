import fs from 'fs';
import path from 'path';
import pify from 'pify';
import yaml from 'js-yaml';
import { IPoseupConfig } from '~/types';

export default async function readFile(file: string): Promise<IPoseupConfig> {
  const { ext } = path.parse(file);

  switch (ext) {
    case '.js':
      return require(file);
    case '.json':
      return JSON.parse(await pify(fs.readFile)(file));
    case '.yml':
    case '.yaml':
      return yaml.safeLoad(await pify(fs.readFile)(file));
    default:
      throw Error(`Extension not valid`);
  }
}

import path from 'path';
import fs from 'fs';
import pify from 'pify';
import yaml from 'js-yaml';
import uuid from 'uuid/v4';
import add, { ADD_TYPES } from '~/utils/add';
import { TMP_DIR } from '~/constants';
import ensureError from './ensure-error';

interface IWriteYaml {
  data: any;
  path?: string;
}

export default async function writeYaml(args: IWriteYaml): Promise<string> {
  try {
    return trunk(args);
  } catch (err) {
    throw ensureError(err);
  }
}

export async function trunk(args: IWriteYaml): Promise<string> {
  const writePath = args.path || path.join(TMP_DIR, uuid() + '.yml');
  const writeDir = path.parse(writePath).dir;

  // If writeDir doesn't exist, create
  await new Promise((resolve) => {
    fs.access(writeDir, fs.constants.F_OK, (err) => {
      return resolve(err && pify(fs.mkdir)(writeDir));
    });
  });

  // Write
  await pify(fs.writeFile)(writePath, yaml.safeDump(args.data));
  if (!args.path) {
    // Only remove if it's a temp file
    add(
      ADD_TYPES.REMOVE_TEMP_FILES,
      'Remove temporary file: ' + writePath.split('/').slice(-1)[0],
      () => pify(fs.unlink)(writePath).catch((err) => ensureError(err))
    );
  }

  return writePath;
}

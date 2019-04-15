import path from 'path';
import fs from 'fs';
import pify from 'pify';
import yaml from 'js-yaml';
import uuid from 'uuid/v4';
import { add, ADD_TYPES } from '~/utils/teardown';
import { TMP_DIR } from '~/constants';
import ensure from './ensure';

interface IWriteYaml {
  data: any;
  path?: string;
}

export default async function writeYaml(args: IWriteYaml): Promise<string> {
  return ensure.rejection(() => trunk(args));
}

export async function trunk(args: IWriteYaml): Promise<string> {
  const writePath = args.path || path.join(TMP_DIR, uuid() + '.yml');
  const writeDir = path.parse(writePath).dir;

  // If writeDir doesn't exist, create
  await ensure.rejection(() => {
    return new Promise((resolve) => {
      fs.access(writeDir, fs.constants.F_OK, (err) => {
        return resolve(err && pify(fs.mkdir)(writeDir));
      });
    });
  });

  // Write
  await ensure.rejection(() =>
    pify(fs.writeFile)(writePath, yaml.safeDump(args.data))
  );

  if (!args.path) {
    // Only remove if it's a temp file
    add(
      ADD_TYPES.REMOVE_TEMP_FILES,
      'Remove temporary file: ' + path.parse(writePath).name,
      () => ensure.rejection(() => pify(fs.unlink)(writePath))
    );
  }

  return writePath;
}

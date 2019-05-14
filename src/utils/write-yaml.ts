import path from 'path';
import fs from 'fs-extra';
import yaml from 'js-yaml';
import uuid from 'uuid/v4';
import { add, ADD_TYPES } from '~/lifecycle';
import { TMP_DIR } from '~/constants';
import { rejects } from 'errorish';

interface IWriteYaml {
  data: any;
  path?: string;
}

export default async function writeYaml(args: IWriteYaml): Promise<string> {
  return trunk(args);
}

export async function trunk(args: IWriteYaml): Promise<string> {
  const writePath = args.path || path.join(TMP_DIR, uuid() + '.yml');
  const writeDir = path.parse(writePath).dir;

  // If writeDir doesn't exist, create
  await fs.ensureDir(writeDir).catch(rejects);

  // Write
  await fs.writeFile(writePath, yaml.safeDump(args.data)).catch(rejects);

  if (!args.path) {
    // Only remove if it's a temp file
    add(
      ADD_TYPES.REMOVE_TEMP_FILES,
      'Remove temporary file: ' + path.parse(writePath).name,
      () => fs.unlink(writePath).catch(rejects)
    );
  }

  return writePath;
}

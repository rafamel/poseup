import path from 'path';
import os from 'os';
import fs from 'fs';
import pify from 'pify';
import yaml from 'js-yaml';
import uuid from 'uuid/v4';
import onExit from '~/utils/on-exit';

const TMP_DIR = path.join(os.tmpdir(), 'poseup');

interface IWriteYaml {
  data: any;
  path?: string;
}
export default async function writeYaml(args: IWriteYaml): Promise<string> {
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
    onExit('Remove temporary files', () => pify(fs.unlink)(writePath));
  }

  return writePath;
}

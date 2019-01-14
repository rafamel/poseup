import path from 'path';
import fs from 'fs';
import pify from 'pify';
import yaml from 'js-yaml';
import onExit from '~/utils/on-exit';

interface IWriteYaml {
  data: any;
  path: string;
  remove: boolean;
}

export default async function writeYaml({
  data,
  path: writePath,
  remove
}: IWriteYaml): Promise<void> {
  const writeDir = path.parse(writePath).dir;

  // If writeDir doesn't exist, create
  await new Promise((resolve) => {
    fs.access(writeDir, fs.constants.F_OK, (err) => {
      return resolve(err && pify(fs.mkdir)(writeDir));
    });
  });

  // Write
  await pify(fs.writeFile)(writePath, yaml.safeDump(data));
  if (remove) {
    // Only remove if it's a temp file
    onExit('Remove temporary files', () => pify(fs.unlink)(writePath));
  }
}

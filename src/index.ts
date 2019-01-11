/**
 * @module Poseup
 */

// TODO commander, npm remove slimconf, remove docker dir

import path from 'path';
import fs from 'fs';
// import os from 'os';
import pify from 'pify';
import yaml from 'js-yaml';
import uuid from 'uuid/v4';
import { readConfig, getExplicitFile, getDefaultFile } from './read-config';
import onExit from './on-exit';
import cmdBuilder from './cmd-builder';

// TODO uncomment
// const TMP_DIR = path.join(os.tmpdir(), 'poseup');
const TMP_DIR = path.join(process.cwd(), 'docker/tmp');

interface IPoseup {
  file?: string;
}

async function main({ file }: IPoseup = {}) {
  // TODO: check binaries available: docker docker-compose

  // Get config file path
  const configPath = await (file ? getExplicitFile(file) : getDefaultFile());
  // Read configuration
  const c = await readConfig(configPath);
  // TODO validate config

  const tmpFilePath = path.join(TMP_DIR, uuid() + '.yml');

  // If TMP_DIR doesn't exist, create
  await new Promise((resolve) => {
    fs.access(TMP_DIR, fs.constants.F_OK, (err) => {
      return resolve(err && pify(fs.mkdir)(TMP_DIR));
    });
  });

  await pify(fs.writeFile)(tmpFilePath, yaml.safeDump(c.compose));
  onExit(() => pify(fs.unlink)(tmpFilePath));

  const cmd = cmdBuilder({
    project: c.project,
    file: tmpFilePath,
    directory: path.parse(configPath).dir // TODO if received via args, use that
  });

  console.log(cmd);
}

main();

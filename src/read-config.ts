import Liftoff from 'liftoff';
import fs from 'fs';
import path from 'path';
import pify from 'pify';
import yaml from 'js-yaml';

export async function readConfig(configPath: string): Promise<any> {
  const { ext } = path.parse(configPath);

  switch (ext) {
    case '.js':
      return require(configPath);
    case '.json':
      return JSON.parse(await pify(fs.readFile)(configPath));
    case '.yml':
      return yaml.safeLoad(await pify(fs.readFile)(configPath));
    default:
      return Error(`Extension not valid`);
  }
}

export function getExplicitFile(configPath: string): Promise<string> {
  const { ext } = path.parse(configPath);
  const validExt = ['.js', '.json', '.yml'].includes(ext);
  if (!validExt) return Promise.reject(Error(`Extension ${ext} is not valid`));

  if (configPath.slice(0) !== '/') {
    configPath = path.join(process.cwd(), configPath);
  }

  return new Promise((resolve, reject) => {
    fs.access(configPath, fs.constants.F_OK, (err) => {
      return err
        ? reject(Error(`File ${configPath} doesn't exist.`))
        : resolve(configPath);
    });
  });
}

export function getDefaultFile(): Promise<string> {
  const poseUp = new Liftoff({
    name: 'poseup',
    processTitle: 'poseup',
    configName: 'poseup.config',
    extensions: {
      '.js': null,
      '.json': null,
      '.yml': null
    }
  });

  return new Promise((resolve, reject) => {
    poseUp.launch({}, (env) => {
      return env.configPath
        ? resolve(env.configPath)
        : reject(Error(`poseup.config.{js,json,yml} could't be found`));
    });
  });
}

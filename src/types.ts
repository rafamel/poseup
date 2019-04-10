import { LogLevelDesc } from 'loglevel';

export type TLogger = LogLevelDesc;

export interface IOptions {
  log?: TLogger;
  file?: string;
  directory?: string;
  environment?: string;
}

export interface IRunOptions extends IOptions {
  list?: boolean;
  tasks?: string[];
  sandbox?: boolean;
  detect?: boolean;
  timeout?: number;
}

export interface IComposeOptions extends IOptions {
  write?: string;
  dry?: boolean;
  clean?: boolean;
  stop?: boolean;
  args?: string[];
}

export interface ICleanOptions extends IOptions {
  volumes?: boolean;
}

export interface IPurgeOptions {
  force?: boolean;
  log?: TLogger;
}

export interface IConfig {
  log?: TLogger;
  project: string;
  persist?: string[];
  tasks?: {
    [key: string]: ITask;
  };
  compose: {
    [key: string]: any;
  };
}

export interface ITask {
  description?: string;
  primary?: string;
  services?: string[];
  cmd?: string[];
  exec?: IOfType<string[]> | Array<IOfType<string[]>>;
}

export interface IOfType<T> {
  [key: string]: T;
}

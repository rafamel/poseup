import { LogLevelDesc } from 'loglevel';

export type TLogger = LogLevelDesc;

export interface IOptions {
  log?: TLogger;
  file?: string;
  directory?: string;
  environment?: string;
}

export interface IRunOptions extends IOptions {
  tasks?: string[];
  wait?: number | string;
  sandbox?: boolean;
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
  force: boolean;
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
  primary?: string;
  services?: string[];
  cmd?: string[];
  exec?: Array<{ [key: string]: string[] }>;
}

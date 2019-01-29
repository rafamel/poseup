import { LogLevelDesc } from 'loglevel';

export type TLogger = LogLevelDesc;

export interface IBuild {
  config: IPoseupConfig;
  getCmd(opts: {
    file: string;
    args?: string[];
  }): { cmd: string; args: string[] };
}

export interface IPoseup {
  log?: TLogger;
  file?: string;
  directory?: string;
  environment?: string;
}

export interface ITask {
  primary?: string;
  services?: string[];
  cmd?: string[];
  exec?: Array<{ [key: string]: string[] }>;
}

export interface IPoseupConfig {
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

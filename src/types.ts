export enum ELoglevel {
  SILENT = 'silent',
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface IBuild {
  config: IPoseupConfig;
  getCmd(opts: {
    file: string;
    args?: string[];
  }): { cmd: string; args: string[] };
}

export interface IPoseup {
  log?: ELoglevel;
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
  log?: ELoglevel;
  project: string;
  persist?: string[];
  tasks?: {
    [key: string]: ITask;
  };
  compose: {
    [key: string]: any;
  };
}

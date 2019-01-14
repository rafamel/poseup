export enum ELoglevel {
  SILENT = 'silent',
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface IPoseup {
  log?: ELoglevel;
  file?: string;
  directory?: string;
  environment?: string;
}

export interface IPoseupBuild extends IPoseup {
  write?: string;
  args?: string[];
}

export interface IPoseupConfig {
  log?: ELoglevel;
  project: string;
  persist?: string[];
  tasks?: {
    [key: string]: {
      primary: string;
      cmd: { [key: string]: string };
      exec: Array<{ [key: string]: string }> | { [key: string]: string };
    };
  };
  compose: {
    [key: string]: any;
  };
}

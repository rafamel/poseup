/**
 * A logging level value.
 */
export type TLogger = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

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

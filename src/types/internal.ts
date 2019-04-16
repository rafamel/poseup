import { TLogger } from './options';

export interface IOfType<T> {
  [key: string]: T;
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

declare module 'manage-path' {
  export interface IAlterPath {
    unshift(...arr: Array<string | string[]>): string;
    push(...arr: Array<string | string[]>): string;
    get(): string;
    restore(): string;
  }

  export default function managePath(envs: {
    [key: string]: string | undefined;
  }): IAlterPath;
}

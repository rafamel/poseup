declare module 'node-cleanup' {
  type THandler = (exitCode?: number, signal?: string) => boolean | void;
  interface IMessages {
    ctrl_C?: string;
    uncaughtException?: string;
  }

  function cleanup(handler: THandler, stderrMessages?: IMessages): void;
  function cleanup(stderrMessages: IMessages): void;

  namespace cleanup {
    export function uninstall(): void;
  }

  export default cleanup;
}

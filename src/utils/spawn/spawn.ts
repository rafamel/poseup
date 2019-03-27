import { spawn as _spawn, state as getState } from 'exits';
import { SpawnOptions } from 'child_process';
import { DEFAULT_STDIO } from '~/constants';
import silent from './silent';

// TODO pass environment vars to spawned processes
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function spawn(
  cmd: string,
  args?: string[],
  opts: SpawnOptions = {}
) {
  const state = getState();
  if (!opts.stdio) {
    // Make it silent by default if running inside
    // an exit task (exits tasks have been triggered)
    opts.stdio = state.triggered ? silent() : DEFAULT_STDIO;
  }
  return _spawn(cmd, args, opts).promise;
}

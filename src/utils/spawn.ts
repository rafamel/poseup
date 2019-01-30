import { spawn as _spawn } from 'exits';
import { SpawnOptions } from 'child_process';
import { DEFAULT_STDIO } from '~/constants';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function spawn(
  cmd: string,
  args: string[],
  opts?: SpawnOptions
) {
  if (!opts) opts = {};
  if (!opts.stdio) opts.stdio = DEFAULT_STDIO;

  return _spawn(cmd, args, opts).promise;
}

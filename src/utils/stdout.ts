import { spawn } from 'child_process';
import rejects from '~/utils/rejects';

export default async function stdout(
  cmd: string,
  args: string[]
): Promise<string> {
  return new Promise((resolve: (str: string) => any, reject) => {
    let acc = '';
    const ps = spawn(cmd, args);
    ps.stdout.on('data', (buffer: Buffer) => (acc += buffer.toString()));
    ps.on('close', (code: number) => {
      return code ? reject(Error(`${cmd} process failed`)) : resolve(acc);
    });
    ps.on('error', (err: any) => reject(err));
  }).catch(rejects);
}

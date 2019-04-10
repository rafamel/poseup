import { spawn } from 'child_process';
import ensure from '~/utils/ensure';

export default async function stdout(
  cmd: string,
  args: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    let acc = '';
    const ps = spawn(cmd, args);
    ps.stdout.on('data', (buffer: Buffer) => (acc += buffer.toString()));
    ps.on('close', (code: number) => {
      return code ? reject(Error('docker failed')) : resolve(acc);
    });
    ps.on('error', (err: any) => {
      return reject(ensure.error(err));
    });
  });
}

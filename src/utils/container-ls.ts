import { spawn } from 'child_process';
import ensureError from './ensure-error';

export interface IContainerInfo {
  CreatedAt: string;
  ID: string;
  Image: string;
  Labels: string;
  LocalVolumes: string;
  Names: string;
  Networks: string;
  Ports: string;
  RunningFor: string;
  Size: string;
  Status: string;
}

interface IContainterOpts {
  all?: boolean;
}
export default async function containerLs(
  opts: IContainterOpts = {}
): Promise<IContainerInfo[]> {
  const data: string = await new Promise((resolve, reject) => {
    let acc = '';
    const ps = spawn(
      'docker',
      // @ts-ignore
      [
        'container',
        'ls',
        opts.all && '--all',
        '--format',
        '"{{json .}}"'
      ].filter(Boolean)
    );
    ps.stdout.on('data', (buffer: Buffer) => (acc += buffer.toString()));
    ps.on('close', (code: number) => {
      return code ? reject(Error('docker failed.')) : resolve(acc);
    });
    ps.on('error', (err: any) => {
      return reject(ensureError(err));
    });
  });

  return JSON.parse(
    '[' +
      data
        .split('\n')
        .map((x) => x.trim().slice(1, -1))
        .filter(Boolean)
        .join(',') +
      ']'
  ).map((container: any) => {
    // delete Command and Mounts keys as they are truncated:
    // ex. "docker-entrypoint.s…"
    delete container['Command'];
    delete container['Mounts'];
    return container;
  });
}

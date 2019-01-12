import { spawn } from 'child_process';

interface IContainerInfo {
  Command: string;
  CreatedAt: string;
  ID: string;
  Image: string;
  Labels: string;
  LocalVolumes: string;
  Mount: string;
  Names: string;
  Networks: string;
  Ports: string;
  RunningFor: string;
  Size: string;
  Status: string;
}

export default async function containerLs({
  all
}: {
  all: boolean;
}): Promise<IContainerInfo[]> {
  const data: string = await new Promise((resolve, reject) => {
    let acc = '';
    const ps = spawn(
      'docker',
      // @ts-ignore
      ['container', 'ls', all && '--all', '--format', '"{{json .}}"'].filter(
        Boolean
      )
    );
    ps.stderr.pipe(process.stderr);
    ps.stdout.on('data', (buffer: Buffer) => (acc += buffer.toString()));
    ps.on('close', (code: number) =>
      code ? reject(Error('docker failed.')) : resolve(acc)
    );
  });

  return JSON.parse(
    '[' +
      data
        .split('\n')
        .map((x) => x.trim().slice(1, -1))
        .filter(Boolean)
        .join(',') +
      ']'
  );
}

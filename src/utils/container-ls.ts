import stdout from './stdout';

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
  const data: string = await stdout(
    'docker',
    // @ts-ignore
    ['container', 'ls', opts.all && '--all', '--format', '"{{json .}}"'].filter(
      Boolean
    )
  );

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

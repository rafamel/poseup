export interface ICmdBuilder {
  project?: string;
  args?: string[];
  file: string;
  directory: string;
}

export default function cmdBuilder(
  opts: ICmdBuilder
): { cmd: string; args: string[] } {
  const args = opts.args || [];

  args.unshift(
    ...['-f', opts.file, '--project-directory', opts.directory].concat(
      opts.project ? ['-p', opts.project] : []
    )
  );

  return {
    cmd: 'docker-compose',
    args
  };
}

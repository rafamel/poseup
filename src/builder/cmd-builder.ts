interface ICmdBuilder {
  project: string;
  file: string;
  directory: string;
  args: string[];
}

export default function cmdBuilder({
  project,
  file,
  directory,
  args
}: ICmdBuilder): { cmd: string; args: string[] } {
  args.unshift(
    ...['-f', file, '--project-directory', directory].concat(
      project ? ['-p', project] : []
    )
  );

  return {
    cmd: 'docker-compose',
    args
  };
}

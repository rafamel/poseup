interface ICmdBuilder {
  project?: string;
  file: string;
  directory: string;
}

export default function cmdBuilder({
  project,
  file,
  directory
}: ICmdBuilder): string {
  let str = `docker-compose -f ${file} --project-directory ${directory}`;
  if (project) str += ` -p ${project}`;
  return str;
}

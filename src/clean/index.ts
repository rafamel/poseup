import builder from '~/builder';
import { IPoseup, IBuild } from '~/types';
import initialize from '~/utils/initialize';
import strip from './strip-services';
import write from '~/utils/write-yaml';
import spawn from '~/utils/spawn';

interface IClean extends IPoseup {
  volumes?: boolean;
}
export default async function clean(o: IClean = {}): Promise<void> {
  await initialize(o);
  const { cmd, args } = await cleanBuild(await builder(o), o.volumes);

  await spawn(cmd, args);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function cleanBuild(build: IBuild, volumes = false) {
  const { config, getCmd } = build;

  const compose = strip(config.persist, config.compose);
  const file = await write({ data: compose });
  return getCmd({
    file,
    args: ['down'].concat(volumes ? ['--volumes'] : [])
  });
}

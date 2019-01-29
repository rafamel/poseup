import builder from '~/builder';
import { IPoseup, IBuild } from '~/types';
import exec from '~/utils/exec';
import wrap from '~/utils/wrap-entry';
import strip from './strip-services';
import write from '~/utils/write-yaml';

interface IClean extends IPoseup {
  volumes?: boolean;
}
export default function clean(o: IClean = {}): Promise<void> {
  return wrap(async () => {
    const { cmd, args } = await cleanBuild(await builder(o), o.volumes);
    return exec(cmd, args);
  });
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

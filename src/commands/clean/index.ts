import builder, { IBuild } from '~/builder';
import { ICleanOptions } from '~/types';
import initialize from '~/utils/initialize';
import strip from './strip-services';
import write from '~/utils/write-yaml';
import spawn from '~/utils/spawn';

export default async function clean(
  options: ICleanOptions = {}
): Promise<void> {
  await initialize(options);
  const { cmd, args } = await cleanBuild(
    await builder(options),
    options.volumes
  );

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

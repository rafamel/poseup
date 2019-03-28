import { IBuild } from '~/builder';
import strip from './strip-services';
import write from '~/utils/write-yaml';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function getCmd(build: IBuild, volumes = false) {
  const { config, getCmd } = build;

  const compose = strip(config.persist, config.compose);
  const file = await write({ data: compose });
  return getCmd({
    file,
    args: ['down'].concat(volumes ? ['--volumes'] : [])
  });
}

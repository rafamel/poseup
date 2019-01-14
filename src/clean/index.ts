import builder from '~/builder';
import { IPoseup } from '~/types';
import exec from '~/utils/exec';
import wrap from '~/utils/wrap-entry';
import strip from './strip-services';
import write from '~/utils/write-yaml';

interface IClean extends IPoseup {
  volumes?: boolean;
}

export default function clean(o: IClean = {}) {
  return wrap(async () => {
    const { config, getCmd } = await builder(o);
    const compose = strip(config.persist, config.compose);

    const file = await write({ data: compose });
    const { cmd, args } = getCmd({
      file,
      args: ['down'].concat(o.volumes ? ['--volumes'] : [])
    });

    return exec(cmd, args);
  });
}

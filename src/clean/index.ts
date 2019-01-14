import builder from '~/builder';
import { IPoseup } from '~/types';
import exec from '~/utils/exec';
import wrap from '~/utils/wrap-entry';
import strip from './strip-services';
import path from 'path';

interface IClean extends IPoseup {
  volumes?: boolean;
}

export default function clean(o: IClean = {}) {
  return wrap(async () => {
    const { cmd, args } = await builder(
      { ...o, write: path.join(__dirname, '../docker/tmp.yml') },
      (config) => ({
        ...config,
        compose: strip(config.persist, config.compose)
      })
    );

    return exec(
      cmd,
      args.concat('down').concat(o.volumes ? ['--volumes'] : [])
    );
  });
}

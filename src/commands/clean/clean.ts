import builder from '~/builder';
import { ICleanOptions } from '~/types';
import initialize from '~/utils/initialize';
import spawn from '~/utils/spawn';
import getCmd from './get-cmd';

export default async function clean(
  options: ICleanOptions = {}
): Promise<void> {
  await initialize(options);

  const { cmd, args } = await getCmd(await builder(options), options.volumes);

  await spawn(cmd, args);
}

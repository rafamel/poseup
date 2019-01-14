/**
 * Given an array of strings, strips all services with those names from
 * a given docker-compose object, striping also all networks and volumes
 * not associated with them.
 * If removeDeps = true, it also scrubs depends_on,
 * networks, and volumes properties out of services
 */

export default function stripServices(
  stripArr?: string[],
  composeObj: { [key: string]: any } = {},
  opts: { removeDeps: boolean } = { removeDeps: true }
): any {
  const toStripServices: string[] = stripArr || [];
  let toStripNetworks: string[] = [];
  let toStripVolumes: string[] = [];

  toStripServices.forEach((name) => {
    const service = composeObj.services[name];
    toStripNetworks = toStripNetworks.concat(service.networks || []);
    toStripVolumes = toStripVolumes.concat(service.volumes || []);
  });

  toStripNetworks = toStripNetworks.filter(
    (x, i, arr) => typeof x === 'string' && arr.indexOf(x) === i
  );
  toStripVolumes = toStripVolumes.filter(
    (x, i, arr) => typeof x === 'string' && arr.indexOf(x) === i
  );

  return {
    ...composeObj,
    services: Object.keys(composeObj.services || {})
      .filter((x) => !toStripServices.includes(x))
      .reduce((acc: any, name) => {
        const service = composeObj.services[name];
        acc[name] = opts.removeDeps
          ? { ...service, depends_on: [], volumes: [], networks: [] }
          : service;
        return acc;
      }, {}),
    networks: Object.keys(composeObj.networks || {})
      .filter((x) => !toStripNetworks.includes(x))
      .reduce((acc: any, name) => {
        acc[name] = composeObj.networks[name];
        return acc;
      }, {}),
    volumes: Object.keys(composeObj.volumes || {})
      .filter((x) => !toStripVolumes.includes(x))
      .reduce((acc: any, name) => {
        acc[name] = composeObj.volumes[name];
        return acc;
      }, {})
  };
}

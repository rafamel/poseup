/* eslint-disable @typescript-eslint/camelcase */
import strip from '../../../src/commands/clean/strip-services';

const compose = {
  version: '3.4',
  services: {
    app: {
      image: 'node:8-alpine',
      depends_on: ['db'],
      deploy: { restart_policy: { condition: 'on-failure' } },
      ports: ['3001:3000'],
      volumes: ['vol1', 'vol2'],
      networks: ['net1', 'net2']
    },
    db1: {
      image: 'postgres:11-alpine',
      networks: ['net1'],
      volumes: ['vol1'],
      deploy: { restart_policy: { condition: 'on-failure' } }
    },
    db2: { image: 'postgres:11-alpine' }
  },
  networks: { net1: {}, net2: {} },
  volumes: { vol1: {}, vol2: {} }
};

test(`doesn't throw`, () => {
  expect(() => strip()).not.toThrow();
  expect(() => strip(undefined, compose)).not.toThrow();
  expect(() => strip(['app'], compose)).not.toThrow();

  const noNetworks = Object.assign({}, compose);
  delete noNetworks.networks;
  expect(() => strip(undefined, noNetworks)).not.toThrow();
  expect(() => strip(['app'], noNetworks)).not.toThrow();

  const noVolumes = Object.assign({}, compose);
  delete noVolumes.volumes;
  expect(() => strip(undefined, noVolumes)).not.toThrow();
  expect(() => strip(['app'], noVolumes)).not.toThrow();
});
test(`throws if stripArr has keys not contained in services`, () => {
  expect(() => strip(['foo'])).toThrow();
  expect(() => strip(['foo'], compose)).toThrow();
  expect(() => strip(['foo'], compose, { removeDeps: false })).toThrow();
});
test(`returns compose if no stripArr and removeDeps = false`, () => {
  expect(strip(undefined, compose, { removeDeps: false })).toEqual(compose);
  expect(strip([], compose, { removeDeps: false })).toEqual(compose);
});
test(`returns compose services without networks, dependencies, and volumes for removeDeps = true`, () => {
  const res = {
    ...compose,
    services: {
      app: {
        ...compose.services.app,
        depends_on: [],
        volumes: [],
        networks: []
      },
      db1: {
        ...compose.services.db1,
        depends_on: [],
        volumes: [],
        networks: []
      },
      db2: {
        ...compose.services.db2,
        depends_on: [],
        volumes: [],
        networks: []
      }
    }
  };
  expect(strip(undefined, compose, { removeDeps: true })).toEqual(res);
  expect(strip([], compose, { removeDeps: true })).toEqual(res);
  expect(strip(undefined, compose)).toEqual(res);
  expect(strip([], compose)).toEqual(res);
});
test(`removes services, and associated networks and volumes, on stripArr`, () => {
  expect(strip(['app'], compose)).toEqual({
    ...compose,
    services: {
      db1: {
        ...compose.services.db1,
        depends_on: [],
        volumes: [],
        networks: []
      },
      db2: {
        ...compose.services.db2,
        depends_on: [],
        volumes: [],
        networks: []
      }
    },
    networks: {},
    volumes: {}
  });
  expect(strip(['db1'], compose)).toEqual({
    ...compose,
    services: {
      app: {
        ...compose.services.app,
        depends_on: [],
        volumes: [],
        networks: []
      },
      db2: {
        ...compose.services.db2,
        depends_on: [],
        volumes: [],
        networks: []
      }
    },
    networks: { net2: compose.networks.net2 },
    volumes: { vol2: compose.volumes.vol2 }
  });
  expect(strip(['app', 'db1'], compose)).toEqual({
    ...compose,
    services: {
      db2: {
        ...compose.services.db2,
        depends_on: [],
        volumes: [],
        networks: []
      }
    },
    networks: {},
    volumes: {}
  });
  expect(strip(['app', 'db1', 'db2'], compose)).toEqual({
    ...compose,
    services: {},
    networks: {},
    volumes: {}
  });
});

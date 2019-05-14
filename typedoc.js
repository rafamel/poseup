const path = require('path');
const project = require('./project.config');

const pkg = require(path.join(project.get('paths.root'), 'package.json'));
module.exports = {
  name: `${pkg.name} ${pkg.version}`,
  mode: 'file',
  module: 'system',
  theme: 'default',
  includeDeclarations: true,
  excludePrivate: true,
  excludeProtected: true,
  excludeExternals: true,
  excludePrivate: true,
  excludeNotExported: false,
  readme: path.join(project.get('paths.root'), 'README.md'),
  exclude: [
    '**/__mocks__/**/*',
    '**/src/*',
    '**/src/!(commands|utils|types)/**/*',
    '**/types/!(options)*',
    '**/lifecycle/**/!(attach|teardown)*',
    '**/src/commands/!(compose|purge)*',
    '**/src/commands/run/!(index)*',
    '**/src/commands/clean/!(clean)*'
  ]
};

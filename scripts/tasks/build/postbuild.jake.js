const fs = require('fs');
const path = require('path');

desc('Postbuild tasks');
task('postbuild', (ROOT_DIR) => {
  if (!ROOT_DIR) {
    throw Error('No root or output paths were passed');
  }

  const project = require(path.join(ROOT_DIR, 'project.config'));

  // Ensures adequate configuration for node only projects
  if (project.get('nodeOnly')) {
    const babelrc = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, '.babelrc'))
    );
    const preset = babelrc.presets
      ? babelrc.presets
          .filter((x) => Array.isArray(x))
          .filter((x) => x[0] === '@babel/preset-env')
          .filter((x) => x[1].targets && x[1].targets.node)
      : [];
    if (!preset.length) {
      throw Error(
        `For a package to be node only .babelrc must include "@babel/preset-env" with node as a target`
      );
    }

    // Modify package.json
    const file = path.join(ROOT_DIR, 'pkg/package.json');
    const pkg = JSON.parse(fs.readFileSync(file));

    if (pkg.main || pkg.module) {
      throw Error(
        `For a package to be node only pika pipeline must not include "@pika/plugin-build-node" or "@pika/plugin-build-web"`
      );
    }

    const main = pkg.esnext;
    delete pkg.esnext;
    pkg.main = main;

    if (pkg.bin) {
      const dir = path.parse(main).dir;
      pkg.bin = Object.keys(pkg.bin).reduce((acc, key) => {
        acc[key] = pkg.bin[key].replace(/^(\.\/)?src\//, dir + '/');
        return acc;
      }, {});
    }

    fs.writeFileSync(file, JSON.stringify(pkg, null, 2));
  }
});

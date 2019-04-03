const fs = require('fs');
const path = require('path');

desc('Checks nps scripts are available as npm run scripts');
task('lintscripts', (fix) => {
  const nps = require(path.join(process.cwd(), 'package-scripts'));
  const pkg = require(path.join(process.cwd(), 'package.json'));
  const scripts = nps.scripts;
  const packageScripts = pkg.scripts;
  const names = {};

  const traverse = (obj, path = '') => {
    if (typeof obj !== 'object') {
      path = path.slice(1).replace(/:default$/, '');
      return (names[path] = 'nps ' + path.replace(/:/g, '.'));
    }

    Object.entries(obj).forEach(([key, value]) => {
      if (key !== 'private') traverse(value, path + ':' + key);
    });
  };
  traverse(scripts);

  if (!fix) {
    const namesKeys = Object.keys(names);
    for (let i = 0; i < namesKeys.length; i++) {
      const key = namesKeys[i];
      const value = names[key];
      if (
        !packageScripts.hasOwnProperty(key) ||
        !packageScripts[key] === value
      ) {
        throw Error(
          `NPM scripts (package.json) lacks nps script ${key} with value ${value}`
        );
      }
    }
    return;
  }

  Object.assign(pkg.scripts, names);
  fs.writeFileSync(
    path.join(__dirname, '../../../package.json'),
    JSON.stringify(pkg, null, 2)
  );
});

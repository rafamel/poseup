const fs = require('fs');
const path = require('path');

function rw(fn) {
  const file = path.join(process.cwd(), 'pkg/package.json');
  const pkg = JSON.parse(fs.readFileSync(file));
  if (fn(pkg)) fs.writeFileSync(file, JSON.stringify(pkg, null, 2));
}

namespace('pkg', () => {
  desc('Add a key on package.json output');
  task('add', (...args) => {
    return rw((pkg) => {
      while (args.length) {
        const key = args.shift();
        const value = args.shift();
        pkg[key] = value;
      }
      return true;
    });
  });
  desc('Removes keys from package.json output');
  task('remove', (...keys) => {
    return rw((pkg) => {
      keys.forEach((key) => {
        delete pkg[key];
      });
      return true;
    });
  });
  desc('Forbid a key on package.json output');
  task('forbid', (...keys) => {
    return rw((pkg) => {
      keys.forEach((key) => {
        if (pkg.hasOwnProperty(key)) {
          throw Error(
            `Output package.json shouldn't have key ${key} for current configuration`
          );
        }
      });
      return false;
    });
  });
});

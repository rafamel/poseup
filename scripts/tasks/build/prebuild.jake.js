const fs = require('fs');
const path = require('path');

desc('Prebuild tasks');
task('prebuild', (ROOT_DIR) => {
  if (!ROOT_DIR) throw Error('No root path was passed');

  const project = require(path.join(ROOT_DIR, 'project.config'));

  // Ensures ttsc and ttsconfig are used
  if (project.get('typescript')) {
    function traverse(dir) {
      fs.readdirSync(dir).forEach((name) => {
        const item = path.join(dir, name);

        if (fs.statSync(item).isDirectory()) return traverse(item);
        else if (/\.js$/.exec(item)) {
          modify(item);
        }
      });
    }

    function modify(file) {
      let modified = false;
      let content = fs.readFileSync(file).toString();
      if (/node_modules\/\.bin\/tsc/.exec(content)) {
        done.tsc = modified = true;
        content = content.replace(
          /node_modules\/\.bin\/tsc/g,
          'node_modules/.bin/ttsc'
        );
      }
      if (/tscBin, ?\[[^'-p']/.exec(content)) {
        done.tsconfig = modified = true;
        content = content.replace(
          /tscBin, ?\[/g,
          `tscBin, ['-p', '${path.join(ROOT_DIR, 'ttsconfig.json')}', `
        );
      }
      if (modified) fs.writeFileSync(file, content);

      if (/node_modules\/\.bin\/ttsc/.exec(content)) done.tsc = true;
      if (/tscBin, ?\['-p'/.exec(content)) done.tsconfig = true;
    }

    const done = { tsc: false, tsconfig: false };
    traverse(path.join(ROOT_DIR, 'node_modules/@pika/plugin-build-types'));

    if (!done.tsc) {
      throw Error(`Couldn't find tsc binary path on @pika/plugin-build-types`);
    }
    if (!done.tsconfig) {
      throw Error(
        `Couldn't find tsconfig.json path on @pika/plugin-build-types`
      );
    }
  }
});

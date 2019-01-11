desc('Runs commands');
task('exec', { async: true }, (cmds, silent) => {
  jake.exec(cmds, { interactive: !silent });
});

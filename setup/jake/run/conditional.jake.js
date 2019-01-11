desc('Conditional command run');
task(
  'conditional',
  { async: true },
  async (message, trueCmd, falseCmd, timeout) => {
    const stdin = process.stdin;
    stdin.resume();
    stdin.setEncoding('utf8');

    let listener;
    const promise = new Promise((resolve) => {
      process.stdout.write(
        `${message} [${timeout ? timeout + 's timeout, ' : ''}Y/n]: `,
        'utf8'
      );
      listener = (key) => resolve(key);
      stdin.addListener('data', listener);
    });

    let res = await (timeout
      ? new Promise((resolve) => {
          setTimeout(() => resolve('no'), timeout * 1000);
          promise.then(resolve);
        })
      : promise);
    res = res.replace(/\n/, '').trim();

    const cmd =
      !res || res.toLowerCase() === 'y' || res.toLowerCase() === 'yes'
        ? trueCmd
        : falseCmd;

    console.log('\nExecuting:', cmd);
    jake.exec(cmd, () => process.exit(), { interactive: true });
  }
);

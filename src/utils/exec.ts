import chalk from 'chalk';
import { spawn } from 'child_process';
import logger from 'loglevel';
import onExit from '~/utils/on-exit';
import { waitUntil } from 'promist';

let exitAdded = false;
let processes: any[] = [];

function addExit() {
  if (exitAdded) return;
  exitAdded = true;
  onExit('Wait for child processes to complete', () =>
    waitUntil(() => !processes.length)
  );
}

export default async function exec(
  cmd: string,
  args?: string[],
  opts: { stdio?: boolean } = { stdio: true }
): Promise<void> {
  addExit();

  logger.debug(
    chalk.green('\nRunning: ') + [cmd].concat(args || []).join(' ') + '\n'
  );

  const ps = spawn(cmd, args, {
    stdio: opts.stdio ? [null, process.stdout, process.stderr] : []
  });
  // Pipe instead of directly attaching in order to intercept
  // signals through the main process
  if (opts.stdio) process.stdin.pipe(ps.stdin);
  processes.push(ps);

  return new Promise((resolve, reject) => {
    ps.on('close', (code: number) => {
      if (opts.stdio) process.stdin.emit('end');
      processes = processes.filter((x) => x !== ps);
      code ? reject(Error(`Process failed (${code}): ${cmd}`)) : resolve();
    });
  });
}

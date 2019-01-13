import chalk from 'chalk';
import { spawn } from 'child_process';
import logger from 'loglevel';
import onExit from '~/utils/on-exit';
import { waitUntil } from 'promist';

let exitAdded = false;
const processes: any[] = [];

function addExit() {
  if (exitAdded) return;
  exitAdded = true;
  onExit('Wait for child processes to complete', () =>
    waitUntil(() => {
      return !processes.filter(
        (x) => x.exitCode === undefined || x.exitCode === null
      ).length;
    })
  );
}

export default async function exec(
  cmd: string,
  args?: string[]
): Promise<void> {
  addExit();

  logger.debug(
    chalk.green('\nRunning: ') + [cmd].concat(args || []).join(' ') + '\n'
  );

  const ps = spawn(cmd, args, {
    stdio: [process.stdin, process.stdout, process.stderr]
  });
  processes.push(ps);

  return new Promise((resolve, reject) => {
    ps.on('close', (code: number) => {
      code ? reject(Error(`Process failed (${code}): ${cmd}`)) : resolve();
    });
  });
}

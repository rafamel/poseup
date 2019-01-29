import chalk from 'chalk';
import { spawn, SpawnOptions } from 'child_process';
import logger from 'loglevel';
import onExit, { state } from '~/utils/on-exit';
import { waitUntil, timeout } from 'promist';
import silentStdio from './silent-stdio';
import {
  DEFAULT_STDIO,
  EXEC_SIGTERM_TIMEOUT,
  EXEC_SIGKILL_TIMEOUT
} from '~/constants';

let exitAdded = false;
let processes: any[] = [];

function addExit(): void {
  if (exitAdded) return;
  exitAdded = true;
  onExit('Wait for child processes to complete', async () => {
    // @ts-ignore
    await timeout(EXEC_SIGTERM_TIMEOUT * 1000, true)(
      waitUntil(() => !processes.length)
    ).catch(() => {
      processes.forEach((ps) => ps.kill('SIGTERM'));
      // @ts-ignore
      return timeout(EXEC_SIGKILL_TIMEOUT * 1000, true)(
        waitUntil(() => !processes.length)
      ).catch(() => {
        processes.forEach((ps) => ps.kill('SIGKILL'));
        return waitUntil(() => !processes.length);
      });
    });
  });
}

export default async function exec(
  cmd: string,
  args?: string[],
  opts: SpawnOptions = { stdio: DEFAULT_STDIO }
): Promise<void> {
  addExit();

  if (state.start) opts.stdio = silentStdio();

  logger.debug(
    chalk.green('\nRunning: ') + [cmd].concat(args || []).join(' ') + '\n'
  );

  const ps = spawn(cmd, args, { stdio: opts.stdio });
  processes.push(ps);

  return new Promise((resolve, reject) => {
    ps.on('error', (err) => {
      logger.error(err);
    });
    ps.on('close', (code) => {
      if (ps.stdin) process.stdin.emit('end');
      processes = processes.filter((x) => x !== ps);
      code ? reject(Error(`Process failed (${code}): ${cmd}`)) : resolve();
    });
  });
}

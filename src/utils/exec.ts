import chalk from 'chalk';
import { spawn } from 'child_process';
import logger from 'loglevel';

export default async function exec(
  cmd: string,
  args?: string[]
): Promise<void> {
  logger.debug(
    chalk.green('\nRunning: ') + [cmd].concat(args || []).join(' ') + '\n'
  );

  const ps = spawn(cmd, args, {
    stdio: [process.stdin, process.stdout, process.stderr]
  });

  return new Promise((resolve, reject) => {
    ps.on('close', (code: number) =>
      code
        ? reject(
            Error(
              `Process failed (${code}): ${[cmd].concat(args || []).join(' ')}`
            )
          )
        : resolve()
    );
  });
}

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const processes = [
  { name: 'server', cwd: join(root, 'server') },
  { name: 'client', cwd: join(root, 'client') }
].map(({ name, cwd }) => {
  const child = spawn(npm, ['run', 'dev'], {
    cwd,
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', data => process.stdout.write(`[${name}] ${data}`));
  child.stderr.on('data', data => process.stderr.write(`[${name}] ${data}`));
  child.on('exit', code => {
    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      process.exitCode = code;
    }
  });

  return child;
});

function shutdown() {
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

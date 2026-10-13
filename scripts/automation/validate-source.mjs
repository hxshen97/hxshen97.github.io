import { readFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(process.argv[2]);
const contextPath = resolve(process.argv[3]);
const context = JSON.parse(readFileSync(contextPath, 'utf8'));
mkdirSync(`${root}/.automation`, { recursive: true });
const trustedScript = name => fileURLToPath(new URL(name, import.meta.url));
const commands = [
  [process.execPath, [trustedScript('prepare-source.mjs'), root, contextPath, '--initialize']],
  [process.execPath, [trustedScript('guard-changes.mjs'), root, context.baseSha]],
  ['git', ['diff', '--check', context.baseSha, '--']],
  ['npm', ['ci']],
  ['npx', ['playwright', 'install', '--with-deps', 'chromium']],
  [process.execPath, ['node_modules/astro/astro.js', 'check']],
  [process.execPath, ['--experimental-strip-types', '--test', 'tests/unit/*.test.mjs']],
  [process.execPath, ['node_modules/astro/astro.js', 'build']],
  [process.execPath, [trustedScript('../check-integrity.mjs'), root]],
  [process.execPath, [trustedScript('../test-blog.mjs')]],
  [process.execPath, ['node_modules/@playwright/test/cli.js', 'test']],
];
for (const [command, args] of commands) {
  const label = `${command} ${args.join(' ')}`;
  appendFileSync(`${root}/.automation/validation.log`, `\n$ ${label}\n`);
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', timeout: 300_000, maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: 'true' } });
  const output = `${result.stdout || ''}${result.stderr || ''}${result.error?.message || ''}`;
  console.log(output);
  appendFileSync(`${root}/.automation/validation.log`, `${output}\nexit=${result.status}\n`);
  if (result.status !== 0) process.exit(1);
}

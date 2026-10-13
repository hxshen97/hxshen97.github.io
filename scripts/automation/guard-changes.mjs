import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';

const work = resolve(process.argv[2] || '.');
const base = process.argv[3];
assert.match(base || '', /^[0-9a-f]{40}$/, 'an explicit base SHA is required');
const changed = execFileSync('git', ['diff', '--no-renames', '--name-only', '-z', base, '--'], { cwd: work, encoding: 'utf8' }).split('\0').filter(Boolean);
const protectedPaths = ['.github/', '.agents/', 'scripts/automation/', 'tests/', 'AGENTS.md', 'scripts/check-integrity.mjs', 'scripts/test-blog.mjs', 'scripts/capture-baseline.mjs', 'playwright.config.ts'];
for (const path of changed) {
  if (path.startsWith('tests/unit/') || path.startsWith('tests/e2e/')) {
    try { execFileSync('git', ['cat-file', '-e', `${base}:${path}`], { cwd: work, stdio: 'ignore' }); }
    catch { continue; } // New feature tests are allowed; existing acceptance gates remain immutable.
  }
  assert.ok(!protectedPaths.some(prefix => prefix.endsWith('/') ? path.startsWith(prefix) : path === prefix),
    `automated task changed a control/test file: ${path}; retain as draft for manual infrastructure review`);
}
console.log('Automation controls and acceptance tests unchanged.');

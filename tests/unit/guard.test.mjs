import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('new feature tests are allowed, but existing gates cannot be edited, removed or renamed', () => {
  const root = mkdtempSync(join(tmpdir(), 'homepage-guard-'));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const script = fileURLToPath(new URL('../../scripts/automation/guard-changes.mjs', import.meta.url));
  try {
    mkdirSync(join(root, 'tests/unit'), { recursive: true });
    mkdirSync(join(root, 'src'), { recursive: true });
    writeFileSync(join(root, 'tests/unit/acceptance.test.mjs'), 'original acceptance\n');
    writeFileSync(join(root, 'src/page.astro'), 'original page\n');
    git('init'); git('add', '.');
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'baseline');
    const base = git('rev-parse', 'HEAD').trim();
    const check = () => spawnSync(process.execPath, [script, root, base], { encoding: 'utf8' }).status;
    writeFileSync(join(root, 'src/page.astro'), 'updated page\n');
    writeFileSync(join(root, 'tests/unit/new-feature.test.mjs'), 'new test\n');
    git('add', '.'); assert.equal(check(), 0);
    writeFileSync(join(root, 'tests/unit/acceptance.test.mjs'), 'disabled acceptance\n');
    git('add', '.'); assert.equal(check(), 1);
    writeFileSync(join(root, 'tests/unit/acceptance.test.mjs'), 'original acceptance\n');
    renameSync(join(root, 'tests/unit/acceptance.test.mjs'), join(root, 'tests/unit/renamed.test.mjs'));
    git('add', '-A'); assert.equal(check(), 1);
  } finally {
    // mkdtemp produced this exact task-owned child; never clean a computed parent.
    rmSync(root, { recursive: true, force: true });
  }
});

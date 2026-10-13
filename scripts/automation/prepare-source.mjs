import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(process.argv[2] || '.');
const context = JSON.parse(readFileSync(process.argv[3], 'utf8'));
for (const sha of [context.sourceSha, context.baseSha]) assert.match(sha, /^[0-9a-f]{40}$/);
assert.equal(context.repository, 'hxshen97/hxshen97.github.io');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });

if (process.argv.includes('--clear')) {
  // Only remove explicitly tracked files inside this checkout, before downloading a new source artifact.
  for (const path of git('ls-files', '-z').split('\0').filter(Boolean)) {
    const target = resolve(root, path);
    assert.ok(target.startsWith(`${root}${sep}`) && !path.startsWith('.git/'));
    rmSync(target, { force: true });
  }
} else {
  if (process.argv.includes('--initialize')) {
    git('init'); git('remote', 'add', 'origin', `https://github.com/${context.repository}.git`);
  }
  git('fetch', '--no-tags', 'origin', context.sourceSha, context.baseSha);
  git('reset', '--mixed', context.sourceSha);
  git('add', '-A');
}

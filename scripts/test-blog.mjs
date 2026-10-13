import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, unlinkSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { resolve, sep, basename } from 'node:path';

const names = ['automation-test-published', 'automation-test-draft'];
const paths = names.map(name => `src/content/blog/${name}.md`);
for (const path of paths) assert.ok(!existsSync(path), `reserved fixture collision: ${path}`);
mkdirSync('src/content/blog', { recursive: true });
const automation = resolve('.automation');
mkdirSync(automation, { recursive: true });
const cache = mkdtempSync(`${automation}${sep}blog-cache-`);
const fixtureConfig = `${automation}${sep}blog-fixture.config.mjs`;
writeFileSync(fixtureConfig, `import base from '../astro.config.mjs';\nexport default { ...base, cacheDir: ${JSON.stringify(`./.automation/${basename(cache)}`)} };\n`);
const productionStore = 'node_modules/.astro/data-store.json';
const storeBefore = existsSync(productionStore) ? readFileSync(productionStore) : null;
const copied = [];
try {
  for (let i = 0; i < paths.length; i++) {
    copyFileSync(`tests/fixtures/blog/${names[i]}.md`, paths[i]); copied.push(paths[i]);
  }
  const result = spawnSync(process.execPath, ['node_modules/astro/astro.js', 'build', '--config', '.automation/blog-fixture.config.mjs', '--outDir', '.automation/blog-dist'], { stdio: 'inherit' });
  assert.equal(result.status, 0, 'fixture build failed');
  for (const prefix of ['', 'zh/']) {
    const listing = readFileSync(`.automation/blog-dist/${prefix}blog/index.html`, 'utf8');
    assert.ok(listing.includes('Automation fixture published'));
    assert.ok(!listing.includes('Automation fixture draft'));
    const html = readFileSync(`.automation/blog-dist/${prefix}blog/automation-test-published/index.html`, 'utf8');
    assert.ok(html.includes('class="katex"'), 'math did not render');
    assert.ok(html.includes('katex-display'), 'display math did not render');
    assert.ok(!existsSync(`.automation/blog-dist/${prefix}blog/automation-test-draft/index.html`), 'draft detail was published');
  }
} finally {
  for (const path of copied) unlinkSync(path);
  unlinkSync(fixtureConfig);
  const cleanupTarget = resolve(cache);
  assert.ok(cleanupTarget.startsWith(`${automation}${sep}blog-cache-`), 'cache cleanup must stay within the task cache directory');
  rmSync(cleanupTarget, { recursive: true, force: true });
}
const storeAfter = existsSync(productionStore) ? readFileSync(productionStore) : null;
assert.deepEqual(storeAfter, storeBefore, 'fixture test changed the production content cache');
console.log('Both blog versions render math and exclude drafts. Temporary content and isolated cache removed.');

import { copyFileSync, existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const names = ['automation-test-published', 'automation-test-draft'];
const paths = names.map(name => `src/content/blog/${name}.md`);
for (const path of paths) assert.ok(!existsSync(path), `reserved fixture collision: ${path}`);
mkdirSync('src/content/blog', { recursive: true });
const copied = [];
try {
  for (let i = 0; i < paths.length; i++) {
    copyFileSync(`tests/fixtures/blog/${names[i]}.md`, paths[i]); copied.push(paths[i]);
  }
  const result = spawnSync(process.execPath, ['node_modules/astro/astro.js', 'build', '--outDir', '.automation/blog-dist'], { stdio: 'inherit' });
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
}
console.log('Both blog versions render math and exclude drafts. Temporary content removed.');

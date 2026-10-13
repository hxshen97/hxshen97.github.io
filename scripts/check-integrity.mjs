import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = resolve(process.argv[2] || '.');
const baseline = JSON.parse(readFileSync(new URL('../tests/baseline/content.json', import.meta.url), 'utf8'));
for (const [path, hash] of Object.entries(baseline.files)) {
  assert.ok(existsSync(join(root, path)), `missing existing content/resource: ${path}`);
  // A normal automated refactor may not silently rewrite facts or published resources.
  const content = /\.(md|yaml)$/.test(path) ? readFileSync(join(root, path), 'utf8').replace(/\r\n/g, '\n') : readFileSync(join(root, path));
  const actual = createHash('sha256').update(content).digest('hex');
  assert.equal(actual, hash, `content changed: ${path}; requires an explicit baseline review`);
}
for (const prefix of ['', 'zh/']) {
  for (const fixture of ['automation-test-published', 'automation-test-draft']) {
    assert.ok(!existsSync(join(root, 'dist', prefix, 'blog', fixture, 'index.html')), `test fixture leaked into production: ${prefix}${fixture}`);
  }
  for (const section of ['', 'projects/', 'blog/', 'publications/', 'cv/', 'contact/']) {
    const path = join(root, 'dist', prefix, section, 'index.html');
    assert.ok(existsSync(path), `missing built route: /${prefix}${section}`);
  }
  for (const slug of baseline.projectSlugs) {
    assert.ok(existsSync(join(root, 'dist', prefix, 'projects', slug, 'index.html')), `missing project detail ${prefix}${slug}`);
  }
}
console.log('Content, assets, six bilingual modules, and existing detail routes preserved.');

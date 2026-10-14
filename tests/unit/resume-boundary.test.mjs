import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

test('resume tooling, private data and outputs are not tracked and are ignored', () => {
  const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  assert.ok(!tracked.some(path => path.startsWith('cv/') || path.startsWith('output/pdf/') || /^public\/cv.*\.pdf$/.test(path)));
  for (const path of ['cv/generate.js', 'cv/data.yaml', 'cv/data-zh.yaml', 'output/pdf/cv.pdf', 'public/cv.pdf', 'tmp/pdfs/preview.png']) {
    execFileSync('git', ['check-ignore', '--no-index', '-q', path]);
  }
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(pkg.scripts.cv, undefined);
  assert.equal(pkg.devDependencies.puppeteer, undefined);
  assert.equal(pkg.dependencies.puppeteer, undefined);
  const baseline = JSON.parse(readFileSync('tests/baseline/content.json', 'utf8'));
  assert.ok(!Object.keys(baseline.files).some(path => path.startsWith('cv/') || /^public\/cv.*\.pdf$/.test(path)));
});

test('all public pages and UI use the same email and no resume download label', () => {
  const sources = execFileSync('git', ['ls-files', '-z', 'src'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const emails = new Set();
  for (const path of sources) {
    const text = readFileSync(path, 'utf8');
    for (const match of text.matchAll(/[\w.+-]+@[\w.-]+\.[A-Za-z]+/g)) emails.add(match[0]);
  }
  assert.deepEqual([...emails], ['hxshen_fdu@outlook.com']);
  assert.ok(!readFileSync('src/i18n/ui.ts', 'utf8').includes('cv.download'));
});

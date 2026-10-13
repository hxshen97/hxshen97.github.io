import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import yaml from 'js-yaml';
import { execFileSync } from 'node:child_process';

const content = ['projects', 'publications', 'blog'].flatMap(collection => {
  const directory = `src/content/${collection}`;
  try { return readdirSync(directory).filter(name => name.endsWith('.md')).map(name => `${directory}/${name}`); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
});
const files = [...content, 'cv/data.yaml', 'cv/data-zh.yaml', 'public/cv.pdf', 'public/cv-zh.pdf', 'public/profile.jpg'];
const baseline = {
  capturedFrom: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  files: Object.fromEntries(files.map(path => [path, createHash('sha256').update(/\.(md|yaml)$/.test(path) ? readFileSync(path, 'utf8').replace(/\r\n/g, '\n') : readFileSync(path)).digest('hex')])),
  projectSlugs: content.filter(path => path.startsWith('src/content/projects/')).map(path => path.split('/').at(-1).replace(/\.md$/, '')),
  publications: content.filter(path => path.startsWith('src/content/publications/')).map(path => yaml.load(readFileSync(path, 'utf8').split('---')[1]).title),
  contacts: Object.fromEntries([['en', 'src/pages/contact/index.astro'], ['zh', 'src/pages/zh/contact/index.astro']].map(([lang, path]) => [lang, [...readFileSync(path, 'utf8').matchAll(/href="(mailto:[^"]+)"/g)].map(match => match[1])])),
};
mkdirSync('tests/baseline', { recursive: true });
writeFileSync('tests/baseline/content.json', `${JSON.stringify(baseline, null, 2)}\n`);
console.log('Baseline captured. Review content changes before committing a new baseline.');

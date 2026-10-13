import test from 'node:test';
import assert from 'node:assert/strict';
import { ui, localizedPath, langSwitchPaths } from '../../src/i18n/ui.ts';

test('both languages define the same UI keys', () => {
  assert.deepEqual(Object.keys(ui.en).sort(), Object.keys(ui.zh).sort());
  for (const language of ['en', 'zh']) {
    for (const key of ['nav.about', 'nav.projects', 'nav.blog', 'nav.publications', 'nav.cv', 'nav.contact']) {
      assert.ok(ui[language][key]?.trim(), `${language}: ${key}`);
    }
  }
});

test('localization preserves detail slugs and trailing slashes', () => {
  for (const path of ['/', '/projects/', '/blog/', '/publications/', '/cv/', '/contact/', '/projects/homepage/', '/blog/example/']) {
    const en = localizedPath(path, 'en');
    const zh = localizedPath(path, 'zh');
    assert.equal(en, path);
    assert.equal(zh, path === '/' ? '/zh/' : `/zh${path}`);
    assert.deepEqual(langSwitchPaths(en), { en, zh });
    assert.deepEqual(langSwitchPaths(zh), { en, zh });
  }
});

import assert from 'node:assert/strict';
const base = (process.argv[2] || 'https://hxshen97.github.io').replace(/\/$/, '');
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    for (const prefix of ['', '/zh']) {
      for (const section of ['', 'projects/', 'blog/', 'publications/', 'cv/', 'contact/']) {
        const response = await fetch(`${base}${prefix}/${section}`, { signal: AbortSignal.timeout(20_000) });
        assert.equal(response.status, 200, `unavailable: ${response.url}`);
        const html = await response.text();
        assert.match(html, new RegExp(`<html[^>]*lang="${prefix ? 'zh' : 'en'}"`));
        assert.match(html, /<main[\s>]/);
      }
    }
    for (const path of ['cv.pdf', 'cv-zh.pdf']) {
      const response = await fetch(`${base}/${path}`, { signal: AbortSignal.timeout(20_000) });
      assert.equal(response.status, 200);
      assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
    }
    console.log('Live bilingual modules and CV downloads verified.'); process.exit(0);
  } catch (error) {
    console.error(`Verification attempt ${attempt}: ${error.message}`);
    if (attempt === 3) throw error;
    await new Promise(resolve => setTimeout(resolve, 15_000));
  }
}

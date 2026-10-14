import { test, expect } from '@playwright/test';
import { ui } from '../../src/i18n/ui';

for (const lang of ['en', 'zh'] as const) {
  const prefix = lang === 'zh' ? '/zh' : '';
  const route = `${prefix}/`;

  test(`${lang} homepage actions and published blog state`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(ui[lang]['home.name']);
    await expect(page.locator('.portrait img')).toHaveAttribute('alt', ui[lang]['home.name']);
    await expect(page.getByRole('link', { name: ui[lang]['home.viewProjects'], exact: true })).toHaveAttribute('href', `${prefix}/projects/`);
    await page.getByRole('link', { name: ui[lang]['home.viewCV'], exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/cv/$`));
    await expect(page.locator('main a[download]')).toHaveCount(0);
    await page.goto(route);
    const homePosts = await page.locator('.writing .post-card h3 a').evaluateAll(links => links.map(link => ({ title: link.textContent, href: link.getAttribute('href') })));
    if (homePosts.length === 0) await expect(page.locator('.writing')).toContainText(ui[lang]['home.noPosts']);
    else await expect(page.locator('.writing .empty')).toHaveCount(0);
    await expect(page.locator('.writing .section-link')).toHaveAttribute('href', `${prefix}/blog/`);
    await expect(page.locator('.contact a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:hxshen_fdu@outlook.com');
    await page.getByRole('link', { name: ui[lang]['home.explore'] }).click();
    await expect(page).toHaveURL(/#selected-work$/);
    await expect(page.locator('#projects-heading')).toBeInViewport();
    await page.goto(`${prefix}/blog/`);
    const publishedPosts = await page.locator('.post-card h3 a').evaluateAll(links => links.map(link => ({ title: link.textContent, href: link.getAttribute('href') })));
    expect(homePosts).toEqual(publishedPosts.slice(0, 4));
  });

  test(`${lang} homepage remains readable without JavaScript at 360px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
    const page = await context.newPage();
    await page.goto(route);
    await expect(page.locator('main h1')).toBeVisible();
    for (const selector of ['.project-card', '.pub-card', '.writing .empty, .writing .post-card', '.contact']) {
      const element = page.locator(selector).first();
      await element.scrollIntoViewIfNeeded();
      await expect(element).toBeVisible();
      expect(await element.evaluate(el => getComputedStyle(el).opacity)).toBe('1');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  });

  test(`${lang} motion starts, settles, and respects changing reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.locator('.hero-intro').evaluateAll(elements => elements.some(el => el.getAnimations().length > 0))).toBe(true);
    await expect.poll(() => page.locator('.homepage').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
    await page.locator('.contact').scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('.contact [data-reveal]').evaluate(el => el.getAnimations().length)).toBeGreaterThan(0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => page.locator('.homepage').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
    await page.reload();
    await expect(page.locator('main h1')).toBeVisible();
    expect(await page.locator('.homepage').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
    await page.locator('.contact').scrollIntoViewIfNeeded();
    await expect(page.locator('.contact h2')).toBeVisible();
    expect(await page.locator('.homepage').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
  });
}

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { ui } from '../../src/i18n/ui';

const modules = ['', 'projects', 'blog', 'publications', 'cv', 'contact'];
for (const lang of ['en', 'zh'] as const) {
  const prefix = lang === 'zh' ? '/zh' : '';
  for (const module of modules) {
    const route = `${prefix}/${module ? `${module}/` : ''}`;
    test(`${lang} ${module || 'overview'} remains accessible`, async ({ page }, info) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      for (const section of modules) {
        await expect(page.locator('.sidebar-nav').getByRole('link', { name: ui[lang][`nav.${section || 'about'}`], exact: true }))
          .toHaveAttribute('href', `${prefix}/${section ? `${section}/` : ''}`);
      }
      const other = lang === 'en' ? `/zh/${module ? `${module}/` : ''}` : `/${module ? `${module}/` : ''}`;
      const switchLink = page.locator('.lang-switch').getByRole('link', { name: lang === 'en' ? '中文' : 'EN', exact: true });
      await expect(switchLink).toHaveAttribute('href', other);
      if (info.project.name === 'mobile') {
        const menu = page.getByRole('button', { name: 'Toggle menu' });
        await menu.click();
        await expect(menu).toHaveAttribute('aria-expanded', 'true');
        await expect(page.locator('#sidebar')).toHaveClass(/open/);
        await menu.click();
        await expect(menu).toHaveAttribute('aria-expanded', 'false');
      }
      await page.screenshot({ path: info.outputPath(`${lang}-${module || 'overview'}.png`), fullPage: true });
      if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Toggle menu' }).click();
      await switchLink.click();
      await expect(page).toHaveURL(new RegExp(`${other.replaceAll('/', '\\/')}$`));
    });
  }

  test(`${lang} project details and tag filtering`, async ({ page }) => {
    await page.goto(`${prefix}/projects/`);
    const cards = page.locator('.project-card');
    expect(await cards.count()).toBeGreaterThan(0);
    const tag = page.locator('.filter-btn:not([data-tag="all"])').first();
    await expect(tag).toBeVisible();
    const value = await tag.getAttribute('data-tag');
    await tag.click();
    await expect(tag).toHaveClass(/active/);
    for (const card of await cards.all()) {
      if ((await card.getAttribute('data-tags'))?.split(',').includes(value!)) await expect(card).toBeVisible();
      else await expect(card).toBeHidden();
    }
    await page.locator('[data-tag="all"]').click();
    await expect(cards.first()).toBeVisible();
    const link = cards.first().locator('h3 a');
    const href = await link.getAttribute('href');
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href!.replaceAll('/', '\\/')}$`));
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.lang-switch a:not(.active)')).toHaveAttribute('href', lang === 'en' ? `/zh${href}` : href!.replace(/^\/zh/, ''));
  });

  test(`${lang} CV stays readable without PDF downloads`, async ({ page, request }) => {
    await page.goto(`${prefix}/cv/`);
    const href = lang === 'en' ? '/cv.pdf' : '/cv-zh.pdf';
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('main a[download]')).toHaveCount(0);
    await expect(page.locator('main a[href$=".pdf"]')).toHaveCount(0);
    const response = await request.get(href);
    expect(response.status()).toBe(404);
  });

  test(`${lang} contains baseline publications and contact`, async ({ page }) => {
    await page.goto(`${prefix}/publications/`);
    const baseline = JSON.parse(readFileSync('tests/baseline/content.json', 'utf8'));
    for (const title of baseline.publications) await expect(page.locator('main')).toContainText(title);
    await page.goto(`${prefix}/contact/`);
    for (const href of baseline.contacts[lang]) await expect(page.locator(`main a[href="${href}"]`)).toBeVisible();
    await expect(page.locator('main a[href="https://github.com/hxshen97"]')).toBeVisible();
  });
}

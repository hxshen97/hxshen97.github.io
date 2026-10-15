import { test, expect } from '@playwright/test';
import { ui } from '../../src/i18n/ui';

for (const lang of ['en', 'zh'] as const) {
  const route = lang === 'en' ? '/' : '/zh/';
  test(`${lang} GPU scene morphs, pauses, and respects reduced motion`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (/Shader Error|VALIDATE_STATUS|Error creating WebGL context/.test(message.text())) errors.push(message.text()); });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(route);
    const stage = page.locator('.motion-experience');
    await expect(stage.getByRole('button', { name: ui[lang]['motion.orbit'], exact: true })).toBeVisible();
    const supported = await page.evaluate(() => {
      const context = document.createElement('canvas').getContext('webgl2');
      const result = !!context;
      context?.getExtension('WEBGL_lose_context')?.loseContext();
      return result;
    });
    if (!supported) {
      await expect(page.locator('.motion-static')).toBeVisible();
      await expect(stage).toHaveAttribute('data-motion-state', 'still');
      return;
    }
    const canvas = stage.locator('canvas');
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-motion-state', 'running', { timeout: 20_000 });
    await expect.poll(() => canvas.getAttribute('data-frames')).not.toBeNull();
    const initial = Number(await canvas.getAttribute('data-frames'));
    await expect.poll(async () => Number(await canvas.getAttribute('data-frames'))).toBeGreaterThan(initial + 1);
    await stage.getByRole('button', { name: ui[lang]['motion.orbit'], exact: true }).click();
    await expect(canvas).toHaveAttribute('data-mode', '1');
    await expect(canvas).toHaveAttribute('data-morph', '1.000', { timeout: 7000 });
    await stage.getByRole('button', { name: ui[lang]['motion.wave'], exact: true }).click();
    await expect(canvas).toHaveAttribute('data-mode', '2');
    await expect(canvas).toHaveAttribute('data-morph', '2.000', { timeout: 7000 });
    await stage.getByRole('button', { name: ui[lang]['motion.pause'], exact: true }).click();
    await expect(stage).toHaveAttribute('data-motion-state', 'still');
    await page.waitForTimeout(150);
    const paused = await canvas.getAttribute('data-frames');
    await page.waitForTimeout(180);
    expect(await canvas.getAttribute('data-frames')).toBe(paused);
    await stage.getByRole('button', { name: ui[lang]['motion.resume'], exact: true }).click();
    await expect(stage).toHaveAttribute('data-motion-state', 'running');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(stage).toHaveAttribute('data-motion-state', 'still');
    await expect(stage.getByRole('button', { name: ui[lang]['motion.pulse'], exact: true })).toBeDisabled();
    await page.waitForTimeout(180);
    const still = await canvas.getAttribute('data-frames');
    await page.waitForTimeout(180);
    expect(await canvas.getAttribute('data-frames')).toBe(still);
    expect(errors).toEqual([]);
  });

  test(`${lang} scene has a readable fallback without WebGL`, async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
        if (kind === 'webgl2' || kind === 'webgl' || kind === 'experimental-webgl') return null;
        return Reflect.apply(original, this, [kind, ...args]);
      } as typeof original;
    });
    await page.goto(route);
    await expect(page.locator('.motion-static')).toBeVisible();
    await expect(page.locator('.motion-experience')).toContainText(ui[lang]['motion.fallback']);
    await expect(page.locator('main h1')).toHaveText(ui[lang]['home.name']);
    await page.getByRole('link', { name: ui[lang]['home.viewCV'], exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${lang === 'en' ? '' : '/zh'}/cv/$`));
  });
}

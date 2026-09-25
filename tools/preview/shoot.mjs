// Full-page screenshots of every page in ./out at desktop and mobile widths.
// Usage: node shoot.mjs [page ...]   (e.g. `node shoot.mjs index product`)
// Chromium path: $CHROMIUM_PATH, else Playwright's own install.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const SHOTS = path.join(OUT, 'shots');
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const only = process.argv.slice(2);
const pages = fs.readdirSync(OUT).filter((f) => f.endsWith('.html') && (!only.length || only.includes(f.replace(/\.html$/, ''))));

fs.mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch({ executablePath });
for (const [label, viewport] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.warn(`  js error (${label}): ${e.message}`));
  for (const f of pages) {
    await page.goto(`file://${path.join(OUT, f)}`, { waitUntil: 'load' });
    // Lazy images below the fold never load in a full-page capture; load them all first.
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
      await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
      await document.fonts.ready;
    });
    const file = path.join(SHOTS, `${f.replace(/\.html$/, '')}--${label}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`shot ${path.relative(HERE, file)}`);
  }
  await ctx.close();
}
await browser.close();

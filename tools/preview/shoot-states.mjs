// Screenshots of interactive states the full-page shots can't show:
// open mega menus and the open cart drawer. Run after `node render.mjs`.
//   node shoot-states.mjs          → out/shots/state-*.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.OUT_DIR || path.join(HERE, 'out');
const SHOTS = path.join(OUT, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const open = async (file) => { await page.goto(pathToFileURL(path.join(OUT, file)).href); await page.waitForTimeout(400); };

await open('index.html');
const triggers = await page.$$('[data-mega-trigger]');
for (let i = 0; i < triggers.length; i++) {
  await triggers[i].hover();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SHOTS, `state-mega-${i + 1}.png`) });
  console.log(`shot state-mega-${i + 1}.png`);
}

await open('index.html');
await page.evaluate(() => { const d = document.querySelector('[data-cart-drawer]'); if (d) { d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false'); } });
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(SHOTS, 'state-cart-drawer.png') });
console.log('shot state-cart-drawer.png');

await browser.close();

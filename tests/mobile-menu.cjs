// Run with Playwright available: node tests/mobile-menu.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [375, 440]) {
      const page = await browser.newPage({ viewport: { width, height: 956 } });
      await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => window.scrollTo(0, 2500));
      await page.waitForFunction(() => document.querySelector('#nav').classList.contains('scrolled'));
      await page.locator('#navToggle').click();
      assert.deepEqual(await page.locator('#navMobile').boundingBox(), { x: 0, y: 0, width, height: 956 });
      assert.equal(await page.locator('#navToggle').evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }), true);
      await page.locator('#navToggle').click();
      assert.equal(await page.locator('#navMobile').isVisible(), false);
      await page.locator('#navToggle').click();
      await page.locator('#navMobile a[href="#contact"]').click();
      assert.equal(await page.locator('#navMobile').isVisible(), false);
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      await page.close();
    }
    console.log('Mobile menu covers viewport after scrolling; close button and contact navigation pass at 375px and 440px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

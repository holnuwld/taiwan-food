import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  await page.goto('https://commons.wikimedia.org/wiki/File:2010-10-31_diced_and_fried_egg_tofu_at_the_KIKI_restaurant_in_Taichung.jpg', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const selector = '#file img';
  const imgEl = await page.$(selector);
  if (imgEl) {
    await imgEl.screenshot({ path: 'output/test_crop_kiki_tofu.jpg' });
    console.log('Successfully captured pure image element screenshot of KiKi tofu!');
  } else {
    console.log('imgEl not found');
  }
  await browser.close();
})();

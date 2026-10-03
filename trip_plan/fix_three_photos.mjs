import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 2 });

  const urls = [
    { target: 'kiki_tofu_real.jpg', url: 'https://commons.wikimedia.org/wiki/File:2010-10-31_diced_and_fried_egg_tofu_at_the_KIKI_restaurant_in_Taichung.jpg' },
    { target: 'ay_chung_real.jpg', url: 'https://commons.wikimedia.org/wiki/File:Ay-Chung_Flour-Rice_Noodle_20190113.jpg' },
    { target: 'kavalan_solist.jpg', url: 'https://commons.wikimedia.org/wiki/File:Kavalan_single_malt.jpg' }
  ];

  for (const item of urls) {
    console.log('Loading', item.url);
    await page.goto(item.url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => {
      const img = document.querySelector('#file img');
      return img && img.complete && img.naturalWidth > 100;
    }, { timeout: 20000 });
    await new Promise(r => setTimeout(r, 1000));
    const imgEl = await page.$('#file img');
    await imgEl.screenshot({ path: 'output/images/' + item.target });
    console.log('SUCCESS:', item.target, fs.statSync('output/images/' + item.target).size, 'bytes');
  }
  await browser.close();
})();

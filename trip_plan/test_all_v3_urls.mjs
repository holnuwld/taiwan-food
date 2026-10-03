import puppeteer from 'puppeteer-core';
import { RESTAURANTS, SOUVENIRS } from './v3_data.js';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const items = [];
  RESTAURANTS.forEach(r => {
    r.dishes.forEach(d => {
      items.push({ category: 'restaurant', group: r.name.split(' ')[0], name: d.name, url: d.originalUrl });
    });
  });
  SOUVENIRS.forEach(s => {
    items.push({ category: 'souvenir', group: '기념품', name: s.name, url: s.originalUrl });
  });

  console.log(`Testing ${items.length} URLs in Chrome...`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const res = await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = res ? res.status() : 'unknown';
      const title = await page.title();
      const hasImage = await page.evaluate(() => {
        const img = document.querySelector('#file img, .fullImageLink img, img.main-image, img');
        return img ? (img.naturalWidth > 50 || img.width > 50) : false;
      });
      console.log(`[${i + 1}/${items.length}] [${status}] ${item.group} - ${item.name} -> Title: ${title.slice(0, 35)} | ImageVisible: ${hasImage}`);
    } catch (e) {
      console.log(`[${i + 1}/${items.length}] [ERR] ${item.group} - ${item.name} -> ${e.message}`);
    }
  }

  await browser.close();
})();

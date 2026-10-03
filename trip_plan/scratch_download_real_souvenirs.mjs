import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SOUVENIR_SEARCHES = [
  { file: 'manhan_dacan_ramen.jpg', q: '滿漢大餐 蔥燒牛肉麵 碗裝' },
  { file: 'three_fifteen_tea.jpg', q: '3點1刻 原味奶茶 15入' },
  { file: 'dr_q_konjac_jelly.jpg', q: 'Dr.Q 蒟蒻果凍 荔枝 芒果' },
  { file: 'yuki_love_jelly.jpg', q: '雪之戀 芒果凍 盒裝' },
  { file: 'saint_peter_nougat.jpg', q: '聖比德 咖啡牛軋餅' },
  { file: 'yitiao_geng_patch.jpg', q: '金門一條根 精油貼布 7片' },
  { file: 'simple_kaffa_beans.jpg', q: 'Simple Kaffa 興波咖啡 咖啡豆' }
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const item of SOUVENIR_SEARCHES) {
    console.log('Searching for:', item.q);
    const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(item.q)}&FORM=HDRSC2`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2500));
    
    // Find first real image
    const imgUrl = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img.mimg, .iusc img'));
      for (const img of imgs) {
        const src = img.src || img.getAttribute('data-src');
        if (src && src.startsWith('http')) return src;
      }
      return null;
    });

    if (imgUrl) {
      console.log(`Found image for ${item.file}:`, imgUrl.slice(0, 80));
      const res = await fetch(imgUrl);
      const buffer = await res.arrayBuffer();
      const targetPath = path.join('c:\\cowork\\taiwan\\output\\images', item.file);
      fs.writeFileSync(targetPath, Buffer.from(buffer));
      console.log(`Saved ${item.file} (${Math.round(buffer.byteLength / 1024)} KB)`);
    } else {
      console.error('No image found for', item.q);
    }
  }

  await browser.close();
})();

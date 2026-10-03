import puppeteer from 'puppeteer-core';
import path from 'path';

const PLACES = [
  { name: 'evidence_1_liu_shan_dong.png', url: 'https://www.google.com/maps/search/%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5?hl=ko' },
  { name: 'evidence_2_ay_chung.png', url: 'https://www.google.com/maps/search/%E9%98%BF%E5%AE%97%E9%BA%B5%E7%B7%9A?hl=ko' },
  { name: 'evidence_3_kiki_restaurant.png', url: 'https://www.google.com/maps/search/KiKi%E9%A4%90%E5%BB%B3?hl=ko' },
  { name: 'evidence_4_fuhang_doujiang.png', url: 'https://www.google.com/maps/search/%E9%98%9C%E6%78%AD%E8%B1%86%E6%BC%BF?hl=ko' },
  { name: 'evidence_5_din_tai_fung.png', url: 'https://www.google.com/maps/search/%E9%BC%8E%E6%B3%B0%E8%B1%94+%E6%96%B0%E7%94%9F%E5%BA%97?hl=ko' },
  { name: 'evidence_6_simple_kaffa.png', url: 'https://www.google.com/maps/search/%E8%88%88%E6%B3%A2%E5%92%96%E5%95%A1+%E6%97%97%E8%89%A6%E5%BA%97?hl=ko' },
  { name: 'evidence_7_raohe_pepper_bun.png', url: 'https://www.google.com/maps/search/%E7%A6%8F%E5%B7%9E%E4%B8%96%E7%A5%96%E8%83%A1%E6%A4%92%E9%A4%85?hl=ko' },
  { name: 'evidence_8_jinfeng_luroufan.png', url: 'https://www.google.com/maps/search/%E9%87%91%E5%B3%B0%E9%AD%AF%E8%82%89%E9%A3%AF?hl=ko' },
  { name: 'evidence_hotel_gracery.png', url: 'https://www.google.com/maps/search/Hotel+Gracery+Taipei?hl=ko' },
  { name: 'evidence_hotel_roaders_plus.png', url: 'https://www.google.com/maps/search/Roaders+Plus+Hotel+Taipei?hl=ko' }
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });

  for (const place of PLACES) {
    console.log(`Capturing ${place.name}...`);
    try {
      await page.goto(place.url, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 4000));
      const targetPath = path.join('c:\\cowork\\taiwan\\output\\evidence', place.name);
      await page.screenshot({ path: targetPath, fullPage: false });
      console.log(`Saved ${place.name}`);
    } catch (e) {
      console.error(`Error capturing ${place.name}:`, e.message);
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
})();

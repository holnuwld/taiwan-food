import puppeteer from 'puppeteer-core';
import fs from 'fs';

const places = JSON.parse(fs.readFileSync('c:\\cowork\\taiwan\\food\\data\\places_coords.json', 'utf8'));

const targets = [
  { id: 6, query: '林東芳牛肉麵 八德路' },
  { id: 7, query: '金峰魯肉飯 羅斯福路' },
  { id: 9, query: '天天利美食坊 漢中街' },
  { id: 10, query: '品鱻生猛活海鮮 樂利路' },
  { id: 12, query: 'KiKi餐廳 信義' },
  { id: 14, query: '山海樓 手工台菜餐廳 仁愛路' }
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko']
  });
  const page = await browser.newPage();

  for (const t of targets) {
    const url = 'https://www.google.com/maps/search/' + encodeURIComponent(t.query) + '?hl=ko';
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // click first result if list
    await page.evaluate(() => {
      const f = document.querySelector('a.hfpxzc, div.hfpxzc');
      if (f) f.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    const currentUrl = page.url();
    const match = currentUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    let lat = null, lng = null;
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
    }
    console.log(`[#${t.id}] lat: ${lat}, lng: ${lng}`);

    const item = places.find(p => p.id === t.id);
    if (item) {
      item.lat = lat;
      item.lng = lng;
      item.mapUrl = currentUrl;
    }
  }

  await browser.close();
  fs.writeFileSync('c:\\cowork\\taiwan\\food\\data\\places_coords.json', JSON.stringify(places, null, 2));
  console.log('Finished updating remaining coords!');
})();

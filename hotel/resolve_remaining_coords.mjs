import puppeteer from 'puppeteer-core';
import fs from 'fs';

const coordsData = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/hotel_exact_coords.json', 'utf8'));

// Specific targeted queries for the 14 remaining hotels
const targetMap = {
  "Slow Town Hotel- Reel": "Slow Town Hotel Taipei",
  "Cattail Pocket Inn - Ximen Branch": "Cat Tail Pocket Inn Ximen Taipei",
  "Hope City Minsheng Hotel": "HopeCity MinSheng Hotel Taipei",
  "Guide Hotel Taipei Fuxing N.": "GUIDE HOTEL Taipei Fuxing N.",
  "Rich & Free Ez Inn - Taipei Arena": "Rich & Free Ez Inn Taipei Arena",
  "Royal Rose Hotel Shuangcheng Hall": "Rose Boutique Hotel Shuangcheng Hall Taipei",
  "Royal Inn Taipei Linsen - Huashan 1914 Creative Park": "Royal Inn Taipei Linsen",
  "Meworld Hotel - Taipei Main Station": "Water Meworld Hotel Taipei",
  "Bouti Waterfront Hotel": "Bouti Waterfront Hotel Taipei 松山",
  "New City Hotel": "New City Hotel Taipei 中山區",
  "Formosa101 Taipei Main Branch": "Formosa101 Taipei Main Branch 台北",
  "Taipei International Hotel": "Taipei International Hotel 台北國際飯店",
  "Fun Stay Inn Ximen": "Fun Stay Inn Ximen 台北",
  "Finders Hotel Fu Qian": "Finders Hotel Fu Qian 台北路徒行旅"
};

async function resolveRemaining() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const [key, q] of Object.entries(targetMap)) {
    console.log(`Resolving: ${key} -> ${q}`);
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
    try {
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 2500));

      let finalUrl = page.url();
      let match = finalUrl.match(/@([0-9.]+),([0-9.]+)/) || finalUrl.match(/!3d([0-9.]+)!4d([0-9.]+)/);

      if (!match) {
        // Click first item in search feed if multiple results
        const firstResult = await page.$('a[href*="/maps/place/"]');
        if (firstResult) {
          console.log('   Clicking first result in feed...');
          await firstResult.click();
          await new Promise(r => setTimeout(r, 3000));
          finalUrl = page.url();
          match = finalUrl.match(/@([0-9.]+),([0-9.]+)/) || finalUrl.match(/!3d([0-9.]+)!4d([0-9.]+)/);
        }
      }

      let lat = null, lng = null;
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }

      const info = await page.evaluate(() => {
        const titleEl = document.querySelector('h1') || document.querySelector('.DUwDvf');
        const addrBtn = document.querySelector('button[data-item-id="address"]');
        return {
          title: titleEl ? titleEl.innerText.trim() : '',
          address: addrBtn ? addrBtn.innerText.trim() : ''
        };
      });

      console.log(`   -> Lat: ${lat}, Lng: ${lng}, Place: ${info.title}, Addr: ${info.address}`);

      if (lat && lng) {
        coordsData[key] = {
          name: key,
          officialTitle: info.title || coordsData[key].officialTitle,
          address: info.address || coordsData[key].address,
          lat: lat,
          lng: lng,
          mapsUrl: finalUrl
        };
      }
    } catch (e) {
      console.error(`   -> Error: ${e.message}`);
    }
  }

  await browser.close();
  fs.writeFileSync('c:/cowork/taiwan/hotel/hotel_exact_coords.json', JSON.stringify(coordsData, null, 2), 'utf8');
  console.log('Updated hotel_exact_coords.json!');
}

resolveRemaining().catch(console.error);

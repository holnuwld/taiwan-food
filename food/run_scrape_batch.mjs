import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { RESTAURANTS, scrapeSinglePlace } from './scrape_restaurants_lib.mjs';

const OUTPUT_FILE = path.join('c:\\cowork\\taiwan\\food\\data', 'places_scraped.json');

(async () => {
  console.log('Starting Batch Scraper for 15 Taiwanese Restaurants...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--lang=ko-KR,ko',
      '--window-size=1400,900',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  let results = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      results = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      console.log(`Loaded ${results.length} previously scraped places.`);
    } catch (e) {
      results = [];
    }
  }

  for (const place of RESTAURANTS) {
    const already = results.find(r => r.id === place.id && r.verificationStatus === 'VERIFIED');
    if (already) {
      console.log(`Skipping [${place.id}] ${place.name} (Already verified).`);
      continue;
    }

    try {
      const data = await scrapeSinglePlace(page, place);
      const existingIdx = results.findIndex(r => r.id === place.id);
      if (existingIdx >= 0) {
        results[existingIdx] = data;
      } else {
        results.push(data);
      }
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf8');
      console.log(`[SAVED] Progress: ${results.length}/${RESTAURANTS.length} places.`);
    } catch (err) {
      console.error(`Error scraping ${place.name}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
  console.log('\n[COMPLETE] All 15 restaurants processed! Results saved to:', OUTPUT_FILE);
})();

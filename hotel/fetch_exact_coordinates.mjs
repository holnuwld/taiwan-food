import puppeteer from 'puppeteer-core';
import fs from 'fs';

const crawled51 = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/crawled_v2_exact_10k_15k.json', 'utf8'));
const target50 = crawled51.filter(h => h.name !== 'Cheers Loft').slice(0, 50);

async function main() {
  console.log(`Starting exact coordinate resolution for ${target50.length} hotels...`);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const results = {};

  for (let i = 0; i < target50.length; i++) {
    const hotel = target50[i];
    const query = `${hotel.name} Taipei`;
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

    console.log(`[${i + 1}/${target50.length}] Searching: ${query}`);
    try {
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 2500));

      let finalUrl = page.url();
      let match = finalUrl.match(/@([0-9.]+),([0-9.]+)/) || finalUrl.match(/!3d([0-9.]+)!4d([0-9.]+)/);

      let lat = null, lng = null;
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      } else {
        // Try extracting from page meta tags or scripts
        const coords = await page.evaluate(() => {
          const meta = document.querySelector('meta[content*="center="]') || document.querySelector('meta[itemprop="image"]');
          const url = window.location.href;
          const m = url.match(/@([0-9.]+),([0-9.]+)/);
          if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
          return null;
        });
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      // Extract official title and address from Google Maps panel
      const info = await page.evaluate(() => {
        const titleEl = document.querySelector('h1') || document.querySelector('.DUwDvf');
        const addrBtn = document.querySelector('button[data-item-id="address"]');
        const title = titleEl ? titleEl.innerText.trim() : '';
        const address = addrBtn ? addrBtn.innerText.trim() : '';
        return { title, address };
      });

      console.log(`   -> Lat: ${lat}, Lng: ${lng}, Place: ${info.title}`);

      results[hotel.name] = {
        name: hotel.name,
        officialTitle: info.title || hotel.name,
        address: info.address || hotel.district,
        lat: lat,
        lng: lng,
        mapsUrl: finalUrl
      };

    } catch (err) {
      console.error(`   -> Error fetching ${hotel.name}:`, err.message);
      results[hotel.name] = {
        name: hotel.name,
        officialTitle: hotel.name,
        address: hotel.district,
        lat: null,
        lng: null,
        mapsUrl: searchUrl
      };
    }

    // Save progress periodically
    fs.writeFileSync('c:/cowork/taiwan/hotel/hotel_exact_coords.json', JSON.stringify(results, null, 2), 'utf8');
  }

  await browser.close();
  console.log('All 50 hotels coordinate resolution finished!');
}

main().catch(console.error);

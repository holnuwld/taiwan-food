import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function crawlTop30() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--lang=ko-KR,ko,en-US,en',
      '--window-size=1400,1000',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  const url = 'https://search.emiratesskywardshotels.com/search?storefrontId=3&languageId=1&realLanguageId=1&currencyId=7&userId=35769784-b6ac-44eb-b26a-b5aa5099e0bf&pageTypeId=1&origin=AE&locale=en-us&currencyCode=USD&htmlLanguage=en-us&cultureInfoName=en-us&cid=1948185&checkIn=2026-11-11&checkOut=2026-11-14&rooms=1&adults=2&textToSearch=Taipei&whitelabelid=16&los=3&latitude=25.044801&longitude=121.536762&city=4951&loginLvl=0&correlationId=340ebb77-547c-4da7-b43c-a528573e580c&platformId=4&priceView=USD&stateCode=AZ&sort=agodaRecommended&loyaltySearchType=BURN';

  console.log('Navigating to search page...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));

  // Accept cookies
  await page.evaluate(() => {
    const btn = document.querySelector('#onetrust-accept-btn-handler') || Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('Accept'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check TRY AGAIN button
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText?.trim() === 'TRY AGAIN');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));

  // Scroll down repeatedly until we have at least 35 unique hotels
  console.log('Scrolling down to load hotels...');
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => window.scrollBy(0, 1500));
    await new Promise(r => setTimeout(r, 1200));
    const count = await page.evaluate(() => {
      const names = new Set();
      document.querySelectorAll('[data-selenium="hotel-name"]').forEach(el => {
        if (el.innerText?.trim()) names.add(el.innerText.trim());
      });
      return names.size;
    });
    console.log(`Scroll pass ${i + 1}: found ${count} unique hotels`);
    if (count >= 35) break;
  }

  // Extract structured info for unique hotels in order
  const hotelList = await page.evaluate(() => {
    const items = [];
    const seen = new Set();

    // Select the card elements
    const cards = document.querySelectorAll('[data-selenium="hotel-item"], [data-element-name="property-card"]');
    cards.forEach(card => {
      const nameEl = card.querySelector('[data-selenium="hotel-name"]');
      const name = nameEl?.innerText?.trim();
      if (!name || seen.has(name)) return;
      seen.add(name);

      const fullText = card.innerText || '';
      
      // Star rating
      let starRating = '';
      const starEl = card.querySelector('[aria-label*="star"], [title*="star"], [class*="Star"]');
      if (starEl) {
        starRating = starEl.getAttribute('aria-label') || starEl.getAttribute('title') || '';
      }
      if (!starRating && fullText.includes('stars out of 5')) {
        const m = fullText.match(/(\d(\.\d)?)\s*stars out of 5/i);
        if (m) starRating = m[1];
      }

      // Guest review rating & count
      let reviewScore = '';
      let reviewCount = '';
      const scoreMatch = fullText.match(/Average rating\s+[A-Za-z]+\s+([0-9\.]+)\s+out of 10\s+with\s+([0-9,]+)\s+reviews/i);
      if (scoreMatch) {
        reviewScore = scoreMatch[1];
        reviewCount = scoreMatch[2];
      } else {
        const altMatch = fullText.match(/([0-9]\.[0-9])\s+(Exceptional|Excellent|Very Good|Good)\s+([0-9,]+)\s+reviews/i);
        if (altMatch) {
          reviewScore = altMatch[1];
          reviewCount = altMatch[3];
        }
      }

      // District / Neighborhood
      let district = '';
      const distMatch = fullText.match(/([A-Za-z\s]+District|Ximending|Taipei Main Station)/i);
      if (distMatch) {
        district = distMatch[1].trim();
      }

      // Nearest Metro / Transportation
      let metro = '';
      const metroMatch = fullText.match(/([A-Za-z0-9–\s]+Metro Station is within [0-9\.]+\s*km)/i);
      if (metroMatch) {
        metro = metroMatch[1].trim();
      }

      // Miles
      let miles = '';
      let milesNote = '';
      const milesMatch = fullText.match(/([0-9,]+)\s*Skywards Miles/i);
      if (milesMatch) {
        miles = milesMatch[1];
      }
      if (fullText.includes('Per night')) {
        milesNote = 'Per night';
      } else if (fullText.includes('for 3 nights') || fullText.includes('total')) {
        milesNote = 'Total for 3 nights';
      }

      // Link
      const linkEl = card.querySelector('a[href*="/hotel/"]');
      const link = linkEl ? linkEl.getAttribute('href') : '';

      items.push({
        name,
        starRating,
        district,
        metro,
        reviewScore,
        reviewCount,
        miles,
        milesNote,
        link,
        rawTextSnippet: fullText.replace(/\n+/g, ' | ').slice(0, 300)
      });
    });

    return items;
  });

  console.log(`Extracted total ${hotelList.length} unique hotels.`);
  fs.writeFileSync('c:/cowork/taiwan/hotel/crawled_top30_raw.json', JSON.stringify(hotelList, null, 2), 'utf8');

  // Also take a screenshot for verification
  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/search_top30_evidence.png', fullPage: false });
  console.log('Saved screenshot to search_top30_evidence.png');

  await browser.close();
}

crawlTop30().catch(console.error);

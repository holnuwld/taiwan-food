import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function crawlTop50() {
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

  console.log('Navigating to Emirates search page...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));

  // Accept cookies
  await page.evaluate(() => {
    const btn = document.querySelector('#onetrust-accept-btn-handler') || Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('Accept'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click TRY AGAIN if visible
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText?.trim() === 'TRY AGAIN');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 6000));

  const allHotels = [];
  const seen = new Set();

  for (let pageNum = 1; pageNum <= 4; pageNum++) {
    console.log(`--- Processing Page ${pageNum} ---`);

    // Scroll down gradually on current page
    for (let s = 0; s < 12; s++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await new Promise(r => setTimeout(r, 800));
    }
    await new Promise(r => setTimeout(r, 2000));

    // Extract hotel cards on this page
    const pageHotels = await page.evaluate(() => {
      const list = [];
      const cards = document.querySelectorAll('[data-selenium="hotel-item"], [data-element-name="property-card"]');
      
      cards.forEach(card => {
        const nameEl = card.querySelector('[data-selenium="hotel-name"]');
        const name = nameEl?.innerText?.trim();
        if (!name) return;

        const fullText = card.innerText || '';

        // Star rating
        let starRating = '';
        if (fullText.includes('stars out of 5')) {
          const m = fullText.match(/(\d(\.\d)?)\s*stars out of 5/i);
          if (m) starRating = m[1];
        }

        // Score & review count
        let reviewScore = '';
        let reviewCount = '';
        const scoreMatch = fullText.match(/Average rating\s+[A-Za-z\s]+\s+([0-9\.]+)\s+out of 10\s+with\s+([0-9,]+)\s+reviews/i);
        if (scoreMatch) {
          reviewScore = scoreMatch[1];
          reviewCount = scoreMatch[2];
        } else {
          const altMatch = fullText.match(/([0-9]\.[0-9])\s+(Exceptional|Excellent|Very Good|Good|Above average)\s+([0-9,]+)\s+reviews/i);
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

        // Bed type
        let bedType = '';
        if (fullText.includes('1 double bed or 2 single beds') || fullText.includes('1 double or 2 single beds')) {
          bedType = '트윈/더블 선택가능 (1 Double / 2 Singles)';
        } else if (fullText.includes('2 single beds') || fullText.includes('Twin')) {
          bedType = '트윈베드 (2 Single/Twin)';
        } else if (fullText.includes('1 double bed') || fullText.includes('1 king bed') || fullText.includes('1 queen bed') || fullText.includes('Double')) {
          bedType = '더블베드 (Double/King)';
        } else {
          bedType = '더블/트윈 (객실별 상이)';
        }

        // Link
        const linkEl = card.querySelector('a[href*="/hotel/"]');
        const link = linkEl ? linkEl.getAttribute('href') : '';

        list.push({
          name,
          starRating,
          district,
          metro,
          reviewScore,
          reviewCount,
          miles,
          milesNote,
          bedType,
          link,
          rawTextSnippet: fullText.replace(/\s+/g, ' ').slice(0, 300)
        });
      });
      return list;
    });

    console.log(`Page ${pageNum} yielded ${pageHotels.length} cards.`);
    for (const h of pageHotels) {
      if (!seen.has(h.name)) {
        seen.add(h.name);
        allHotels.push(h);
      }
    }
    console.log(`Total unique hotels collected so far: ${allHotels.length}`);

    if (allHotels.length >= 52) {
      console.log('Reached 50+ target hotel count!');
      break;
    }

    // Click next page
    const hasNext = await page.evaluate(() => {
      const btn = document.querySelector('[data-selenium="pagination-next-btn"], button[aria-label="Next Page"]');
      if (btn && !btn.hasAttribute('disabled') && !btn.className.includes('disabled')) {
        btn.click();
        return true;
      }
      return false;
    });

    console.log(`Next page button clicked: ${hasNext}`);
    if (!hasNext) break;
    await new Promise(r => setTimeout(r, 6000));
  }

  console.log(`Final total unique hotels collected: ${allHotels.length}`);
  fs.writeFileSync('c:/cowork/taiwan/hotel/crawled_50_hotels_raw.json', JSON.stringify(allHotels.slice(0, 50), null, 2), 'utf8');

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/page_50_evidence.png', fullPage: false });
  await browser.close();
}

crawlTop50().catch(console.error);

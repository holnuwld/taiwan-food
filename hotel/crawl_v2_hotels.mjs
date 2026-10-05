import puppeteer from 'puppeteer-core';
import fs from 'fs';

const targetUrl = 'https://search.emiratesskywardshotels.com/search?storefrontId=3&languageId=1&realLanguageId=1&currencyId=7&userId=35769784-b6ac-44eb-b26a-b5aa5099e0bf&pageTypeId=1&origin=AE&locale=en-us&currencyCode=USD&htmlLanguage=en-us&cultureInfoName=en-us&cid=1948185&checkIn=2026-11-11&checkOut=2026-11-14&rooms=1&adults=2&textToSearch=Taipei&whitelabelid=16&los=3&latitude=25.044801&longitude=121.536762&city=4951&loginLvl=0&correlationId=340ebb77-547c-4da7-b43c-a528573e580c&platformId=4&priceView=USD&stateCode=AZ&hotelArea=31210,36775,36774,36776,36771&hotelAccom=34,111&sort=priceLowToHigh&loyaltySearchType=BURN';

async function crawlTargetHotels() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');

  console.log('Navigating to Emirates search page with filters...');
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise(r => setTimeout(r, 8000));

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/search_v2_evidence.png' });
  console.log('Saved search_v2_evidence.png');

  let allHotels = [];
  let pageNum = 1;

  while (pageNum <= 10) {
    console.log(`\n--- Scraping Page ${pageNum} ---`);
    
    // Auto scroll down to load cards
    await page.evaluate(async () => {
      for (let i = 0; i < 8; i++) {
        window.scrollBy(0, 800);
        await new Promise(r => setTimeout(r, 500));
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    const pageHotels = await page.evaluate(() => {
      const results = [];
      const cards = document.querySelectorAll('div[data-testid="property-card"], div.hotel-card, div.search-result-item, div.property-card, div[data-selenium="hotel-item"], [data-element-name="property-card"]');
      
      // If specific cards not found, query headings and parents
      const hotelTitles = Array.from(document.querySelectorAll('h3, h2, div[data-testid="title"], a[data-testid="title-link"], a.hotel-name'));

      hotelTitles.forEach(t => {
        const text = t.innerText?.trim();
        if (!text || text.length < 3 || text.includes('Filter') || text.includes('Sort')) return;
        
        // Find ancestor container
        let parent = t.parentElement;
        let pText = '';
        for (let k = 0; k < 6; k++) {
          if (parent) {
            pText = parent.innerText || '';
            if (pText.includes('miles') || pText.includes('Miles') || pText.includes('Per night') || pText.includes('per night')) break;
            parent = parent.parentElement;
          }
        }

        if (pText.includes('miles') || pText.includes('Miles')) {
          // Extract miles
          const mileMatch = pText.match(/([\d,]+)\s*(?:Miles|miles)/i);
          const ratingMatch = pText.match(/(\d\.\d)\s*(?:\/|out of|별|\n)/);
          const districtMatch = pText.match(/(Ximending|Zhongshan|Daan|Xinyi|Zhongzheng|Songshan|Banqiao|Shilin|Beitou|Wanhua|Datong)[\w\s]*/i);

          results.push({
            name: text,
            milesStr: mileMatch ? mileMatch[1] : null,
            rawText: pText.slice(0, 300)
          });
        }
      });

      return results;
    });

    console.log(`Page ${pageNum} extracted ${pageHotels.length} raw cards`);
    pageHotels.forEach(h => {
      if (!allHotels.find(x => x.name === h.name)) {
        allHotels.push(h);
      }
    });

    // Check pagination or next button
    const hasNext = await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
        el.getAttribute('aria-label')?.includes('Next') || 
        el.innerText?.trim() === 'Next' || 
        el.innerText?.trim() === '>' || 
        el.innerText?.trim() === '다음'
      );
      if (nextBtn && !nextBtn.hasAttribute('disabled')) {
        nextBtn.click();
        return true;
      }
      return false;
    });

    if (!hasNext) {
      console.log('No next page button found or disabled.');
      break;
    }

    pageNum++;
    await new Promise(r => setTimeout(r, 6000));
  }

  console.log(`\nTotal unique hotels scraped: ${allHotels.length}`);
  fs.writeFileSync('c:/cowork/taiwan/hotel/crawled_v2_raw.json', JSON.stringify(allHotels, null, 2), 'utf8');

  // Also print all scraped hotels with miles
  allHotels.forEach((h, i) => {
    console.log(`${i + 1}. ${h.name} : ${h.milesStr} miles`);
  });

  await browser.close();
}

crawlTargetHotels().catch(console.error);

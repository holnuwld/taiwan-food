import puppeteer from 'puppeteer-core';
import fs from 'fs';

const targetUrl = 'https://search.emiratesskywardshotels.com/search?storefrontId=3&languageId=1&realLanguageId=1&currencyId=7&userId=35769784-b6ac-44eb-b26a-b5aa5099e0bf&pageTypeId=1&origin=AE&locale=en-us&currencyCode=USD&htmlLanguage=en-us&cultureInfoName=en-us&cid=1948185&checkIn=2026-11-11&checkOut=2026-11-14&rooms=1&adults=2&textToSearch=Taipei&whitelabelid=16&los=3&latitude=25.044801&longitude=121.536762&city=4951&loginLvl=0&correlationId=340ebb77-547c-4da7-b43c-a528573e580c&platformId=4&priceView=USD&stateCode=AZ&hotelArea=31210,36775,36774,36776,36771&hotelAccom=34,111&sort=priceLowToHigh&loyaltySearchType=BURN';

async function extractHotels() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1100 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');

  console.log('Navigating to Emirates search page...');
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise(r => setTimeout(r, 6000));

  // Accept cookies if present
  try {
    await page.evaluate(() => {
      const btn = document.querySelector('#onetrust-accept-btn-handler') || 
                  Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('Accept All'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
  } catch (e) {}

  let allHotels = [];
  let pageNum = 1;

  while (pageNum <= 15) {
    console.log(`\n=== Scanning Page ${pageNum} ===`);
    
    // Scroll down to load all items
    await page.evaluate(async () => {
      for (let i = 0; i < 10; i++) {
        window.scrollBy(0, 800);
        await new Promise(r => setTimeout(r, 400));
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    // Extract hotel cards
    const cards = await page.evaluate(() => {
      const items = [];
      // Look for hotel card containers
      // Cards generally contain image, title, location, score, miles
      const elements = Array.from(document.querySelectorAll('div, section, article')).filter(el => {
        const text = el.innerText || '';
        return text.includes('Skywards Miles') && 
               text.includes('Per night') && 
               (el.querySelector('h3') || el.querySelector('h2') || el.querySelector('a'));
      });

      // Filter to innermost cards
      const innermost = elements.filter(el => {
        const childMatch = el.querySelectorAll('*');
        let count = 0;
        childMatch.forEach(c => {
          if (c.innerText?.includes('Per night') && c.innerText?.includes('Skywards Miles')) count++;
        });
        return count <= 1; // innermost container
      });

      innermost.forEach(card => {
        const text = card.innerText;
        const nameEl = card.querySelector('h3, h2, a[data-testid="title-link"]');
        const name = nameEl ? nameEl.innerText.trim() : text.split('\n')[0].trim();
        
        const milesMatch = text.match(/([\d,]+)\s*Skywards Miles/i);
        const miles = milesMatch ? parseInt(milesMatch[1].replace(/,/g, ''), 10) : null;

        const scoreMatch = text.match(/(\d+\.\d+)\s*(?:Very good|Exceptional|Fabulous|Good|Superb|Excellent|Review score)?/i);
        const reviewsCountMatch = text.match(/([\d,]+)\s*reviews/i);
        
        const districtMatch = text.match(/(Zhongshan District|Ximending|Taipei Main Station|Daan District|Xinyi District|Songshan District|Banqiao District|Shilin District|Beitou District|Datong District|Wanhua District)[\w\s,]*/i);

        const starsMatch = text.match(/(\d)\s*stars? out of 5/i);

        if (name && miles && !items.find(x => x.name === name)) {
          items.push({
            name,
            miles,
            score: scoreMatch ? scoreMatch[1] : null,
            reviewsCount: reviewsCountMatch ? reviewsCountMatch[1] : null,
            district: districtMatch ? districtMatch[0].trim() : '타이베이',
            rawSnippet: text.slice(0, 200)
          });
        }
      });

      return items;
    });

    console.log(`Page ${pageNum} found ${cards.length} cards`);
    cards.forEach(c => {
      if (!allHotels.find(x => x.name === c.name)) {
        allHotels.push(c);
        console.log(`  [${c.miles} miles] ${c.name} (${c.district})`);
      }
    });

    // Check if we reached past 15,000 miles
    const maxMilesOnPage = Math.max(...cards.map(c => c.miles || 0), 0);
    if (maxMilesOnPage > 16000) {
      console.log(`Reached past 15,000 miles (max on page: ${maxMilesOnPage}). Stopping pagination.`);
      break;
    }

    // Go to next page
    const hasNext = await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
        el.getAttribute('aria-label')?.includes('Next') || 
        el.innerText?.trim() === 'Next' || 
        el.innerText?.trim() === '>' || 
        el.innerText?.trim() === '다음'
      );
      if (nextBtn && !nextBtn.hasAttribute('disabled') && !nextBtn.classList.contains('disabled')) {
        nextBtn.click();
        return true;
      }
      return false;
    });

    if (!hasNext) {
      console.log('No next page button found.');
      break;
    }

    pageNum++;
    await new Promise(r => setTimeout(r, 6000));
  }

  console.log(`\n========================================`);
  console.log(`Total hotels scraped: ${allHotels.length}`);
  
  // Filter 10,000 ~ 15,000 miles
  const targetHotels = allHotels.filter(h => h.miles >= 10000 && h.miles <= 15000);
  console.log(`Hotels in 10,000 ~ 15,000 miles range: ${targetHotels.length}`);

  fs.writeFileSync('c:/cowork/taiwan/hotel/crawled_v2_all.json', JSON.stringify(allHotels, null, 2), 'utf8');
  fs.writeFileSync('c:/cowork/taiwan/hotel/crawled_v2_10k_15k.json', JSON.stringify(targetHotels, null, 2), 'utf8');

  await browser.close();
}

extractHotels().catch(console.error);

import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function crawlHotelList() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const url = 'https://search.emiratesskywardshotels.com/search?storefrontId=3&languageId=1&realLanguageId=1&currencyId=7&userId=35769784-b6ac-44eb-b26a-b5aa5099e0bf&pageTypeId=1&origin=AE&locale=en-us&currencyCode=USD&htmlLanguage=en-us&cultureInfoName=en-us&cid=1948185&checkIn=2026-11-11&checkOut=2026-11-14&rooms=1&adults=2&textToSearch=Taipei&whitelabelid=16&los=3&latitude=25.044801&longitude=121.536762&city=4951&loginLvl=0&correlationId=340ebb77-547c-4da7-b43c-a528573e580c&platformId=4&priceView=USD&stateCode=AZ&sort=agodaRecommended&loyaltySearchType=BURN';

  console.log('Navigating to Emirates search list...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 6000));

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/hotel_list_screenshot.png' });

  const listData = await page.evaluate(() => {
    const hotels = [];
    // Agoda / White label property cards
    const cards = document.querySelectorAll('[data-selenium="hotel-item"], .PropertyCard, [data-element-name="property-card"], ol li');
    
    // Also parse by general selectors
    cards.forEach(card => {
      const nameEl = card.querySelector('[data-selenium="hotel-name"], h3, h4, .PropertyCard__HotelName');
      const name = nameEl?.innerText?.trim();
      const priceEl = card.querySelector('[data-selenium="display-price"], .PropertyCard__Price, [class*="Price"], [class*="miles"], [class*="Miles"]');
      const milesText = card.innerText;
      
      if (name && (milesText.includes('Miles') || milesText.includes('Skywards'))) {
        hotels.push({
          name,
          cardSnippet: milesText.slice(0, 300)
        });
      }
    });

    return {
      title: document.title,
      hotelsCount: hotels.length,
      sampleText: document.body.innerText.slice(0, 3000),
      hotels: hotels.slice(0, 20)
    };
  });

  fs.writeFileSync('c:/cowork/taiwan/hotel/hotel_list_crawled.json', JSON.stringify(listData, null, 2), 'utf8');
  console.log('Crawled list count:', listData.hotelsCount);
  await browser.close();
}

crawlHotelList().catch(console.error);

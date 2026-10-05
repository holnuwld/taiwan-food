import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function fetchSearchPage() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--lang=ko-KR,ko,en-US,en',
      '--window-size=1400,900',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const url = 'https://search.emiratesskywardshotels.com/search?storefrontId=3&languageId=1&realLanguageId=1&currencyId=7&userId=35769784-b6ac-44eb-b26a-b5aa5099e0bf&pageTypeId=1&origin=AE&locale=en-us&currencyCode=USD&htmlLanguage=en-us&cultureInfoName=en-us&cid=1948185&checkIn=2026-11-11&checkOut=2026-11-14&rooms=1&adults=2&textToSearch=Taipei&whitelabelid=16&los=3&latitude=25.044801&longitude=121.536762&city=4951&loginLvl=0&correlationId=340ebb77-547c-4da7-b43c-a528573e580c&platformId=4&priceView=USD&stateCode=AZ&sort=agodaRecommended&loyaltySearchType=BURN';

  console.log('Loading Emirates search URL...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));

  // Accept cookies if banner
  await page.evaluate(() => {
    const btn = document.querySelector('#onetrust-accept-btn-handler') || Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('Accept'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check if "TRY AGAIN" button exists and click it
  const clickedTryAgain = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText?.trim() === 'TRY AGAIN');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked TRY AGAIN:', clickedTryAgain);
  if (clickedTryAgain) {
    await new Promise(r => setTimeout(r, 8000));
  }

  // Scroll down multiple times to trigger lazy-loading of hotel cards
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 1500));
  }

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/search_list_page.png' });

  // Extract hotel list
  const data = await page.evaluate(() => {
    const list = [];
    // Agoda / White label property cards
    const propertyContainers = document.querySelectorAll('[data-selenium="hotel-item"], [data-element-name="property-card"], ol li[data-selenium="hotel-item"], [class*="PropertyCard"]');
    
    // Also parse generic article / card elements
    const elements = propertyContainers.length > 0 ? propertyContainers : document.querySelectorAll('ol > li, div.PropertyCardItem, div[class*="hotel-card"]');

    elements.forEach(el => {
      const name = el.querySelector('[data-selenium="hotel-name"], [class*="hotel-name"], h3, h4')?.innerText?.trim();
      const text = el.innerText?.trim();
      const link = el.querySelector('a')?.getAttribute('href');
      if (name && text) {
        list.push({ name, text: text.slice(0, 500), link });
      }
    });

    // Check raw page text for hotel names if list empty
    return {
      title: document.title,
      elementsCount: elements.length,
      extractedCount: list.length,
      bodyTextSnippet: document.body.innerText.slice(0, 3000),
      list: list.slice(0, 20)
    };
  });

  fs.writeFileSync('c:/cowork/taiwan/hotel/search_list_result.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('Result extracted count:', data.extractedCount);
  await browser.close();
}

fetchSearchPage().catch(console.error);

import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function searchTaipei() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Navigating to Emirates Skywards Hotels Home...');
  await page.goto('https://search.emiratesskywardshotels.com/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));

  // Accept cookies if banner exists
  await page.evaluate(() => {
    const btn = document.querySelector('#onetrust-accept-btn-handler') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Accept'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click Spend Miles tab if available
  await page.evaluate(() => {
    const spendTab = Array.from(document.querySelectorAll('button, div, a')).find(el => el.innerText && el.innerText.includes('Spend Skywards Miles'));
    if (spendTab) spendTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Type destination
  console.log('Typing Taipei...');
  const inputSelector = 'input[data-selenium="textInput"], input[type="text"], input[placeholder*="destination"], input[placeholder*="city"]';
  await page.waitForSelector(inputSelector);
  await page.click(inputSelector);
  await page.type(inputSelector, 'Taipei');
  await new Promise(r => setTimeout(r, 2500));

  // Click first autocomplete suggestion
  await page.evaluate(() => {
    const suggestions = document.querySelectorAll('li, div[data-selenium="autosuggest-item"], .Suggestion__item');
    for (const s of suggestions) {
      if (s.innerText && s.innerText.includes('Taipei')) {
        s.click();
        return;
      }
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click search button
  await page.evaluate(() => {
    const searchBtn = document.querySelector('button[data-selenium="searchButton"], button.SearchBox__searchButton') || Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('SEARCH'));
    if (searchBtn) searchBtn.click();
  });

  console.log('Waiting for search results...');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 6000));

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/taipei_search_results.png' });

  // Extract hotel listings
  const results = await page.evaluate(() => {
    const list = [];
    const cards = document.querySelectorAll('[data-selenium="hotel-item"], [data-element-name="property-card"], ol li');
    cards.forEach(card => {
      const name = card.querySelector('[data-selenium="hotel-name"], h3, h4')?.innerText?.trim();
      const text = card.innerText;
      if (name) {
        list.push({ name, text: text.slice(0, 400) });
      }
    });
    return {
      title: document.title,
      url: window.location.href,
      cardsCount: cards.length,
      extractedCount: list.length,
      list: list.slice(0, 15)
    };
  });

  fs.writeFileSync('c:/cowork/taiwan/hotel/taipei_search_results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Saved results:', results.extractedCount);

  await browser.close();
}

searchTaipei().catch(console.error);

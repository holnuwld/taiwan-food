import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,1000']
  });
  const page = await browser.newPage();
  const url = 'https://search.emiratesskywardshotels.com/search?storefrontId=3&languageId=1&realLanguageId=1&currencyId=7&userId=35769784-b6ac-44eb-b26a-b5aa5099e0bf&pageTypeId=1&origin=AE&locale=en-us&currencyCode=USD&htmlLanguage=en-us&cultureInfoName=en-us&cid=1948185&checkIn=2026-11-11&checkOut=2026-11-14&rooms=1&adults=2&textToSearch=Taipei&whitelabelid=16&los=3&latitude=25.044801&longitude=121.536762&city=4951&loginLvl=0&correlationId=340ebb77-547c-4da7-b43c-a528573e580c&platformId=4&priceView=USD&stateCode=AZ&sort=agodaRecommended&loyaltySearchType=BURN';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));
  
  // Accept cookies
  await page.evaluate(() => {
    const btn = document.querySelector('#onetrust-accept-btn-handler') || Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('Accept'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll down smoothly
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 1000));
  }

  // Inspect pagination, buttons, footer, and network or container
  const info = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('button, a, div[role="button"], [data-selenium*="page"], [data-selenium*="pagination"], [data-selenium*="next"]').forEach(el => {
      const text = el.innerText?.trim();
      const aria = el.getAttribute('aria-label');
      const sel = el.getAttribute('data-selenium');
      if (text || aria || sel) {
        items.push({ text: text ? text.slice(0, 50) : '', aria, sel, tag: el.tagName, className: el.className });
      }
    });

    // Also check how many PropertyCards exist in the DOM
    const cardCount = document.querySelectorAll('[data-selenium="hotel-item"], [data-element-name="property-card"]').length;
    return {
      cardCount,
      bodyHeight: document.body.scrollHeight,
      scrollY: window.scrollY,
      items: items.filter(x => x.text?.includes('Next') || x.text?.includes('Page') || x.text?.match(/^[0-9]+$/) || x.sel?.includes('page') || x.sel?.includes('next') || x.aria?.includes('page') || x.aria?.includes('next'))
    };
  });

  console.log('Inspection result:', JSON.stringify(info, null, 2));
  await browser.close();
}

test().catch(console.error);

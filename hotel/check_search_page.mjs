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

  // Check TRY AGAIN
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText?.trim() === 'TRY AGAIN');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));

  const pageInfo = await page.evaluate(() => {
    const pagination = document.querySelector('.pagination-panel, [data-selenium="pagination-panel"], .pagination2__text')?.innerText;
    const nextBtn = document.querySelector('[data-selenium="pagination-next-btn"], button[aria-label="Next Page"], a[aria-label="Next"]');
    const hotelNames = Array.from(document.querySelectorAll('[data-selenium="hotel-name"]')).map(el => el.innerText.trim());
    const paginationButtons = Array.from(document.querySelectorAll('nav button, nav a, .pagination-panel button, .pagination-panel a, [class*="pagination"] button, [class*="pagination"] a')).map(b => ({
      text: b.innerText?.trim(),
      aria: b.getAttribute('aria-label'),
      selenium: b.getAttribute('data-selenium'),
      disabled: b.hasAttribute('disabled') || b.className.includes('disabled')
    }));

    return {
      pagination,
      hasNextBtn: !!nextBtn,
      nextBtnText: nextBtn?.innerText,
      nextBtnDisabled: nextBtn?.hasAttribute('disabled'),
      hotelCount: hotelNames.length,
      hotelNames,
      paginationButtons
    };
  });

  console.log('Page info:', JSON.stringify(pageInfo, null, 2));
  await browser.close();
}

test().catch(console.error);

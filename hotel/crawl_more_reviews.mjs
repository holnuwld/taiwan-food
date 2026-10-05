import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function crawlMoreReviews() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--lang=ko-KR,ko',
      '--window-size=1400,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const query = 'Hotel Metropolitan Premier Taipei';
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=ko`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));

  await page.evaluate(() => {
    const card = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // Find exact tabs
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
    for (const t of tabs) {
      if (t.innerText && (t.innerText.trim() === '리뷰' || t.innerText.startsWith('리뷰'))) {
        t.click();
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 3500));

  // Let's get header info
  const headerInfo = await page.evaluate(() => {
    const allSpans = Array.from(document.querySelectorAll('span, div')).map(e => e.innerText?.trim()).filter(Boolean);
    // Find rating and reviews
    let rating = '';
    let reviewsCount = '';
    for (let i = 0; i < allSpans.length; i++) {
      if (allSpans[i] === '4.5' || allSpans[i] === '4.6') {
        rating = allSpans[i];
      }
      if (allSpans[i].includes('리뷰') && allSpans[i].match(/\d+/)) {
        reviewsCount = allSpans[i];
      }
    }
    return { rating, reviewsCount, title: document.title };
  });
  console.log('Header Info:', headerInfo);

  // Scroll the review panel 15 times
  for (let i = 0; i < 15; i++) {
    await page.evaluate(() => {
      // Find review container
      const container = document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf');
      if (container) {
        container.scrollBy(0, 1000);
      }
    });
    await new Promise(r => setTimeout(r, 1000));
  }

  // Click all '자세히' / '더보기' buttons
  await page.evaluate(() => {
    document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"], button[aria-label*="자세히"]').forEach(b => b.click());
  });
  await new Promise(r => setTimeout(r, 1500));

  // Extract all review items
  const reviews = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div.jftiEf'));
    return items.map(el => {
      const author = el.querySelector('.d4r55')?.innerText?.trim() || '익명';
      const ratingEl = el.querySelector('.kvMYJc');
      const star = ratingEl ? (ratingEl.getAttribute('aria-label') || '') : '';
      const date = el.querySelector('.rsqaWe')?.innerText?.trim() || '';
      const bodyEl = el.querySelector('.wiI7pd');
      const text = bodyEl ? bodyEl.innerText.trim() : '';
      return { author, star, date, text };
    }).filter(r => r.text && r.text.length > 5);
  });

  console.log(`Found ${reviews.length} reviews`);
  fs.writeFileSync('c:/cowork/taiwan/hotel/crawled_reviews_batch.json', JSON.stringify({ headerInfo, reviews }, null, 2), 'utf8');

  await browser.close();
}

crawlMoreReviews().catch(console.error);

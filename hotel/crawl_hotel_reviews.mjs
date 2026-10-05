import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function crawlHotelGoogleMaps() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--lang=ko-KR,ko',
      '--window-size=1400,900',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const query = 'Hotel Metropolitan Premier Taipei';
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=ko`;

  console.log(`Navigating to Google Maps for ${query}...`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));

  // If search list, click first card
  await page.evaluate(() => {
    const card = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // Extract Rating and Review Count
  const basicInfo = await page.evaluate(() => {
    // Title
    const titleEl = document.querySelector('h1.DUwDvf, .fontHeadlineLarge');
    const title = titleEl ? titleEl.innerText.trim() : '';

    // Rating
    const ratingEl = document.querySelector('div.F7nice span[aria-hidden="true"], .fontDisplayLarge');
    const rating = ratingEl ? ratingEl.innerText.trim() : '';

    // Review count
    const countEl = document.querySelector('div.F7nice span:last-child, span[aria-label*="리뷰"]');
    const reviewCount = countEl ? countEl.innerText.replace(/[()]/g, '').trim() : '';

    // Address
    const addrEl = document.querySelector('button[data-item-id="address"] div.fontBodyMedium, [data-tooltip="주소 복사"]');
    const address = addrEl ? addrEl.innerText.trim() : '';

    return { title, rating, reviewCount, address };
  });

  console.log('Basic Info:', basicInfo);

  // Click '리뷰' tab
  const foundReviewTab = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
    const rev = tabs.find(t => {
      const text = t.innerText?.trim() || '';
      const aria = t.getAttribute('aria-label') || '';
      return (text === '리뷰' || text.startsWith('리뷰') || aria.includes('리뷰')) && !text.includes('작성');
    });
    if (rev) {
      rev.click();
      return true;
    }
    return false;
  });
  console.log('Found review tab:', foundReviewTab);
  await new Promise(r => setTimeout(r, 4000));

  // Helper function to extract currently visible reviews
  async function extractVisibleReviews() {
    // Expand '자세히' / '더보기' buttons
    await page.evaluate(() => {
      document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"], button[aria-label*="자세히"]').forEach(b => b.click());
    });
    await new Promise(r => setTimeout(r, 1000));

    return await page.evaluate(() => {
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
  }

  // Scroll review panel a bit
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const panel = document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf') || document.querySelector('div.m6QErb[aria-label*="리뷰"]') || window;
      if (panel.scrollBy) panel.scrollBy(0, 1000);
      else window.scrollBy(0, 1000);
    });
    await new Promise(r => setTimeout(r, 1500));
  }

  const normalReviews = await extractVisibleReviews();
  console.log('Fetched normal reviews count:', normalReviews.length);

  // Now sort by '낮은 평점순' to get negative reviews
  console.log('Attempting to sort by lowest rating...');
  const clickedSort = await page.evaluate(() => {
    const sortBtn = document.querySelector('button[data-value="정렬"], button[aria-label*="정렬"]');
    if (sortBtn) {
      sortBtn.click();
      return true;
    }
    return false;
  });

  let negativeReviews = [];
  if (clickedSort) {
    await new Promise(r => setTimeout(r, 1500));
    await page.evaluate(() => {
      const menuItems = Array.from(document.querySelectorAll('div[role="menuitemradio"], div[role="menuitem"]'));
      const lowest = menuItems.find(m => m.innerText.includes('낮은') || m.innerText.includes('평점 낮은'));
      if (lowest) lowest.click();
    });
    await new Promise(r => setTimeout(r, 3500));

    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        const panel = document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf') || document.querySelector('div.m6QErb[aria-label*="리뷰"]') || window;
        if (panel.scrollBy) panel.scrollBy(0, 1000);
      });
      await new Promise(r => setTimeout(r, 1500));
    }
    negativeReviews = await extractVisibleReviews();
    console.log('Fetched lowest-rating reviews count:', negativeReviews.length);
  }

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/google_maps_evidence.png' });

  const finalData = {
    basicInfo,
    normalReviews: normalReviews.slice(0, 15),
    negativeReviews: negativeReviews.slice(0, 15)
  };

  fs.writeFileSync('c:/cowork/taiwan/hotel/maps_reviews.json', JSON.stringify(finalData, null, 2), 'utf8');
  console.log('Saved maps_reviews.json');

  await browser.close();
}

crawlHotelGoogleMaps().catch(console.error);

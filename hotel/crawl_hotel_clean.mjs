import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function crawlClean() {
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

  // 1. Click place card
  await page.evaluate(() => {
    const card = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // 2. Close any login modal if present
  async function closeModals() {
    return await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const closeBtn = btns.find(b => b.innerText?.trim() === '닫기' || b.getAttribute('aria-label') === '닫기');
      if (closeBtn) {
        closeBtn.click();
        return true;
      }
      return false;
    });
  }
  await closeModals();
  await new Promise(r => setTimeout(r, 1000));

  // 3. Click '리뷰' tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], button'));
    const revTab = tabs.find(t => t.innerText?.trim() === '리뷰' || t.innerText?.startsWith('리뷰'));
    if (revTab) revTab.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  await closeModals();

  // 4. Extract total rating and review count from review summary section
  const summaryInfo = await page.evaluate(() => {
    // Look for elements with rating and total count
    const bodyText = document.body.innerText;
    // Look for count near review tab
    const matches = bodyText.match(/(\d+\.\d)\s*★[\s\S]{0,100}?([0-9,]+)\s*(개|건|개의 리뷰)/)
      || bodyText.match(/리뷰\s*([0-9,]+)\s*개/);
    
    // Check specific review summary classes
    const scoreEl = document.querySelector('div.fontDisplayLarge, .F7nice span[aria-hidden="true"]');
    const totalCountEl = document.querySelector('div.fontBodySmall, .F7nice span:last-child');

    return {
      scoreText: scoreEl?.innerText?.trim(),
      totalCountText: totalCountEl?.innerText?.trim(),
      matches: matches ? matches[0] : null
    };
  });
  console.log('Summary info:', summaryInfo);

  // 5. Expand read-more buttons and scrape reviews
  async function scrapeCurrentReviews() {
    await page.evaluate(() => {
      document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"], button[aria-label*="자세히"]').forEach(b => b.click());
    });
    await new Promise(r => setTimeout(r, 800));

    return await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div.jftiEf'));
      return cards.map(c => {
        const author = c.querySelector('.d4r55')?.innerText?.trim() || '익명';
        const starEl = c.querySelector('span.kvMYJc');
        const starLabel = starEl?.getAttribute('aria-label') || '';
        const date = c.querySelector('.rsqaWe')?.innerText?.trim() || '';
        const text = c.querySelector('.wiI7pd')?.innerText?.trim() || '';
        
        let stars = 5;
        if (starLabel.includes('1개') || starLabel.includes('1/5')) stars = 1;
        else if (starLabel.includes('2개') || starLabel.includes('2/5')) stars = 2;
        else if (starLabel.includes('3개') || starLabel.includes('3/5')) stars = 3;
        else if (starLabel.includes('4개') || starLabel.includes('4/5')) stars = 4;
        else if (starLabel.includes('5개') || starLabel.includes('5/5')) stars = 5;

        // Details like room/service/location ratings
        const detailsEl = c.querySelector('.PV728b, .PBfF4b');
        const subDetails = detailsEl ? detailsEl.innerText.trim() : '';

        return { author, stars, starLabel, date, text, subDetails };
      }).filter(r => r.text && r.text.length > 5);
    });
  }

  // Scroll 15 times
  for (let i = 0; i < 15; i++) {
    await closeModals();
    await page.evaluate(() => {
      // Find scrollable review panel
      const scrollables = Array.from(document.querySelectorAll('div.m6QErb, div.DxyBCb, div.jftiEf'));
      const container = document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf') || document.querySelector('div[role="main"]') || window;
      container.scrollBy(0, 1200);
    });
    await new Promise(r => setTimeout(r, 1200));
  }

  const normalList = await scrapeCurrentReviews();
  console.log('Normal reviews count:', normalList.length);

  // 6. Click Sort by Lowest Rating
  console.log('Sorting by lowest rating...');
  await closeModals();
  const sorted = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const sortBtn = buttons.find(b => b.innerText?.trim() === '정렬' || b.getAttribute('aria-label')?.includes('정렬'));
    if (sortBtn) {
      sortBtn.click();
      return true;
    }
    return false;
  });

  let lowestList = [];
  if (sorted) {
    await new Promise(r => setTimeout(r, 1500));
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div[role="menuitemradio"], div[role="menuitem"]'));
      const lowestOption = items.find(el => el.innerText?.includes('낮은') || el.innerText?.includes('최하'));
      if (lowestOption) lowestOption.click();
    });
    await new Promise(r => setTimeout(r, 3000));
    await closeModals();

    for (let i = 0; i < 15; i++) {
      await page.evaluate(() => {
        const container = document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf') || document.querySelector('div[role="main"]') || window;
        container.scrollBy(0, 1200);
      });
      await new Promise(r => setTimeout(r, 1200));
    }
    lowestList = await scrapeCurrentReviews();
    console.log('Lowest reviews count:', lowestList.length);
  }

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/google_maps_clean_evidence.png' });

  // Get total review stats
  const totalStats = await page.evaluate(() => {
    const fullText = document.body.innerText;
    const lines = fullText.split('\n').map(s => s.trim()).filter(Boolean);
    return {
      lines: lines.slice(0, 50)
    };
  });

  fs.writeFileSync('c:/cowork/taiwan/hotel/crawled_final_reviews.json', JSON.stringify({
    summaryInfo,
    normalList,
    lowestList,
    totalStats
  }, null, 2), 'utf8');

  console.log('Saved crawled_final_reviews.json');
  await browser.close();
}

crawlClean().catch(console.error);

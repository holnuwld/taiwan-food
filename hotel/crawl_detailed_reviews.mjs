import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function crawlDetailedReviews() {
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

  // Click card
  await page.evaluate(() => {
    const card = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // Click '리뷰' tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], div[role="tab"], button'));
    const revTab = tabs.find(t => t.innerText && t.innerText.includes('리뷰') && !t.innerText.includes('작성'));
    if (revTab) revTab.click();
  });
  await new Promise(r => setTimeout(r, 3500));

  // Extract review stats (total reviews, rating)
  const stats = await page.evaluate(() => {
    const text = document.body.innerText;
    // Find string like "4.5" and "(1,829)" or "1,829개의 리뷰"
    const countMatch = text.match(/([0-9,]+)개(?:의)?\s*리뷰/i) || text.match(/리뷰\s*([0-9,]+)개/i);
    const scoreMatch = text.match(/(\d+\.\d)\s*★/);
    
    // Also check specific review header elements
    const headerScores = Array.from(document.querySelectorAll('div.jANrlb, div.F7nice, div.m6QErb')).map(e => e.innerText.slice(0, 100));
    return {
      countMatch: countMatch ? countMatch[0] : null,
      scoreMatch: scoreMatch ? scoreMatch[0] : null,
      headerScores: headerScores.slice(0, 5)
    };
  });
  console.log('Stats:', stats);

  // Function to get reviews
  async function getReviews() {
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

  // Scroll 10 times to get more reviews
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => {
      const scrollable = document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf') || document.querySelector('div[role="main"]') || window;
      scrollable.scrollBy(0, 1500);
    });
    await new Promise(r => setTimeout(r, 1200));
  }

  const allVisible = await getReviews();
  console.log('Visible reviews:', allVisible.length);

  // Now sort by lowest rating if possible
  const sortClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const sortBtn = buttons.find(b => b.innerText && (b.innerText.includes('정렬') || b.getAttribute('aria-label')?.includes('정렬')));
    if (sortBtn) {
      sortBtn.click();
      return true;
    }
    return false;
  });
  console.log('Sort clicked:', sortClicked);

  let lowestReviews = [];
  if (sortClicked) {
    await new Promise(r => setTimeout(r, 1500));
    const optionClicked = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div[role="menuitemradio"], div[role="menuitem"]'));
      const lowest = items.find(m => m.innerText.includes('낮은') || m.innerText.includes('최하'));
      if (lowest) {
        lowest.click();
        return lowest.innerText;
      }
      return false;
    });
    console.log('Option clicked:', optionClicked);
    await new Promise(r => setTimeout(r, 3000));

    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => {
        const scrollable = document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf') || document.querySelector('div[role="main"]') || window;
        scrollable.scrollBy(0, 1500);
      });
      await new Promise(r => setTimeout(r, 1200));
    }
    lowestReviews = await getReviews();
    console.log('Lowest reviews:', lowestReviews.length);
  }

  fs.writeFileSync('c:/cowork/taiwan/hotel/crawled_all_reviews.json', JSON.stringify({ stats, allVisible, lowestReviews }, null, 2), 'utf8');
  await browser.close();
}

crawlDetailedReviews().catch(console.error);

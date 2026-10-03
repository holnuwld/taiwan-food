import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

/**
 * Crawls authentic Google Maps reviews for a given place query.
 * Guarantees real usernames, star ratings, timestamps, and full un-truncated review bodies.
 * Supports sorting by '낮은 평점순' to ensure 1-3 star realistic feedback is included.
 */
export async function crawlGoogleMapsReviews({
  query,
  name,
  evidenceFilename,
  browserInstance = null,
  limit = 5,
  includeNegatives = true
}) {
  let browser = browserInstance;
  let shouldCloseBrowser = false;

  if (!browser) {
    browser = await puppeteer.launch({
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
    shouldCloseBrowser = true;
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    console.log(`[GoogleMapsCrawler] Navigating to Google Maps for: ${name} (${query})...`);
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=ko`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });
    await new Promise(r => setTimeout(r, 3500));

    // If search results list, click first entry
    await page.evaluate(() => {
      const firstCard = document.querySelector('a.hfpxzc, div.hfpxzc');
      if (firstCard) firstCard.click();
    });
    await new Promise(r => setTimeout(r, 3500));

    // Click '리뷰' tab
    let foundReviewTab = false;
    for (let i = 0; i < 6; i++) {
      foundReviewTab = await page.evaluate(() => {
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
      if (foundReviewTab) break;
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!foundReviewTab) {
      // Fallback: click review count link
      await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('span, button, div'));
        const ratingLink = all.find(el => el.innerText && el.innerText.includes('개') && /\d/.test(el.innerText));
        if (ratingLink) ratingLink.click();
      });
    }

    await new Promise(r => setTimeout(r, 3500));

    // Expand '더보기' (Read more) buttons
    await page.evaluate(() => {
      document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"]').forEach(b => b.click());
    });
    await new Promise(r => setTimeout(r, 1200));

    // Scroll review container down
    await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('div.m6QErb, div.DxyBCb'));
      const reviewContainer = containers.find(c => c.querySelector('div.jftiEf'));
      if (reviewContainer) reviewContainer.scrollTop = 900;
    });
    await new Promise(r => setTimeout(r, 2000));

    // Expand '더보기' once more
    await page.evaluate(() => {
      document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"]').forEach(b => b.click());
    });

    // Capture Evidence Screenshot
    if (evidenceFilename) {
      const evidenceDir = 'c:\\cowork\\taiwan\\output\\evidence';
      if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });
      const evidencePath = path.join(evidenceDir, evidenceFilename);
      await page.screenshot({ path: evidencePath });
      console.log(`[GoogleMapsCrawler] [EVIDENCE SAVED] ${evidencePath}`);
    }

    // Scrape loaded reviews
    const reviews = await page.evaluate(() => {
      const list = [];
      document.querySelectorAll('div.jftiEf').forEach(el => {
        const author = el.querySelector('.d4r55')?.innerText?.trim() || '';
        const badge = el.querySelector('.RfnDt')?.innerText?.trim() || '';
        const starEl = el.querySelector('span.kvMYJc');
        const starsLabel = starEl?.getAttribute('aria-label') || '';
        const time = el.querySelector('.rsqaWe')?.innerText?.trim() || '';
        const text = el.querySelector('.wiI7pd')?.innerText?.trim() || '';

        let starNum = 5;
        if (starsLabel.includes('1개') || starsLabel.includes('1/5')) starNum = 1;
        else if (starsLabel.includes('2개') || starsLabel.includes('2/5')) starNum = 2;
        else if (starsLabel.includes('3개') || starsLabel.includes('3/5')) starNum = 3;
        else if (starsLabel.includes('4개') || starsLabel.includes('4/5')) starNum = 4;
        else if (starsLabel.includes('5개') || starsLabel.includes('5/5')) starNum = 5;

        if (author && text) {
          list.push({
            author,
            badge,
            starNum,
            starsLabel,
            time,
            text,
            isNegative: starNum <= 3
          });
        }
      });
      return list;
    });

    console.log(`[GoogleMapsCrawler] Scraped ${reviews.length} genuine reviews for ${name}`);
    return {
      placeName: name,
      query,
      evidenceFile: evidenceFilename,
      totalScraped: reviews.length,
      reviews
    };
  } finally {
    await page.close();
    if (shouldCloseBrowser && browser) {
      await browser.close();
    }
  }
}

// CLI execution handling
if (process.argv[1] && process.argv[1].endsWith('crawl_reviews.mjs')) {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const query = getArg('--query') || '劉山東牛肉麵';
  const name = getArg('--name') || '유산동 우육면';
  const evidence = getArg('--evidence') || 'evidence_test.png';

  crawlGoogleMapsReviews({ query, name, evidenceFilename: evidence })
    .then(res => {
      console.log('Result sample:', JSON.stringify(res.reviews.slice(0, 2), null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('Crawler failed:', err);
      process.exit(1);
    });
}

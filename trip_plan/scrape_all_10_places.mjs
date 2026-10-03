import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const PLACES = [
  { id: 1, name: '유산동 우육면', query: '劉山東牛肉麵', file: 'evidence_1_liu_shan_dong.png' },
  { id: 2, name: '아종면선 본점', query: '阿宗麵線 西門町', file: 'evidence_2_ay_chung.png' },
  { id: 3, name: '키키 레스토랑', query: 'KiKi餐廳 台北', file: 'evidence_3_kiki_restaurant.png' },
  { id: 4, name: '푸항또우장', query: '阜杭豆漿', file: 'evidence_4_fuhang_doujiang.png' },
  { id: 5, name: '딘타이펑 신생점', query: '鼎泰豐 新生店', file: 'evidence_5_din_tai_fung.png' },
  { id: 6, name: '심플 카파 본점', query: '興波咖啡 旗艦店', file: 'evidence_6_simple_kaffa.png' },
  { id: 7, name: '라오허제 후자오빙', query: '福州世祖胡椒餅 饒河', file: 'evidence_7_raohe_pepper_bun.png' },
  { id: 8, name: '진펑 루로우판', query: '金峰魯肉飯', file: 'evidence_8_jinfeng_luroufan.png' },
  { id: 9, name: '호텔 그레이스리 타이베이', query: 'Hotel Gracery Taipei', file: 'evidence_hotel_gracery.png' },
  { id: 10, name: '로더스 플러스 호텔 타이베이', query: 'Roaders Plus Hotel Taipei', file: 'evidence_hotel_roaders_plus.png' }
];

async function scrapePlace(page, place) {
  console.log(`\n========================================`);
  console.log(`[${place.id}/10] Processing ${place.name} (${place.query})...`);
  const url = `https://www.google.com/maps/search/${encodeURIComponent(place.query)}?hl=ko`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 4000));

  // If there are search result cards (hfpxzc), click the first one
  const hasResultsList = await page.evaluate(() => {
    const firstResult = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (firstResult) {
      firstResult.click();
      return true;
    }
    return false;
  });
  if (hasResultsList) {
    console.log('Clicked first result from search list...');
    await new Promise(r => setTimeout(r, 4000));
  }

  // Wait for review tab or review button
  let reviewTabCoord = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    reviewTabCoord = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      const rev = tabs.find(t => {
        const text = t.innerText?.trim() || '';
        const aria = t.getAttribute('aria-label') || '';
        return (text === '리뷰' || text.startsWith('리뷰') || aria.includes('리뷰')) && !text.includes('작성');
      });
      if (rev) {
        const rect = rev.getBoundingClientRect();
        rev.click(); // direct DOM click
        return {
          found: true,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }
      return null;
    });

    if (reviewTabCoord && reviewTabCoord.found) break;
    await new Promise(r => setTimeout(r, 1000));
  }

  if (reviewTabCoord && reviewTabCoord.found) {
    console.log(`Found review tab, clicking via mouse at (${reviewTabCoord.x}, ${reviewTabCoord.y})...`);
    await page.mouse.click(reviewTabCoord.x, reviewTabCoord.y);
  } else {
    console.log('Review tab not found directly, trying to click review count link...');
    await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('span, button, div'));
      const ratingLink = all.find(el => el.innerText && el.innerText.includes('개') && /\d/.test(el.innerText));
      if (ratingLink) ratingLink.click();
    });
  }

  await new Promise(r => setTimeout(r, 4000));

  // Expand "더보기" (Read more) buttons
  await page.evaluate(() => {
    document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"]').forEach(b => b.click());
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll review panel down once or twice to load more reviews
  await page.evaluate(() => {
    const containers = Array.from(document.querySelectorAll('div.m6QErb, div.DxyBCb'));
    const reviewContainer = containers.find(c => c.querySelector('div.jftiEf'));
    if (reviewContainer) {
      reviewContainer.scrollTop = 800;
    }
  });
  await new Promise(r => setTimeout(r, 2000));

  // Expand again
  await page.evaluate(() => {
    document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"]').forEach(b => b.click());
  });

  // Take screenshot of reviews panel evidence!
  const evidencePath = path.join('c:\\cowork\\taiwan\\output\\evidence', place.file);
  await page.screenshot({ path: evidencePath });
  console.log(`[PASS] Evidence screenshot saved to: ${place.file}`);

  // Scrape all loaded reviews
  const rawReviews = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('div.jftiEf').forEach(el => {
      const author = el.querySelector('.d4r55')?.innerText?.trim() || '';
      const badge = el.querySelector('.RfnDt')?.innerText?.trim() || '';
      const starEl = el.querySelector('span.kvMYJc');
      const starsLabel = starEl?.getAttribute('aria-label') || '';
      const time = el.querySelector('.rsqaWe')?.innerText?.trim() || '';
      const text = el.querySelector('.wiI7pd')?.innerText?.trim() || '';

      // Determine numeric stars
      let starNum = 5;
      if (starsLabel.includes('1개') || starsLabel.includes('1/5')) starNum = 1;
      else if (starsLabel.includes('2개') || starsLabel.includes('2/5')) starNum = 2;
      else if (starsLabel.includes('3개') || starsLabel.includes('3/5')) starNum = 3;
      else if (starsLabel.includes('4개') || starsLabel.includes('4/5')) starNum = 4;
      else if (starsLabel.includes('5개') || starsLabel.includes('5/5')) starNum = 5;

      if (author && text) {
        list.push({ author, badge, starNum, starsLabel, time, text });
      }
    });
    return list;
  });

  console.log(`Scraped ${rawReviews.length} real reviews for ${place.name}`);
  return {
    place: place.name,
    file: place.file,
    reviews: rawReviews
  };
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
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

  const allData = [];
  for (const p of PLACES) {
    try {
      const data = await scrapePlace(page, p);
      allData.push(data);
    } catch (err) {
      console.error(`Failed to scrape ${p.name}:`, err.message);
    }
  }

  await browser.close();

  fs.writeFileSync('c:\\cowork\\taiwan\\scraped_raw_reviews.json', JSON.stringify(allData, null, 2), 'utf8');
  console.log('\n[SUCCESS] Finished scraping all places. Saved to scraped_raw_reviews.json');
})();

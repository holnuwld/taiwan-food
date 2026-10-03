import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

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

  console.log('Navigating to Roaders Plus Hotel Taipei...');
  await page.goto('https://www.google.com/maps/search/Roaders+Plus+Hotel+Taipei?hl=ko', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 4000));

  // If search result list, click first
  await page.evaluate(() => {
    const res = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (res) res.click();
  });
  await new Promise(r => setTimeout(r, 5000));

  // Find reviews tab
  const clicked = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button, div'));
    const rev = tabs.find(t => {
      const text = t.innerText?.trim() || '';
      return (text === '리뷰' || text.startsWith('리뷰') || t.getAttribute('aria-label')?.includes('리뷰')) && !text.includes('작성');
    });
    if (rev) {
      rev.click();
      return true;
    }
    return false;
  });
  console.log('Clicked review tab directly:', clicked);

  await new Promise(r => setTimeout(r, 5000));

  // Expand "더보기"
  await page.evaluate(() => {
    document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"]').forEach(b => b.click());
  });

  const targetPath = 'c:\\cowork\\taiwan\\output\\evidence\\evidence_hotel_roaders_plus.png';
  await page.screenshot({ path: targetPath });
  console.log('Saved screenshot to:', targetPath);

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
        list.push({ author, badge, starNum, starsLabel, time, text });
      }
    });
    return list;
  });

  console.log(`Scraped ${reviews.length} reviews for Roaders Plus Hotel:`, JSON.stringify(reviews.slice(0, 5), null, 2));

  fs.writeFileSync('c:\\cowork\\taiwan\\roaders_scraped.json', JSON.stringify(reviews, null, 2), 'utf8');
  await browser.close();
})();

import puppeteer from 'puppeteer-core';
import fs from 'fs';

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

  await page.goto('https://www.google.com/maps/search/ROADERS+PLUS+HOTEL+Taipei?hl=ko', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 3000));

  // Click 닫기
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.innerText.includes('닫기'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Click card at (150, 260)
  console.log('Clicking Roaders card at (150, 260)...');
  await page.mouse.click(150, 260);
  await new Promise(r => setTimeout(r, 5000));

  // Click review tab
  const clicked = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
    const rev = tabs.find(t => t.innerText && t.innerText.includes('리뷰') && !t.innerText.includes('작성'));
    if (rev) {
      rev.click();
      return true;
    }
    return false;
  });
  console.log('Clicked review tab:', clicked);
  await new Promise(r => setTimeout(r, 5000));

  await page.screenshot({ path: 'c:\\cowork\\taiwan\\output\\evidence\\evidence_hotel_roaders_plus.png' });
  console.log('Saved roaders evidence screenshot!');

  const reviews = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('div.jftiEf, div[data-review-id]').forEach(el => {
      const author = el.querySelector('.d4r55')?.innerText?.trim() || '';
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
        list.push({ author, starNum, starsLabel, time, text });
      }
    });
    return list;
  });

  console.log(`Scraped ${reviews.length} reviews for Roaders:`, JSON.stringify(reviews.slice(0, 5), null, 2));
  fs.writeFileSync('c:\\cowork\\taiwan\\roaders_scraped.json', JSON.stringify(reviews, null, 2), 'utf8');

  await browser.close();
})();

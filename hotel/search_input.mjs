import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function searchInput() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1300,850']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 850 });
  await page.goto('https://www.google.com/maps?hl=ko', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.type('#searchboxinput', '호텔 메트로폴리탄 프리미어 타이베이');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 4500));

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/hotel_searched.png' });

  // Close login modal if present
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.innerText?.trim() === '닫기' || b.getAttribute('aria-label') === '닫기');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('c:/cowork/taiwan/hotel/hotel_searched_text.txt', text, 'utf8');

  // Click reviews tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], button'));
    const revTab = tabs.find(t => t.innerText && t.innerText.trim() === '리뷰');
    if (revTab) revTab.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Extract reviews
  const reviews = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div.jftiEf'));
    return cards.map(c => {
      const author = c.querySelector('.d4r55')?.innerText?.trim() || '';
      const starEl = c.querySelector('span.kvMYJc');
      const starLabel = starEl?.getAttribute('aria-label') || '';
      const time = c.querySelector('.rsqaWe')?.innerText?.trim() || '';
      const text = c.querySelector('.wiI7pd')?.innerText?.trim() || '';
      return { author, starLabel, time, text };
    }).filter(r => r.text && r.text.length > 5);
  });

  console.log(`Reviews count: ${reviews.length}`);
  fs.writeFileSync('c:/cowork/taiwan/hotel/hotel_searched_reviews.json', JSON.stringify(reviews, null, 2), 'utf8');

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/hotel_reviews_opened.png' });
  await browser.close();
}

searchInput().catch(console.error);

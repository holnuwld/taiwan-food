import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function crawlMitsuiReviews() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1200,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  const query = 'MGH 미츠이 가든 호텔 타이베이 중샤오';
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=ko`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 4000));

  await page.evaluate(() => {
    const card = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 3500));

  // Close modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.innerText?.trim() === '닫기' || b.getAttribute('aria-label') === '닫기');
    if (closeBtn) closeBtn.click();
  });

  // Click reviews tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], button'));
    const revTab = tabs.find(t => t.innerText && t.innerText.trim() === '리뷰');
    if (revTab) revTab.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // Extract visible reviews
  async function getReviews() {
    await page.evaluate(() => {
      document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"]').forEach(b => b.click());
    });
    await new Promise(r => setTimeout(r, 800));
    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div.jftiEf')).map(c => {
        const author = c.querySelector('.d4r55')?.innerText?.trim() || '';
        const starEl = c.querySelector('span.kvMYJc');
        const starLabel = starEl?.getAttribute('aria-label') || '';
        const time = c.querySelector('.rsqaWe')?.innerText?.trim() || '';
        const text = c.querySelector('.wiI7pd')?.innerText?.trim() || '';
        return { author, starLabel, time, text };
      }).filter(r => r.text && r.text.length > 5);
    });
  }

  // Scroll a bit
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => {
      const container = document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf') || window;
      container.scrollBy(0, 1000);
    });
    await new Promise(r => setTimeout(r, 1000));
  }

  const normal = await getReviews();

  // Try sorting by lowest
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const sortBtn = btns.find(b => b.innerText?.trim() === '정렬' || b.getAttribute('aria-label')?.includes('정렬'));
    if (sortBtn) sortBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="menuitemradio"], div[role="menuitem"]'));
    const lowestOption = items.find(el => el.innerText?.includes('낮은') || el.innerText?.includes('최하'));
    if (lowestOption) lowestOption.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => {
      const container = document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf') || window;
      container.scrollBy(0, 1000);
    });
    await new Promise(r => setTimeout(r, 1000));
  }

  const lowest = await getReviews();

  fs.writeFileSync('c:/cowork/taiwan/hotel/mitsui_reviews.json', JSON.stringify({ normal, lowest }, null, 2), 'utf8');
  console.log('Saved mitsui_reviews.json, normal:', normal.length, 'lowest:', lowest.length);

  await browser.close();
}

crawlMitsuiReviews().catch(console.error);

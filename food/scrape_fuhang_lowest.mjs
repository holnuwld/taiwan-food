import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1400,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  await page.goto('https://www.google.com/maps/search/%E9%98%9C%E6%9D%AD%E8%B1%86%E6%BC%BF?hl=ko', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 4000));

  // Click place if list
  await page.evaluate(() => {
    const f = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (f) f.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // Find reviews tab or click rating link
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button, div, span'));
    const t = tabs.find(el => el.innerText?.trim() === '리뷰' || (el.innerText?.includes('리뷰') && el.innerText?.includes('개')));
    if (t) t.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // Click 정렬 -> 낮은 평점순
  await page.evaluate(() => {
    const sortBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('정렬') || b.getAttribute('aria-label')?.includes('정렬'));
    if (sortBtn) sortBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="menuitemradio"], div[role="menuitem"], div[data-index]'));
    const lowest = items.find(el => el.innerText?.trim() === '낮은 평점순');
    if (lowest) lowest.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  await page.evaluate(() => {
    document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"]').forEach(b => b.click());
  });

  const lowestReviews = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('div.jftiEf').forEach(el => {
      const author = el.querySelector('.d4r55')?.innerText?.trim() || '';
      const starEl = el.querySelector('span.kvMYJc');
      const starsLabel = starEl?.getAttribute('aria-label') || '';
      const time = el.querySelector('.rsqaWe')?.innerText?.trim() || '';
      const text = el.querySelector('.wiI7pd')?.innerText?.trim() || '';
      if (author && text) list.push({ author, starsLabel, time, text });
    });
    return list;
  });

  console.log('Fuhang lowest reviews:', lowestReviews.slice(0, 3));
  await browser.close();
})();

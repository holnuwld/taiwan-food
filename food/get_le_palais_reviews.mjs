import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1200,800']
  });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/maps/search/%E9%A9%A4%E5%AE%AE%E4%B8%AD%E9%A4%90%E5%BB%B3?hl=ko', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  await page.evaluate(() => {
    const f = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (f) f.click();
  });
  await new Promise(r => setTimeout(r, 4000));
  await page.evaluate(() => {
    const t = Array.from(document.querySelectorAll('[role="tab"], button')).find(el => el.innerText?.trim() === '리뷰');
    if (t) t.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // Expand "더보기"
  await page.evaluate(() => {
    document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"]').forEach(b => b.click());
  });

  const revs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div.jftiEf')).map(el => ({
      author: el.querySelector('.d4r55')?.innerText?.trim(),
      star: el.querySelector('span.kvMYJc')?.getAttribute('aria-label'),
      time: el.querySelector('.rsqaWe')?.innerText?.trim(),
      text: el.querySelector('.wiI7pd')?.innerText?.trim()
    })).filter(r => r.author && r.text && (r.star?.includes('5개') || r.star?.includes('4개')));
  });

  console.log('Positive reviews count:', revs.length);
  if (revs.length > 0) {
    console.log(JSON.stringify(revs.slice(0, 5), null, 2));
  }
  await browser.close();
})();

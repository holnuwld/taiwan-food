import puppeteer from 'puppeteer-core';

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

  await page.goto('https://www.google.com/maps/search/KiKi%E9%A4%90%E5%BB%B3+%E5%8F%B0%E5%8C%97?hl=ko', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 4000));

  // Click first result if list
  await page.evaluate(() => {
    const r = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (r) r.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // Click reviews tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
    const rev = tabs.find(t => (t.innerText === '리뷰' || t.innerText?.startsWith('리뷰')) && !t.innerText?.includes('작성'));
    if (rev) rev.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // Click 정렬 button
  await page.evaluate(() => {
    const sortBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('정렬') || b.getAttribute('aria-label')?.includes('정렬'));
    if (sortBtn) sortBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Click '낮은 평점순'
  const clickedLowest = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="menuitemradio"], div[role="menuitem"], div[data-index]'));
    const lowest = items.find(el => el.innerText?.trim() === '낮은 평점순');
    if (lowest) {
      lowest.click();
      return true;
    }
    return false;
  });
  console.log('Clicked 낮은 평점순:', clickedLowest);
  await new Promise(r => setTimeout(r, 4000));

  // Expand 더보기
  await page.evaluate(() => {
    document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"]').forEach(b => b.click());
  });

  const reviews = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('div.jftiEf').forEach(el => {
      const author = el.querySelector('.d4r55')?.innerText?.trim() || '';
      const starEl = el.querySelector('span.kvMYJc');
      const starsLabel = starEl?.getAttribute('aria-label') || '';
      const time = el.querySelector('.rsqaWe')?.innerText?.trim() || '';
      const text = el.querySelector('.wiI7pd')?.innerText?.trim() || '';
      list.push({ author, starsLabel, time, text });
    });
    return list;
  });

  console.log('LOWEST REVIEWS FOR KIKI:', JSON.stringify(reviews.slice(0, 5), null, 2));

  await browser.close();
})();

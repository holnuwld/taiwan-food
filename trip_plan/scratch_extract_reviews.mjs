import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });
  
  await page.goto('https://www.google.com/maps/search/%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5?hl=ko', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  const reviewsTab = await page.$('button[aria-label*="리뷰"], button[aria-label*="Reviews"], div[role="tab"][aria-label*="리뷰"]');
  if (reviewsTab) {
    await reviewsTab.click();
    await new Promise(r => setTimeout(r, 4000));
  }
  
  const reviews = await page.evaluate(() => {
    const cards = document.querySelectorAll('div.jftiEf, div[data-review-id]');
    return Array.from(cards).map(card => {
      const nameEl = card.querySelector('div.d4r55, .WNxxfd, button[aria-label]');
      const starsEl = card.querySelector('span[role="img"]');
      const textEl = card.querySelector('span.wiI7Mc, .MyEned');
      return {
        name: nameEl ? nameEl.textContent.trim() : '',
        stars: starsEl ? starsEl.getAttribute('aria-label') : '',
        text: textEl ? textEl.textContent.trim() : ''
      };
    });
  });
  
  console.log('Found reviews count:', reviews.length);
  console.log(JSON.stringify(reviews.slice(0, 5), null, 2));
  await browser.close();
})();

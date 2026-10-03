import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1400,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7' });

  await page.goto('https://www.google.com/maps/search/%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5?hl=ko', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Let's find all elements containing '리뷰' or stars
  const reviewLinks = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const matches = [];
    for (const el of all) {
      if (el.children.length === 0 && (el.innerText?.includes('리뷰') || el.innerText?.includes('개') || el.getAttribute('aria-label')?.includes('리뷰'))) {
        matches.push({
          tag: el.tagName,
          text: el.innerText,
          ariaLabel: el.getAttribute('aria-label'),
          className: el.className
        });
      }
    }
    return matches;
  });
  console.log('Review elements found:', reviewLinks);

  // Click on the reviews button (usually something like "리뷰 7,500개" or the star rating)
  const clicked = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('button, div, span'));
    const target = candidates.find(el => {
      const t = el.innerText || '';
      const a = el.getAttribute('aria-label') || '';
      return (t.includes('리뷰') && (t.includes('개') || /\d/.test(t))) || a.includes('리뷰');
    });
    if (target) {
      target.click();
      return { success: true, text: target.innerText, label: target.getAttribute('aria-label') };
    }
    return { success: false };
  });
  console.log('Clicked target:', clicked);

  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'test_scroll_reviews.png' });

  // Check if review list loaded
  const reviews = await page.evaluate(() => {
    const reviewEls = Array.from(document.querySelectorAll('div.jftiEf, div[data-review-id]'));
    return reviewEls.map(el => {
      const user = el.querySelector('.d4r55, .WNxFfe')?.innerText?.trim();
      const text = el.querySelector('.wiI7pd, .MyEned')?.innerText?.trim();
      const stars = el.querySelector('span[role="img"]')?.getAttribute('aria-label');
      return { user, text, stars };
    });
  });

  console.log('Reviews count:', reviews.length);
  if (reviews.length > 0) {
    console.log('First 3 reviews:', reviews.slice(0, 3));
  }

  await browser.close();
})();

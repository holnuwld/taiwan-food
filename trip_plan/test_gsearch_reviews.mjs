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

  console.log('Navigating to Google Search for 유산동우육면...');
  await page.goto('https://www.google.com/search?q=%EC%9C%A0%EC%82%B0%EB%8F%99%EC%9A%B0%EC%9C%A1%EB%A9%B4&hl=ko', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: 'test_gsearch_result.png' });

  // Find review button or links in knowledge panel
  const reviewButtons = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('a, button, span, div'));
    return all.filter(el => {
      const t = el.innerText || '';
      return (t.includes('Google 리뷰') || t.includes('리뷰') && t.includes('개')) && el.children.length === 0;
    }).map(el => ({ tag: el.tagName, text: el.innerText }));
  });
  console.log('Found review buttons in Google Search:', reviewButtons);

  // Click Google 리뷰 link
  const clicked = await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll('a, span[data-async-trigger*="review"], div[data-async-trigger*="review"]')).find(el => {
      return el.innerText && el.innerText.includes('Google 리뷰');
    });
    if (link) {
      link.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Google 리뷰:', clicked);

  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'test_gsearch_reviews_modal.png' });

  // Scrape reviews from the modal
  const reviews = await page.evaluate(() => {
    // Reviews in Google Search modal typically have data-review-id or class
    const items = [];
    const elements = document.querySelectorAll('div[data-review-id], div.WMBnJf, div.jftiEf, div.gws-localreviews__google-review');
    elements.forEach(el => {
      const author = el.querySelector('.TSUbDb, .d4r55, a[href*="contrib"]')?.innerText?.trim();
      const stars = el.querySelector('span[role="img"]')?.getAttribute('aria-label');
      const text = el.querySelector('.review-full-text, .wiI7pd, .Jtu6Td, span[data-expandable-section]')?.innerText?.trim() 
                   || el.querySelector('.review-snippet')?.innerText?.trim();
      const snippet = el.innerText;
      items.push({ author, stars, text: text || snippet.slice(0, 100) });
    });
    return items;
  });

  console.log('Scraped count from search modal:', reviews.length);
  if (reviews.length > 0) {
    console.log('Sample reviews:', JSON.stringify(reviews.slice(0, 3), null, 2));
  }

  await browser.close();
})();

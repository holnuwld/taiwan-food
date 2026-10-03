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

  await page.goto('https://www.google.com/maps/search/%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5?hl=ko', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));

  // Find the exact bounding box of the 리뷰 tab or button
  const tabHandle = await page.evaluateHandle(() => {
    const tabs = Array.from(document.querySelectorAll('button[role="tab"], div[role="tab"]'));
    return tabs.find(t => t.innerText.includes('리뷰') || t.getAttribute('aria-label')?.includes('리뷰'));
  });

  if (tabHandle) {
    console.log('Found tabHandle, clicking...');
    await tabHandle.asElement().click();
  } else {
    console.log('tabHandle not found, trying clicking button with text 리뷰');
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && text.includes('리뷰')) {
        await b.click();
        console.log('Clicked button with text:', text);
        break;
      }
    }
  }

  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'test_reviews_opened.png' });
  console.log('Screenshot saved to test_reviews_opened.png');

  // Let's inspect the text of the side panel now
  const reviewTexts = await page.evaluate(() => {
    // Collect all review blocks
    const reviews = [];
    const elements = document.querySelectorAll('div.jftiEf, div[data-review-id]');
    elements.forEach(el => {
      const author = el.querySelector('.d4r55')?.innerText;
      const text = el.querySelector('.wiI7pd')?.innerText;
      const stars = el.querySelector('span.kvMYJc')?.getAttribute('aria-label');
      const time = el.querySelector('.rsqaWe')?.innerText;
      if (author || text) {
        reviews.push({ author, text, stars, time });
      }
    });
    return {
      count: reviews.length,
      reviews: reviews.slice(0, 10),
      rawPanelText: document.querySelector('.m6QErb')?.innerText?.slice(0, 500)
    };
  });

  console.log('Review inspection result:', JSON.stringify(reviewTexts, null, 2));

  await browser.close();
})();

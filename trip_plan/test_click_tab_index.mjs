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

  const tabs = await page.$$('[role="tab"]');
  console.log('Found tabs count:', tabs.length);

  for (let i = 0; i < tabs.length; i++) {
    const text = await page.evaluate(el => el.innerText, tabs[i]);
    console.log(`Tab ${i}:`, text);
    if (text.includes('리뷰')) {
      console.log(`Clicking tab ${i}...`);
      await tabs[i].click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'test_reviews_opened.png' });
  console.log('Saved test_reviews_opened.png');

  // Let's check review cards in DOM
  const reviewData = await page.evaluate(() => {
    // Collect all review blocks
    const items = [];
    const elements = document.querySelectorAll('div.jftiEf');
    elements.forEach(el => {
      const author = el.querySelector('.d4r55')?.innerText?.trim();
      const text = el.querySelector('.wiI7pd')?.innerText?.trim();
      const stars = el.querySelector('span.kvMYJc')?.getAttribute('aria-label');
      const time = el.querySelector('.rsqaWe')?.innerText?.trim();
      items.push({ author, stars, time, text });
    });
    return items;
  });

  console.log('Scraped reviews count:', reviewData.length);
  console.log('Scraped reviews sample:', JSON.stringify(reviewData.slice(0, 5), null, 2));

  await browser.close();
})();

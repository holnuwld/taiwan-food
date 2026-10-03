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
  
  // Wait until tabs include '리뷰'
  console.log('Waiting for 리뷰 tab to appear...');
  let reviewTabFound = false;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const tabTexts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="tab"], button')).map(t => t.innerText.trim()).filter(t => t.includes('리뷰'));
    });
    console.log(`Sec ${i+1}:`, tabTexts);
    if (tabTexts.length > 0) {
      reviewTabFound = true;
      break;
    }
  }

  // Click 리뷰
  const clicked = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
    const t = tabs.find(el => el.innerText.trim() === '리뷰' || el.getAttribute('aria-label')?.includes('리뷰'));
    if (t) {
      t.click();
      return true;
    }
    return false;
  });
  console.log('Clicked 리뷰:', clicked);

  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: 'test_reviews_panel_actual.png' });
  console.log('Saved test_reviews_panel_actual.png');

  // Scrape reviews
  const reviews = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('div.jftiEf').forEach(el => {
      const author = el.querySelector('.d4r55')?.innerText?.trim();
      const stars = el.querySelector('span.kvMYJc')?.getAttribute('aria-label');
      const time = el.querySelector('.rsqaWe')?.innerText?.trim();
      const text = el.querySelector('.wiI7pd')?.innerText?.trim();
      items.push({ author, stars, time, text });
    });
    return items;
  });

  console.log('Scraped count:', reviews.length);
  console.log('Scraped reviews:', JSON.stringify(reviews, null, 2));

  await browser.close();
})();

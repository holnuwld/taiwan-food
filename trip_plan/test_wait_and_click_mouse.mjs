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

  console.log('Navigating...');
  await page.goto('https://www.google.com/maps/search/%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5?hl=ko', { waitUntil: 'networkidle2', timeout: 30000 });
  
  console.log('Waiting 6 seconds for place details & reviews tab to populate...');
  await new Promise(r => setTimeout(r, 6000));

  const tabCoord = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const revTab = tabs.find(t => t.innerText.includes('리뷰') || t.getAttribute('aria-label')?.includes('리뷰'));
    if (revTab) {
      const rect = revTab.getBoundingClientRect();
      // Try direct click as well
      revTab.click();
      return {
        found: true,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    return { found: false };
  });

  console.log('Tab coordination & click result:', tabCoord);
  if (tabCoord.found) {
    // Also send actual mouse click to ensure event triggers
    await page.mouse.click(tabCoord.x, tabCoord.y);
  }

  console.log('Waiting 6s for reviews panel to load...');
  await new Promise(r => setTimeout(r, 6000));

  await page.screenshot({ path: 'test_real_reviews_panel_success.png' });
  console.log('Saved test_real_reviews_panel_success.png');

  // Scrape all reviews!
  const reviews = await page.evaluate(() => {
    const results = [];
    const reviewCards = document.querySelectorAll('div.jftiEf');
    reviewCards.forEach(card => {
      const author = card.querySelector('.d4r55')?.innerText?.trim();
      const stars = card.querySelector('span.kvMYJc')?.getAttribute('aria-label');
      const text = card.querySelector('.wiI7pd')?.innerText?.trim();
      const time = card.querySelector('.rsqaWe')?.innerText?.trim();
      if (author || text) {
        results.push({ author, stars, time, text });
      }
    });
    return {
      count: results.length,
      reviews: results
    };
  });

  console.log('Scraped reviews result:', JSON.stringify(reviews, null, 2));

  await browser.close();
})();

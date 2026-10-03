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
  await new Promise(r => setTimeout(r, 3000));

  // Click review tab
  const clicked = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const revTab = tabs.find(t => t.innerText.includes('리뷰'));
    if (revTab) {
      revTab.click();
      return true;
    }
    return false;
  });
  console.log('Clicked review tab:', clicked);

  await new Promise(r => setTimeout(r, 4000));

  // Let's screenshot the review tab
  await page.screenshot({ path: 'test_real_reviews_tab.png' });

  // Let's inspect review elements
  const data = await page.evaluate(() => {
    const reviewEls = Array.from(document.querySelectorAll('div.jftiEf'));
    return reviewEls.map(el => {
      const authorEl = el.querySelector('.d4r55');
      const textEl = el.querySelector('.wiI7pd');
      const starEl = el.querySelector('span.kvMYJc');
      const dateEl = el.querySelector('.rsqaWe');
      return {
        author: authorEl ? authorEl.innerText.trim() : '',
        text: textEl ? textEl.innerText.trim() : '',
        stars: starEl ? starEl.getAttribute('aria-label') : '',
        date: dateEl ? dateEl.innerText.trim() : ''
      };
    });
  });

  console.log('Found review count:', data.length);
  console.log('Reviews:', JSON.stringify(data, null, 2));

  await browser.close();
})();

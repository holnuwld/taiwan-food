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

  // Find scrollable container
  const scrollResult = await page.evaluate(() => {
    // Look for scrollable containers
    const all = Array.from(document.querySelectorAll('div'));
    const scrollables = all.filter(el => {
      const style = window.getComputedStyle(el);
      return (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
    });

    if (scrollables.length > 0) {
      // Scroll the largest scrollable container
      const target = scrollables.sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
      target.scrollTop = 1500;
      return { found: true, scrollHeight: target.scrollHeight, newScrollTop: target.scrollTop, className: target.className };
    }
    return { found: false };
  });

  console.log('scrollResult:', scrollResult);
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'test_scrolled_down.png' });

  // Now let's see what is visible in the container
  const visibleText = await page.evaluate(() => {
    const main = document.querySelector('div[role="main"]');
    return main ? main.innerText : document.body.innerText;
  });
  console.log('Visible text length:', visibleText.length);
  console.log('Sample text:', visibleText.slice(500, 1500));

  await browser.close();
})();

import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false, // let's test what happens or headless: 'new'
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

  const tabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[role="tab"]')).map(t => ({
      text: t.innerText.trim(),
      ariaLabel: t.getAttribute('aria-label')
    }));
  });
  console.log('Tabs:', tabs);

  await page.screenshot({ path: 'test_headful_maps.png' });
  await browser.close();
})();

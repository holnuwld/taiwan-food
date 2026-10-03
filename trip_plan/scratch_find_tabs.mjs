import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('https://www.google.com/maps/search/%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5?hl=ko', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Find all text elements with role tab or buttons
  const tabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[role="tab"], button')).map(e => ({
      tag: e.tagName,
      role: e.getAttribute('role'),
      label: e.getAttribute('aria-label'),
      text: e.innerText
    })).filter(e => e.text && (e.text.includes('리뷰') || e.text.includes('개요') || e.text.includes('사진')));
  });
  console.log('Tabs:', tabs);
  await browser.close();
})();

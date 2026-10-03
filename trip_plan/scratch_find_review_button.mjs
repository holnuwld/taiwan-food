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
  
  // Find clickable elements with text containing '리뷰' or numbers
  const reviewElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).filter(e => {
      return e.children.length === 0 && e.textContent.includes('리뷰') && e.textContent.length < 50;
    }).map(e => ({
      tag: e.tagName,
      parentTag: e.parentElement.tagName,
      text: e.textContent.trim(),
      className: e.className
    }));
  });
  console.log('Review elements:', reviewElements);
  
  // Try to click the first one that is a button or inside a button
  const clicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('button, span')).find(e => e.textContent.includes('리뷰') && /\d/.test(e.textContent));
    if (el) {
      el.click();
      return el.textContent;
    }
    return null;
  });
  console.log('Clicked element with text:', clicked);
  
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'c:\\cowork\\taiwan\\output\\evidence\\test_reviews_click.png' });
  console.log('Screenshot taken!');
  
  await browser.close();
})();

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
  
  const allTabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button[role="tab"]')).map(b => ({
      label: b.getAttribute('aria-label'),
      text: b.innerText
    }));
  });
  console.log('All tabs:', allTabs);
  
  // Click the review tab
  const clicked = await page.evaluate(() => {
    const tab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.innerText.includes('리뷰') || (b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('리뷰')));
    if (tab) {
      tab.click();
      return true;
    }
    return false;
  });
  console.log('Clicked review tab?', clicked);
  
  await new Promise(r => setTimeout(r, 4000));
  
  // Now list review texts
  const reviews = await page.evaluate(() => {
    const textEls = Array.from(document.querySelectorAll('div, span')).filter(e => e.className && e.className.includes('wiI7Mc'));
    return textEls.map(e => e.innerText);
  });
  console.log('wiI7Mc reviews found:', reviews.length);
  if (reviews.length > 0) console.log(reviews.slice(0, 3));
  
  await browser.close();
})();

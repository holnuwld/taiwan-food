import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });
  
  const searchUrl = 'https://www.google.com/search?q=%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5+%EA%B5%AC%EA%B8%80+%EB%A6%AC%EB%B7%B0&hl=ko';
  console.log('Navigating to', searchUrl);
  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  await page.screenshot({ path: 'c:\\cowork\\taiwan\\output\\evidence\\gsearch_liu_shan_dong.png' });
  console.log('Saved Google Search screenshot');
  
  // Extract review snippets
  const snippets = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div, span')).filter(e => {
      const t = e.innerText || '';
      return t.includes('★') || t.includes('별표') || t.includes('우육면');
    }).map(e => e.innerText).slice(0, 10);
  });
  console.log('Snippets:', snippets.slice(0, 3));
  
  await browser.close();
})();

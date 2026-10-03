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
  
  const url = 'https://www.google.com/maps/search/%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5?hl=ko&gl=tw';
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  
  const tabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button[role="tab"]')).map(b => b.innerText);
  });
  console.log('Tabs with gl=tw:', tabs);
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Body text snippet with gl=tw:', text.slice(0, 600));
  
  await page.screenshot({ path: 'c:\\cowork\\taiwan\\output\\evidence\\gmaps_tw_test.png' });
  await browser.close();
})();

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
  
  // URL to Liu Shan Dong reviews
  const url = 'https://www.google.com/maps/search/%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5/@25.0456,121.5152,17z/data=!4m8!3m7!1s0x3442a972bf7eb5e9:0xc75c7ddc5264b380!8m2!3d25.0456!4d121.5152!9m1!1b1?hl=ko';
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  
  await page.screenshot({ path: 'c:\\cowork\\taiwan\\output\\evidence\\liu_shan_dong_reviews_pane.png' });
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Text snippet:', text.slice(0, 500));
  await browser.close();
})();

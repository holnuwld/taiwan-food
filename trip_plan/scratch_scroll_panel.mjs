import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('https://www.google.com/maps/search/%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5?hl=ko', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  
  // Scroll the left pane
  await page.evaluate(() => {
    const pane = document.querySelector('div[role="main"]') || document.querySelector('.m6QErb');
    if (pane) pane.scrollTop = 1500;
  });
  await new Promise(r => setTimeout(r, 3000));
  
  const text = await page.evaluate(() => {
    const pane = document.querySelector('div[role="main"]') || document.querySelector('.m6QErb');
    return pane ? pane.innerText : document.body.innerText;
  });
  console.log('Pane text length:', text.length);
  console.log('Pane text slice:', text.slice(500, 1500));
  
  await page.screenshot({ path: 'c:\\cowork\\taiwan\\output\\evidence\\scroll_panel.png' });
  console.log('Saved scroll_panel.png');
  await browser.close();
})();

import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('https://duckduckgo.com/?q=%E8%81%96%E6%AF%94%E5%BE%B7+%E5%92%96%E5%95%A1%E7%89%9B%E8%BB%8B%E9%A4%85&iax=images&ia=images');
  await new Promise(r => setTimeout(r, 4000));
  
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(i => i.src).filter(s => s && s.startsWith('http'));
  });
  console.log('Found DDG images for Saint Peter:', imgs.slice(0, 3));
  
  await browser.close();
})();

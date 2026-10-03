import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://www.sp-nougat.com.tw/', { waitUntil: 'networkidle2' });
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(i => i.src).filter(s => s && (s.endsWith('.jpg') || s.endsWith('.png')));
  });
  console.log('Saint Peter images:', imgs.slice(0, 10));
  await browser.close();
})();

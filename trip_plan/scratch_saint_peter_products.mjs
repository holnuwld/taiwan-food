import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://www.sp-nougat.com.tw/products', { waitUntil: 'networkidle2' });
  const productImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.product-item img, .products img, img')).map(i => i.src).filter(s => s && s.includes('uploads'));
  });
  console.log('Product images:', [...new Set(productImgs)]);
  await browser.close();
})();

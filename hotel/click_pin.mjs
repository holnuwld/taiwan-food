import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function clickPin() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1200,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  const url = 'https://www.google.com/maps/place/JR%E6%9D%B1%E6%97%A5%E6%9C%AC%E5%A4%A7%E9%A3%AF%E5%BA%97%E5%8F%B0%E5%8C%97/@25.0520667,121.5401347,17z?hl=ko';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 4000));

  // Click hotel pin
  await page.mouse.click(670, 450);
  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/pin_clicked.png' });

  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('c:/cowork/taiwan/hotel/pin_text.txt', text, 'utf8');
  console.log('Saved pin screenshot and text');
  await browser.close();
}

clickPin().catch(console.error);

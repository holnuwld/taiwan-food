import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_IMAGES = 'c:\\cowork\\taiwan\\output\\images';
const SCREENSHOTS_DIR = 'c:\\cowork\\taiwan\\output\\verified_screenshots';

const PERFECT_CROPS = [
  {
    target: 'dihua_bottarga.jpg',
    screenshot: '디화제_자연산어란.png',
    crop: { x: 54, y: 172, width: 1172, height: 535 }
  }
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--window-size=1280,850']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  for (const item of PERFECT_CROPS) {
    const srcPath = path.join(SCREENSHOTS_DIR, item.screenshot);
    const dest = path.join(OUT_IMAGES, item.target);
    const fileUrl = 'file:///' + srcPath.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 200));

    await page.screenshot({
      path: dest,
      clip: item.crop
    });
    console.log(`Perfect crop saved for ${item.target}`);
  }

  await browser.close();
}

run();

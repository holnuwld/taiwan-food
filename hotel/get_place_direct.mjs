import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function getPlaceExact() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1200,800']
  });

  const page = await browser.newPage();
  // Directly navigate to hotel metropolitan premier taipei place on google maps
  const url = 'https://www.google.com/maps/place/JR%E6%9D%B1%E6%97%A5%E6%9C%AC%E5%A4%A7%E9%A3%AF%E5%BA%97%E5%8F%B0%E5%8C%97/@25.0520667,121.5401347,17z?hl=ko';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 4000));

  // Extract review score and review count from aria labels and text
  const data = await page.evaluate(() => {
    const text = document.body.innerText;
    // Find rating
    const ratingMatches = text.match(/4\.[0-9]/g);
    // Find review counts like (1,234) or 1,234개
    const countMatches = text.match(/([0-9,]+)\s*(개|건|개의 리뷰|reviews)/g);
    
    // Look at buttons or spans with aria-label
    const elementsWithAria = Array.from(document.querySelectorAll('[aria-label]'))
      .map(e => e.getAttribute('aria-label'))
      .filter(a => a && (a.includes('리뷰') || a.includes('별점') || a.includes('점')));

    return {
      title: document.title,
      ratingMatches,
      countMatches,
      elementsWithAria: elementsWithAria.slice(0, 15)
    };
  });

  console.log('Result:', data);
  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/place_direct.png' });
  await browser.close();
}

getPlaceExact().catch(console.error);

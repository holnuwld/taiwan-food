import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function fetchGoogleReviews() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Use direct Google search for place reviews
  const url = 'https://www.google.com/search?q=%ED%98%B8%ED%85%94+%EB%A9%94%ED%8A%B8%EB%A1%9C%ED%8F%B4%EB%A6%AC%ED%83%84+%ED%94%84%EB%A6%AC%EB%AF%B8%EC%96%B4+%ED%83%80%EC%9D%B4%EB%82%98%EC%9D%B4+%EB%A6%AC%EB%B7%B0&hl=ko';
  await page.goto('https://www.google.com/search?q=Hotel+Metropolitan+Premier+Taipei+%EA%B5%AC%EA%B8%80+%ED%8F%89%EC%A0%90+%EB%A6%AC%EB%B7%B0&hl=ko', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));

  const searchData = await page.evaluate(() => {
    // Look for knowledge graph / review snippets
    const body = document.body.innerText;
    return {
      title: document.title,
      snippet: body.slice(0, 3000)
    };
  });

  fs.writeFileSync('c:/cowork/taiwan/hotel/google_search_result.txt', searchData.snippet, 'utf8');
  console.log('Saved google_search_result.txt');
  await browser.close();
}

fetchGoogleReviews().catch(console.error);

import puppeteer from 'puppeteer-core';
import fs from 'fs';

const targetHotels = [
  {
    name: 'MGH Mitsui Garden Hotel Taipei Zhongxiao',
    query: 'MGH Mitsui Garden Hotel Taipei Zhongxiao',
    matchKeyword: 'Mitsui',
    file: 'evidence_gmaps_mitsui.png'
  },
  {
    name: 'Hotel Gracery Taipei',
    query: 'Hotel Gracery Taipei',
    matchKeyword: 'Gracery',
    file: 'evidence_gmaps_gracery.png'
  },
  {
    name: 'Hotel Midtown Richardson',
    query: 'Hotel Midtown Richardson',
    matchKeyword: 'Richardson',
    file: 'evidence_gmaps_midtown.png'
  },
  {
    name: 'Grand Hyatt Taipei',
    query: 'Grand Hyatt Taipei',
    matchKeyword: 'Grand Hyatt',
    file: 'evidence_gmaps_hyatt.png'
  },
  {
    name: 'Hotel Metropolitan Premier Taipei',
    query: 'Hotel Metropolitan Premier Taipei',
    matchKeyword: 'Metropolitan',
    file: 'evidence_gmaps_metropolitan.png'
  }
];

async function captureAll() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1400,1000']
  });

  const results = [];

  for (const h of targetHotels) {
    console.log(`\n========================================`);
    console.log(`Processing: ${h.name}`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1000 });

    const searchUrl = `https://www.google.com/travel/search?q=${encodeURIComponent(h.query)}&hl=ko`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 4000));

    // Find and click the target hotel link specifically
    const clicked = await page.evaluate((keyword) => {
      const candidates = Array.from(document.querySelectorAll('a, h2, h3, div[role="button"]'));
      const match = candidates.find(el => el.innerText && el.innerText.toLowerCase().includes(keyword.toLowerCase()));
      if (match) {
        match.click();
        return match.innerText.slice(0, 80);
      }
      return null;
    }, h.matchKeyword);
    console.log('Clicked target link:', clicked);
    await new Promise(r => setTimeout(r, 4000));

    // Click "리뷰" tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button, div[role="tab"], a')).filter(el => el.innerText?.trim() === '리뷰');
      if (tabs.length > 0) tabs[0].click();
    });
    await new Promise(r => setTimeout(r, 3000));

    // Save authentic screenshot
    const ssPath = `c:/cowork/taiwan/hotel/${h.file}`;
    await page.screenshot({ path: ssPath });
    console.log(`Saved screenshot: ${h.file}`);

    // Extract real reviews and metadata
    const extracted = await page.evaluate(() => {
      const title = document.querySelector('h1')?.innerText || document.title;
      const text = document.body.innerText;
      const url = window.location.href;
      
      // Grab review cards or snippet
      const revSummary = text.match(/Google 리뷰 요약[\s\S]*?(?=다른 여행 사이트|리뷰 쓰기|$)/)?.[0] || '';
      
      return {
        title,
        url,
        revSummary,
        snippet: text.slice(text.indexOf('Google 리뷰 요약') > -1 ? text.indexOf('Google 리뷰 요약') : 0, 3000)
      };
    });

    results.push({
      hotel: h.name,
      screenshot: h.file,
      url: extracted.url,
      title: extracted.title,
      summary: extracted.revSummary,
      snippet: extracted.snippet
    });

    await page.close();
  }

  fs.writeFileSync('c:/cowork/taiwan/hotel/authentic_gmaps_proofs.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('\nAll 5 authentic proofs successfully saved to authentic_gmaps_proofs.json');
  await browser.close();
}

captureAll().catch(console.error);

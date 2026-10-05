import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function fixMetropolitan() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1400,1000']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  const searchUrl = `https://www.google.com/travel/search?q=Hotel%20Metropolitan%20Premier%20Taipei&hl=ko`;
  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));

  // Click the hotel title card
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('h2, div[role="heading"], a')).find(x => x.innerText?.includes('호텔 메트로폴리탄'));
    if (el) el.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // Click 리뷰 tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button, div[role="tab"], a')).filter(el => el.innerText?.trim() === '리뷰');
    if (tabs.length > 0) tabs[0].click();
  });
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/evidence_gmaps_metropolitan.png' });
  console.log('Saved evidence_gmaps_metropolitan.png');

  const extracted = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      title: document.querySelector('h1')?.innerText || document.title,
      url: window.location.href,
      summary: text.match(/Google 리뷰 요약[\s\S]*?(?=다른 여행 사이트|리뷰 쓰기|$)/)?.[0] || '',
      snippet: text.slice(text.indexOf('Google 리뷰 요약') > -1 ? text.indexOf('Google 리뷰 요약') : 0, 3000)
    };
  });

  const proofs = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/authentic_gmaps_proofs.json', 'utf8'));
  const metroIdx = proofs.findIndex(p => p.hotel === 'Hotel Metropolitan Premier Taipei');
  const metroData = {
    hotel: 'Hotel Metropolitan Premier Taipei',
    screenshot: 'evidence_gmaps_metropolitan.png',
    url: extracted.url,
    title: extracted.title,
    summary: extracted.summary,
    snippet: extracted.snippet
  };
  if (metroIdx > -1) {
    proofs[metroIdx] = metroData;
  } else {
    proofs.push(metroData);
  }
  fs.writeFileSync('c:/cowork/taiwan/hotel/authentic_gmaps_proofs.json', JSON.stringify(proofs, null, 2), 'utf8');
  console.log('Updated authentic_gmaps_proofs.json');

  await browser.close();
}

fixMetropolitan().catch(console.error);

import puppeteer from 'puppeteer-core';
import fs from 'fs';

// Hotels to capture real proof screenshots from Google
const sampleHotels = [
  { name: 'Hotel Metropolitan Premier Taipei', query: 'Hotel Metropolitan Premier Taipei', file: 'evidence_gmaps_metropolitan.png' },
  { name: 'MGH Mitsui Garden Hotel Taipei Zhongxiao', query: 'MGH Mitsui Garden Hotel Taipei Zhongxiao', file: 'evidence_gmaps_mitsui.png' },
  { name: 'Hotel Gracery Taipei', query: 'Hotel Gracery Taipei', file: 'evidence_gmaps_gracery.png' },
  { name: 'Hotel Midtown Richardson', query: 'Hotel Midtown Richardson', file: 'evidence_gmaps_midtown.png' },
  { name: 'Grand Hyatt Taipei', query: 'Grand Hyatt Taipei', file: 'evidence_gmaps_hyatt.png' }
];

async function captureAuthenticReviews() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1400,1000']
  });

  const scrapedProofs = [];

  for (const h of sampleHotels) {
    console.log(`Fetching authentic reviews for: ${h.name}...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1000 });

    const searchUrl = `https://www.google.com/travel/search?q=${encodeURIComponent(h.query)}&hl=ko`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 4000));

    // Click "가격 보기" or hotel title if on search list
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.innerText?.includes('가격 보기'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    // Click "리뷰" tab
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('button, a, div[role="tab"]')).find(t => t.innerText?.trim() === '리뷰');
      if (tab) tab.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    // Capture the review panel screenshot as authentic evidence
    const screenshotPath = `c:/cowork/taiwan/hotel/${h.file}`;
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved proof screenshot: ${h.file}`);

    // Extract real reviews from the DOM
    const data = await page.evaluate(() => {
      const reviews = [];
      // Look for reviewer text blocks
      const cards = document.querySelectorAll('div.jftiEf, div[data-review-id], div.Svr5cf, div.pI3whf, div.k5hDNe, div.g1lvWe, div.WNxMfl, div[jscontroller]');
      const rawText = document.body.innerText;
      return {
        url: window.location.href,
        title: document.title,
        textSnippet: rawText.slice(rawText.indexOf('리뷰') > -1 ? rawText.indexOf('리뷰') : 0, rawText.indexOf('리뷰') + 2000)
      };
    });

    scrapedProofs.push({
      hotel: h.name,
      screenshot: h.file,
      url: data.url,
      snippet: data.textSnippet
    });

    await page.close();
  }

  fs.writeFileSync('c:/cowork/taiwan/hotel/authentic_gmaps_proofs.json', JSON.stringify(scrapedProofs, null, 2), 'utf8');
  console.log('Saved authentic_gmaps_proofs.json');
  await browser.close();
}

captureAuthenticReviews().catch(console.error);

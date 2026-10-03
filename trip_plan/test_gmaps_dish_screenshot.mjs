import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1280,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('Navigating to Google Maps for Liu Shan Dong...');
  await page.goto('https://www.google.com/maps/search/%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5?hl=ko', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 4000));

  // Click first result if list
  await page.evaluate(() => {
    const r = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (r) r.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // Click photo tab
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, div[role="tab"]'));
    const pTab = btns.find(b => (b.innerText || '').includes('사진') || (b.getAttribute('aria-label') || '').includes('사진'));
    if (pTab) {
      pTab.click();
      return pTab.innerText || pTab.getAttribute('aria-label');
    }
    return null;
  });
  console.log('Clicked photo tab:', clicked);
  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({ path: 'output/test_gmaps_photos_view.png' });
  console.log('Saved output/test_gmaps_photos_view.png');
  await browser.close();
})();

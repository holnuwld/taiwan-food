import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1400,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  const q = '劉山東牛肉麵';
  console.log('Navigating to Google Maps for:', q);
  await page.goto('https://www.google.com/maps/search/' + encodeURIComponent(q) + '?hl=ko', { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 4000));

  // Click first result if list
  await page.evaluate(() => {
    const firstResult = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (firstResult) firstResult.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // Find '사진' tab
  const clickedTab = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
    const photoTab = tabs.find(t => {
      const text = t.innerText?.trim() || '';
      const aria = t.getAttribute('aria-label') || '';
      return (text === '사진' || text.startsWith('사진') || aria.includes('사진'));
    });
    if (photoTab) {
      photoTab.click();
      return photoTab.innerText || photoTab.getAttribute('aria-label');
    }
    return null;
  });
  console.log('Clicked Photo Tab:', clickedTab);
  await new Promise(r => setTimeout(r, 4000));

  // Extract photos
  const photos = await page.evaluate(() => {
    const list = [];
    const elements = Array.from(document.querySelectorAll('div[role="img"], img, div.U39Pmb, a[data-photo-index]'));
    for (const el of elements) {
      let src = el.src || el.getAttribute('src');
      const bg = el.style?.backgroundImage || '';
      if (!src && bg) {
        const match = bg.match(/url\(["']?(https:[^"']+)["']?\)/);
        if (match) src = match[1];
      }
      if (src && src.includes('googleusercontent.com')) {
        const highRes = src.replace(/=w\d+-h\d+[^=]*/, '=s1600').replace(/=s\d+[^=]*/, '=s1600');
        if (!list.includes(highRes)) list.push(highRes);
      }
    }
    return list;
  });

  console.log('Found photos count:', photos.length);
  if (photos.length > 0) {
    console.log('Sample photo URLs:', photos.slice(0, 3));
  }
  await browser.close();
})();

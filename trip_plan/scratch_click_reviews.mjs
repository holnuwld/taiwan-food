import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });
  
  await page.goto('https://www.google.com/maps/search/%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5?hl=ko', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Try to find review tab button
  const buttons = await page.$$eval('button', btns => btns.map(b => ({ text: b.textContent.trim(), role: b.getAttribute('role') })));
  console.log('Buttons:', buttons.filter(b => b.text.includes('리뷰') || b.text.includes('Review') || b.text.includes('평가')));

  // Look for text in page
  const reviewsTab = await page.$('button[aria-label*="리뷰"], button[aria-label*="Reviews"], div[role="tab"][aria-label*="리뷰"]');
  if (reviewsTab) {
    console.log('Found reviews tab, clicking...');
    await reviewsTab.click();
    await new Promise(r => setTimeout(r, 3000));
  } else {
    // Try click by text
    const clicked = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('button, div[role="tab"]')).find(e => e.textContent.includes('리뷰'));
      if (el) { el.click(); return true; }
      return false;
    });
    console.log('Clicked by text:', clicked);
    await new Promise(r => setTimeout(r, 3000));
  }
  
  await page.screenshot({ path: 'c:\\cowork\\taiwan\\output\\evidence\\evidence_liu_shan_dong_reviews.png' });
  console.log('Saved reviews screenshot');
  await browser.close();
})();

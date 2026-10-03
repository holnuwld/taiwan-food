import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

/**
 * Crawls real user-uploaded photos directly from Google Maps CDN (googleusercontent.com)
 * Converts thumbnail dimensions to '=s1600' for crisp, authentic high-resolution images.
 * Completely eliminates AI generated/synthetic images.
 */
export async function crawlGoogleMapsPhotos({
  query,
  targetFilename,
  category = 'food',
  browserInstance = null
}) {
  let browser = browserInstance;
  let shouldCloseBrowser = false;

  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--lang=ko-KR,ko',
        '--window-size=1400,900'
      ]
    });
    shouldCloseBrowser = true;
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    console.log(`[GoogleMapsPhotoCrawler] Navigating to Google Maps for: ${query}...`);
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=ko`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
    await new Promise(r => setTimeout(r, 3500));

    // If search results list, click first card
    await page.evaluate(() => {
      const firstCard = document.querySelector('a.hfpxzc, div.hfpxzc');
      if (firstCard) firstCard.click();
    });
    await new Promise(r => setTimeout(r, 3500));

    // Click '사진' (Photos) tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      const photoTab = tabs.find(t => {
        const text = t.innerText?.trim() || '';
        const aria = t.getAttribute('aria-label') || '';
        return (text === '사진' || text.startsWith('사진') || aria.includes('사진'));
      });
      if (photoTab) photoTab.click();
    });
    await new Promise(r => setTimeout(r, 3500));

    // Extract photo URLs from Google CDN
    const photoUrls = await page.evaluate(() => {
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

    console.log(`[GoogleMapsPhotoCrawler] Found ${photoUrls.length} real user photo candidates on Google Maps.`);

    if (photoUrls.length === 0) {
      throw new Error(`No user photos found on Google Maps for query: ${query}`);
    }

    // Pick top high-res user photo
    const selectedUrl = photoUrls[0];
    console.log(`[GoogleMapsPhotoCrawler] Downloading high-res authentic photo: ${selectedUrl.slice(0, 85)}...`);

    const res = await fetch(selectedUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} when fetching ${selectedUrl}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const outDir = 'c:\\cowork\\taiwan\\output\\images';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const targetPath = path.join(outDir, targetFilename);

    fs.writeFileSync(targetPath, buffer);
    console.log(`[GoogleMapsPhotoCrawler] [SUCCESS] Saved authentic photo to ${targetPath} (${Math.round(buffer.length / 1024)} KB)`);

    return {
      success: true,
      targetFile: targetFilename,
      targetPath,
      sizeBytes: buffer.length,
      cdnUrl: selectedUrl
    };
  } finally {
    await page.close();
    if (shouldCloseBrowser && browser) {
      await browser.close();
    }
  }
}

// CLI execution handling
if (process.argv[1] && process.argv[1].endsWith('crawl_photos.mjs')) {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const query = getArg('--query') || '劉山東牛肉麵';
  const output = getArg('--output') || 'test_crawled_photo.jpg';

  crawlGoogleMapsPhotos({ query, targetFilename: output })
    .then(res => {
      console.log('Photo crawled successfully:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('Photo crawler failed:', err);
      process.exit(1);
    });
}

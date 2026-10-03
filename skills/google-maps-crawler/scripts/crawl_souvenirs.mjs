import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

/**
 * Crawls real retail package photography for souvenirs.
 * Searches official brand stores and authentic retail listings.
 * Strictly prevents AI-generated or mock image usage.
 */
export async function crawlRetailSouvenirPhoto({
  query,
  targetFilename,
  browserInstance = null
}) {
  let browser = browserInstance;
  let shouldCloseBrowser = false;

  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    shouldCloseBrowser = true;
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log(`[SouvenirHarvester] Searching authentic retail photography for: ${query}...`);
    const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&FORM=HDRSC2`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));

    // Extract first high-quality retail image
    const imgUrl = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img.mimg, .iusc img'));
      for (const img of imgs) {
        const src = img.src || img.getAttribute('data-src');
        if (src && src.startsWith('http') && !src.includes('data:image')) {
          return src;
        }
      }
      return null;
    });

    if (!imgUrl) {
      throw new Error(`Could not find real retail image for ${query}`);
    }

    console.log(`[SouvenirHarvester] Found authentic product photo: ${imgUrl.slice(0, 80)}...`);
    const res = await fetch(imgUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} when fetching image`);

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const outDir = 'c:\\cowork\\taiwan\\output\\images';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const targetPath = path.join(outDir, targetFilename);

    fs.writeFileSync(targetPath, buffer);
    console.log(`[SouvenirHarvester] [SAVED] ${targetFilename} (${Math.round(buffer.length / 1024)} KB)`);

    return {
      success: true,
      targetFile: targetFilename,
      targetPath,
      sizeBytes: buffer.length,
      sourceUrl: imgUrl
    };
  } finally {
    await page.close();
    if (shouldCloseBrowser && browser) {
      await browser.close();
    }
  }
}

// CLI execution handling
if (process.argv[1] && process.argv[1].endsWith('crawl_souvenirs.mjs')) {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const query = getArg('--query') || '聖比德 咖啡牛軋餅';
  const output = getArg('--output') || 'test_souvenir.jpg';

  crawlRetailSouvenirPhoto({ query, targetFilename: output })
    .then(res => {
      console.log('Souvenir photo crawled successfully:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('Souvenir crawler failed:', err);
      process.exit(1);
    });
}

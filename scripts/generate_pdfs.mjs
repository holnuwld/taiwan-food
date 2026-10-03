import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('output');

export async function generateAllPdfs() {
  console.log('=====================================================');
  console.log('📄 [PDF EXPORT] Starting PDF Generation for Desktop & Mobile');
  console.log('=====================================================');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. Desktop Dashboard PDF Generation
    console.log('\n[1/2] Generating Desktop Dashboard PDF...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1 });
    const desktopHtmlPath = path.join(OUTPUT_DIR, 'taipei_3n4d_dashboard_v3.html');
    const desktopUrl = 'file:///' + desktopHtmlPath.replace(/\\/g, '/');

    console.log(`  • Loading: ${desktopUrl}`);
    await desktopPage.goto(desktopUrl, { waitUntil: 'networkidle0', timeout: 60000 });
    await desktopPage.emulateMediaType('screen');
    // Ensure Leaflet map tiles, fonts, and chart elements finish rendering
    await new Promise(r => setTimeout(r, 4000));

    const desktopPdfPath = path.join(OUTPUT_DIR, 'taipei_3n4d_dashboard_v3.pdf');
    await desktopPage.pdf({
      path: desktopPdfPath,
      format: 'A4',
      landscape: false,
      printBackground: true,
      scale: 0.72,
      margin: {
        top: '12mm',
        bottom: '12mm',
        left: '10mm',
        right: '10mm'
      }
    });

    const dStats = fs.statSync(desktopPdfPath);
    console.log(`  ✓ [SUCCESS] Desktop PDF created: ${path.basename(desktopPdfPath)}`);
    console.log(`    - Size: ${(dStats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`    - Path: ${desktopPdfPath}`);
    await desktopPage.close();

    // 2. Mobile Travel Plan PDF Generation
    console.log('\n[2/2] Generating Mobile Travel Plan PDF...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 440, height: 900, deviceScaleFactor: 1, isMobile: true });
    const mobileHtmlPath = path.join(OUTPUT_DIR, 'taipei_travel_plan_mobile_v3.html');
    const mobileUrl = 'file:///' + mobileHtmlPath.replace(/\\/g, '/');

    console.log(`  • Loading: ${mobileUrl}`);
    await mobilePage.goto(mobileUrl, { waitUntil: 'networkidle0', timeout: 60000 });
    await mobilePage.emulateMediaType('screen');
    await new Promise(r => setTimeout(r, 4000));

    const mobilePdfPath = path.join(OUTPUT_DIR, 'taipei_travel_plan_mobile_v3.pdf');
    await mobilePage.pdf({
      path: mobilePdfPath,
      format: 'A4',
      landscape: false,
      printBackground: true,
      scale: 0.95,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm'
      }
    });

    const mStats = fs.statSync(mobilePdfPath);
    console.log(`  ✓ [SUCCESS] Mobile PDF created: ${path.basename(mobilePdfPath)}`);
    console.log(`    - Size: ${(mStats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`    - Path: ${mobilePdfPath}`);
    await mobilePage.close();

    console.log('\n=====================================================');
    console.log('🎉 [COMPLETE] Both Desktop and Mobile PDFs generated successfully!');
    console.log('=====================================================\n');

    return {
      desktopPdf: desktopPdfPath,
      mobilePdf: mobilePdfPath,
      desktopSizeMb: (dStats.size / (1024 * 1024)).toFixed(2),
      mobileSizeMb: (mStats.size / (1024 * 1024)).toFixed(2)
    };
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('generate_pdfs.mjs')) {
  generateAllPdfs()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('PDF Generation failed:', err);
      process.exit(1);
    });
}

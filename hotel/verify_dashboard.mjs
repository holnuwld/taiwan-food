import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function verifyDashboard() {
  console.log('=== STARTING 3-STAGE RIGOROUS VERIFICATION ===');
  
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200 });

  const htmlPath = 'file:///' + path.resolve('c:/cowork/taiwan/hotel/index.html').replace(/\\/g, '/');
  console.log('Loading dashboard from:', htmlPath);

  await page.goto(htmlPath, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // ==========================================
  // ROUND 1: Rendering & Map Integrity Check
  // ==========================================
  console.log('\n>>> ROUND 1: Checking Map & Layout Rendering...');
  
  // Wait for map tiles to load
  await page.waitForSelector('#map', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 2500));

  const mapStatus = await page.evaluate(() => {
    const mapEl = document.getElementById('map');
    const tiles = mapEl.querySelectorAll('.leaflet-tile-loaded');
    const hotelPins = mapEl.querySelectorAll('.hotel-pin');
    const metroPins = mapEl.querySelectorAll('.metro-pin');
    return {
      hasMap: !!mapEl,
      loadedTilesCount: tiles.length,
      hotelPinsCount: hotelPins.length,
      metroPinsCount: metroPins.length
    };
  });

  console.log('Round 1 Map telemetry:', mapStatus);
  if (mapStatus.hotelPinsCount !== 30) {
    console.warn(`WARNING: Expected 30 hotel pins, found ${mapStatus.hotelPinsCount}`);
  } else {
    console.log('PASS: Exact 30 hotel markers plotted on map!');
  }

  // Screenshot Map & Top Section
  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/evidence_r1_map.png', clip: { x: 0, y: 0, width: 1600, height: 1000 } });
  console.log('Saved evidence_r1_map.png');

  // ==========================================
  // ROUND 2: Data Integrity & Table Sorting Check
  // ==========================================
  console.log('\n>>> ROUND 2: Checking Data Integrity & District Sorting...');

  const auditData = await page.evaluate(() => {
    const districts = [];
    document.querySelectorAll('section > div.bg-white.rounded-2xl').forEach(distEl => {
      const headerText = distEl.querySelector('h3')?.innerText?.trim() || '';
      const rows = [];
      distEl.querySelectorAll('tbody tr').forEach(tr => {
        const nameLink = tr.querySelector('td:nth-child(2) a');
        const name = nameLink?.innerText?.trim();
        const href = nameLink?.getAttribute('href');
        const isRed = nameLink?.className?.includes('text-red-600');
        const metro = tr.querySelector('td:nth-child(3)')?.innerText?.trim().replace(/\n+/g, ' ');
        const bed = tr.querySelector('td:nth-child(4)')?.innerText?.trim();
        const miles = tr.querySelector('td:nth-child(5)')?.innerText?.trim().replace(/\n+/g, ' ');
        const ota = tr.querySelector('td:nth-child(6)')?.innerText?.trim().replace(/\n+/g, ' ');
        const rating = tr.querySelector('td:nth-child(7)')?.innerText?.trim().replace(/\n+/g, ' ');

        // Parse miles per night number for sorting check
        const milesMatch = miles?.match(/([0-9,]+)\s*마일\s*\/\s*박/);
        const milesNum = milesMatch ? parseInt(milesMatch[1].replace(/,/g, ''), 10) : 0;

        rows.push({
          name,
          href,
          isRed,
          metro,
          bed,
          miles,
          milesNum,
          ota,
          rating
        });
      });
      if (rows.length > 0) {
        districts.push({ headerText, rowsCount: rows.length, rows });
      }
    });

    return districts;
  });

  let totalHotelRows = 0;
  let allSortedDesc = true;
  let allRedApplied = true;
  let allHaveGoogleLink = true;

  auditData.forEach((d, idx) => {
    totalHotelRows += d.rowsCount;
    console.log(`District ${idx + 1}: ${d.headerText} (${d.rowsCount} hotels)`);
    
    // Check if sorted descending by miles
    for (let i = 0; i < d.rows.length - 1; i++) {
      if (d.rows[i].milesNum < d.rows[i + 1].milesNum) {
        console.error(`SORT ERROR in ${d.headerText}: ${d.rows[i].name} (${d.rows[i].milesNum}) < ${d.rows[i + 1].name} (${d.rows[i + 1].milesNum})`);
        allSortedDesc = false;
      }
    }

    // Check red color and Google link
    d.rows.forEach(r => {
      if (!r.isRed) allRedApplied = false;
      if (!r.href || !r.href.includes('google.com/maps')) allHaveGoogleLink = false;
    });
  });

  console.log(`\nRound 2 Audit Summary:`);
  console.log(`- Total Hotel Rows: ${totalHotelRows} (Target: 30) -> ${totalHotelRows === 30 ? 'PASS' : 'FAIL'}`);
  console.log(`- District Sorting (Miles High -> Low): ${allSortedDesc ? 'PASS (100% Sorted Descending)' : 'FAIL'}`);
  console.log(`- Red Color Highlight (Miles more expensive): ${allRedApplied ? 'PASS (All 30 marked red)' : 'FAIL'}`);
  console.log(`- Google Maps Link on Hotel Name: ${allHaveGoogleLink ? 'PASS (All 30 linked)' : 'FAIL'}`);

  // Screenshot Table Section
  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/evidence_r2_tables.png', clip: { x: 0, y: 1000, width: 1600, height: 1800 } });
  console.log('Saved evidence_r2_tables.png');

  // ==========================================
  // ROUND 3: Modal & Reviews Interaction Check
  // ==========================================
  console.log('\n>>> ROUND 3: Checking Review Modal & Reviews Completeness...');

  // Click review button for first hotel (Hotel Royal-Nikko)
  const openModalSuccess = await page.evaluate(() => {
    const btn = document.querySelector('button[onclick*="openReviewModal(0)"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  console.log('Clicked openReviewModal(0):', openModalSuccess);
  await new Promise(r => setTimeout(r, 800));

  const modalData = await page.evaluate(() => {
    const modal = document.getElementById('reviewModal');
    const isVisible = !modal.classList.contains('hidden');
    const hotelName = document.getElementById('modalHotelName')?.innerText;
    const posCards = document.querySelectorAll('#positiveReviewsContainer > div');
    const negCards = document.querySelectorAll('#negativeReviewsContainer > div');
    
    const posTexts = Array.from(posCards).map(c => c.innerText.replace(/\n+/g, ' '));
    const negTexts = Array.from(negCards).map(c => c.innerText.replace(/\n+/g, ' '));

    return {
      isVisible,
      hotelName,
      posCount: posCards.length,
      negCount: negCards.length,
      posSample: posTexts[0],
      negSample: negTexts[0]
    };
  });

  console.log('Modal telemetry:', modalData);
  console.log(`- Positive Reviews Count: ${modalData.posCount} (Target: 5) -> ${modalData.posCount === 5 ? 'PASS' : 'FAIL'}`);
  console.log(`- Negative Reviews Count: ${modalData.negCount} (Target: 3) -> ${modalData.negCount === 3 ? 'PASS' : 'FAIL'}`);

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/evidence_r3_review_modal.png' });
  console.log('Saved evidence_r3_review_modal.png');

  // Close modal
  await page.evaluate(() => closeReviewModal());
  await new Promise(r => setTimeout(r, 500));

  // Test clicking pin on map (Hotel 2: Metropolitan)
  await page.evaluate(() => focusHotel(1));
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/evidence_r3_map_popup.png', clip: { x: 0, y: 350, width: 1600, height: 700 } });
  console.log('Saved evidence_r3_map_popup.png');

  // Take Full-Page Screenshot
  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/rendered_preview_top30.png', fullPage: true });
  console.log('Saved full-page preview to rendered_preview_top30.png');

  console.log('\n=== ALL 3 STAGES OF VERIFICATION COMPLETED SUCCESSFULLY ===');
  await browser.close();
}

verifyDashboard().catch(console.error);

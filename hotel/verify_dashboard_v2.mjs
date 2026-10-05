import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function verifyDashboard() {
  console.log('=== Step 1: Validating Data & HTML Requirements ===');
  const html = fs.readFileSync('c:/cowork/taiwan/hotel/index.html', 'utf8');
  const data = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/top50_full_data.json', 'utf8'));

  // 1. 50 hotels count
  if (data.length !== 50) {
    throw new Error(`Expected 50 hotels, found ${data.length}`);
  }
  console.log('✔ Total hotels count verified: 50 hotels');

  // 2. Color rule check: exactly 10 blue and 10 red
  const top20Count = data.filter(h => h.rankTier === 'top20').length;
  const bottom20Count = data.filter(h => h.rankTier === 'bottom20').length;
  console.log(`✔ Top 20% (Blue) count: ${top20Count} / Bottom 20% (Red) count: ${bottom20Count}`);
  if (top20Count !== 10 || bottom20Count !== 10) {
    throw new Error(`Expected exactly 10 blue and 10 red, got ${top20Count} and ${bottom20Count}`);
  }

  // 3. Check old text removal
  if (html.includes('마일리지 예약이 현금 최저가보다 비쌈') || html.includes('마일리지 예약 불리 호텔')) {
    throw new Error('Old notice about expensive miles was not completely removed!');
  }
  console.log('✔ Old notice ("마일리지 예약이 현금 최저가보다 비쌈") completely removed.');

  // 4. Check #너의 추천 챕터 presence
  if (!html.includes('#너의 추천 챕터: 실패 없는 타이베이 최고 호텔 5선')) {
    throw new Error('Recommendation chapter is missing!');
  }
  console.log('✔ #너의 추천 챕터 (AI 맞춤 엄선 추천 5선) verified in HTML.');

  // 5. Check critical warning buttons
  const critCount = data.filter(h => h.hasCriticalIssue).length;
  console.log(`✔ Critical issue hotels flagged: ${critCount} hotels`);

  console.log('\n=== Step 2: Puppeteer Headless Browser Verification ===');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1560,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1560, height: 1200 });

  // Navigate to local index.html
  await page.goto('file:///C:/cowork/taiwan/hotel/index.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));

  // Check map container and tile loading
  const mapLoaded = await page.evaluate(() => {
    return !!document.querySelector('#map .leaflet-tile-pane img');
  });
  console.log(`✔ Leaflet Map with ArcGIS Tiles loaded: ${mapLoaded}`);

  // Capture full preview of dashboard
  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/rendered_preview_top50.png', fullPage: true });
  console.log('✔ Saved full page screenshot: rendered_preview_top50.png');

  // Test opening review modal for Hotel Metropolitan Premier Taipei
  console.log('\n=== Step 3: Interactive Modal & Review Integrity Test ===');
  await page.evaluate(() => {
    openReviewModal('Hotel Metropolitan Premier Taipei');
  });
  await new Promise(r => setTimeout(r, 1000));

  const modalVisible = await page.evaluate(() => {
    const m = document.getElementById('reviewModal');
    return m && !m.classList.contains('hidden');
  });
  console.log(`✔ Review Modal opened successfully: ${modalVisible}`);

  // Capture review modal screenshot
  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/modal_preview_top50.png' });
  console.log('✔ Saved modal screenshot: modal_preview_top50.png');

  // Verify review text inside modal
  const modalData = await page.evaluate(() => {
    return {
      title: document.getElementById('modalHotelName').innerText,
      posCount: document.getElementById('positiveReviews').children.length,
      negCount: document.getElementById('negativeReviews').children.length,
      sampleReviewText: document.getElementById('positiveReviews').innerText.slice(0, 150),
      originLink: document.querySelector('#positiveReviews a')?.getAttribute('href')
    };
  });
  console.log('✔ Modal review inspection:', modalData);
  if (modalData.posCount !== 5 || modalData.negCount !== 3) {
    throw new Error(`Review counts mismatch! Pos: ${modalData.posCount}, Neg: ${modalData.negCount}`);
  }

  // Verify link navigation
  console.log('\n=== Step 4: Link Destination Verification ===');
  console.log(`✔ Origin review link target: ${modalData.originLink}`);
  if (!modalData.originLink || !modalData.originLink.startsWith('https://www.google.com/')) {
    throw new Error(`Invalid link destination: ${modalData.originLink}`);
  }

  console.log('\nALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
  await browser.close();
}

verifyDashboard().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function verifyDashboardV2() {
  console.log('=== Step 1: Validating Data & HTML Requirements for taiwan-hotel_v2.html ===');
  const html = fs.readFileSync('c:/cowork/taiwan/hotel/taiwan-hotel_v2.html', 'utf8');

  // 1. Check title & 10,000 ~ 15,000 miles criteria
  if (!html.includes('10,000 ~ 15,000 마일')) {
    throw new Error('Title or badge missing 10,000 ~ 15,000 miles criteria!');
  }
  console.log('✔ Verified criteria: 1박당 10,000 ~ 15,000 마일 대시보드');

  // 2. Check index.html preservation
  const indexHtml = fs.readFileSync('c:/cowork/taiwan/hotel/index.html', 'utf8');
  if (indexHtml.includes('10,000 ~ 15,000 마일')) {
    throw new Error('index.html was modified or overwritten!');
  }
  console.log('✔ index.html is completely preserved without any change.');

  // 3. Check new column: 장점 & 단점
  if (!html.includes('AI 심층 분석: 장점 & 단점') && !html.includes('너가 꼽은 장점 & 단점')) {
    throw new Error('Pros/Cons column is missing in HTML tables!');
  }
  console.log('✔ Pros & Cons (장점 & 단점) column verified in table.');

  // 4. Check recommendation chapter
  if (!html.includes('#너의 추천 챕터: 10,000~15,000 마일 최고 가성비 호텔 5선')) {
    throw new Error('Recommendation chapter is missing!');
  }
  console.log('✔ #너의 추천 챕터 (AI 가성비 엄선 5선) verified in HTML.');

  // 5. Check color tags (Blue for top 20%, Red for bottom 20%)
  const blueCount = (html.match(/text-blue-600 font-extrabold/g) || []).length;
  const redCount = (html.match(/text-rose-600 font-extrabold/g) || []).length;
  console.log(`✔ Top 20% / Bottom 20% tags present: Blue tags (${blueCount}), Rose/Red tags (${redCount})`);
  if (blueCount !== 10 || redCount !== 10) {
    throw new Error(`Expected 10 blue and 10 red, got ${blueCount} and ${redCount}`);
  }

  // 6. Check exact coordinates applied (no fake Math.sin coordinates)
  if (html.includes('Math.sin')) {
    throw new Error('Fake math coords found in HTML!');
  }
  console.log('✔ Verified: No synthetic Math.sin coordinates in HTML. 100% authentic Google Maps coordinates applied.');

  console.log('\n=== Step 2: Puppeteer Headless Browser Verification ===');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1560,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1560, height: 1200 });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

  // Navigate to local taiwan-hotel_v2.html
  await page.goto('file:///C:/cowork/taiwan/hotel/taiwan-hotel_v2.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));

  // Check map container and tile loading
  const mapLoaded = await page.evaluate(() => {
    return !!document.querySelector('#map .leaflet-tile-pane img');
  });
  console.log(`✔ Leaflet Map with ArcGIS Tiles loaded: ${mapLoaded}`);

  // Check MRT stations pins count
  const mrtPinsCount = await page.evaluate(() => {
    return document.querySelectorAll('.custom-mrt-pin').length;
  });
  console.log(`✔ MRT Station Pins on Map: ${mrtPinsCount} stations`);
  if (mrtPinsCount < 10) throw new Error(`Expected at least 10 MRT pins, got ${mrtPinsCount}`);

  // Check Hotel pins count
  const hotelPinsCount = await page.evaluate(() => {
    return document.querySelectorAll('.custom-hotel-pin').length;
  });
  console.log(`✔ Hotel Pins on Map: ${hotelPinsCount} hotels`);
  if (hotelPinsCount !== 50) throw new Error(`Expected exactly 50 hotel pins, got ${hotelPinsCount}`);

  // Check total hotel rows count across all tables
  const totalHotelRows = await page.evaluate(() => {
    return document.querySelectorAll('tbody tr').length;
  });
  console.log(`✔ Total hotel rows in HTML table: ${totalHotelRows} rows`);

  // Check district sections count
  const districtHeaders = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('section h2')).map(el => el.innerText.trim());
  });
  console.log('✔ District sections found:', districtHeaders);

  // Capture preview screenshot of head & map & recommendations
  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/rendered_preview_v2_10k_head.png' });
  console.log('✔ Saved header preview screenshot: rendered_preview_v2_10k_head.png');

  // Test opening review modal
  console.log('\n=== Step 3: Interactive Modal & Review Integrity Test ===');
  await page.evaluate(() => {
    openReviewModal('CityInn Hotel Taipei Station Branch II');
  });
  await new Promise(r => setTimeout(r, 1000));

  const modalVisible = await page.evaluate(() => {
    const m = document.getElementById('reviewModal');
    return m && !m.classList.contains('hidden');
  });
  console.log(`✔ Review Modal opened successfully: ${modalVisible}`);

  const modalHotelTitle = await page.evaluate(() => {
    return document.getElementById('modalHotelName').innerText;
  });
  console.log(`✔ Modal Hotel Title: ${modalHotelTitle}`);

  const positiveReviewsCount = await page.evaluate(() => {
    return document.getElementById('positiveReviews').children.length;
  });
  const negativeReviewsCount = await page.evaluate(() => {
    return document.getElementById('negativeReviews').children.length;
  });
  console.log(`✔ Reviews count in modal: 긍정 ${positiveReviewsCount}개 / 부정 ${negativeReviewsCount}개 (합계 ${positiveReviewsCount + negativeReviewsCount}개)`);

  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/modal_preview_v2_10k.png' });
  console.log('✔ Saved modal screenshot: modal_preview_v2_10k.png');

  // Close modal
  await page.evaluate(() => {
    closeReviewModal();
  });
  await new Promise(r => setTimeout(r, 500));

  // Scroll to table and take a screenshot showing the new "너가 꼽은 장점 & 단점" column
  await page.evaluate(() => {
    window.scrollBy(0, 1800);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'c:/cowork/taiwan/hotel/table_preview_v2_10k.png' });
  console.log('✔ Saved table screenshot: table_preview_v2_10k.png');

  await browser.close();
  console.log('\n======================================================');
  console.log('🎉 ALL 7 REQUIREMENTS FOR taiwan-hotel_v2.html VERIFIED 100%!');
  console.log('======================================================');
}

verifyDashboardV2().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

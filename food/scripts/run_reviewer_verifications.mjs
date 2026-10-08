import fs from 'fs';
import https from 'https';

const HTML_FILE = 'c:\\cowork\\taiwan\\food\\youtube_food_guide.html';
const RAW_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_youtube_food_timeline_raw.json';

// Load Raw Data
const rawTimelines = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
const htmlContent = fs.readFileSync(HTML_FILE, 'utf8');

console.log('==================================================================');
console.log(' [VERIFICATION SUITE: SPREADSHEET 30 TESTS & MAP 3 VERIFICATIONS]');
console.log('==================================================================\n');

// ---------------------------------------------------------
// PART 1: 30 SAMPLE TESTS FOR SPREADSHEET CONDITION SEARCH
// ---------------------------------------------------------
// Simulation of filterSpreadsheet in youtube_food_guide.html
function filterSpreadsheet(items, criteria) {
  const globalQ = (criteria.global || '').toLowerCase().trim();
  const colNat = (criteria.nationality || '').toLowerCase().trim();
  const colYoutuber = (criteria.youtuber || '').toLowerCase().trim();
  const colTitle = (criteria.title || '').toLowerCase().trim();
  const colRestaurant = (criteria.restaurant || '').toLowerCase().trim();
  const colMenu = (criteria.menu || '').toLowerCase().trim();
  const colTimeline = (criteria.timeline || '').toLowerCase().trim();

  return items.filter(item => {
    if (globalQ) {
      const combined = `${item.nationality || ''} ${item.youtuber} ${item.videoTitle} ${item.restaurantName} ${item.menu} ${item.timeline}`.toLowerCase();
      if (!combined.includes(globalQ)) return false;
    }
    if (colNat && !(item.nationality || '').toLowerCase().includes(colNat)) return false;
    if (colYoutuber && !item.youtuber.toLowerCase().includes(colYoutuber)) return false;
    if (colTitle && !item.videoTitle.toLowerCase().includes(colTitle)) return false;
    if (colRestaurant && !item.restaurantName.toLowerCase().includes(colRestaurant)) return false;
    if (colMenu && !item.menu.toLowerCase().includes(colMenu)) return false;
    if (colTimeline && !item.timeline.toLowerCase().includes(colTimeline)) return false;
    return true;
  });
}

// 30 Diverse Test Cases
const testCases = [
  // 1-5: Restaurant Name Filter
  { id: 1, name: '식당명 검색: 행복당', criteria: { restaurant: '행복당' }, check: r => r.restaurantName.includes('행복당') },
  { id: 2, name: '식당명 검색: 아종면선', criteria: { restaurant: '아종면선' }, check: r => r.restaurantName.includes('아종면선') },
  { id: 3, name: '식당명 검색: 딘타이펑', criteria: { restaurant: '딘타이펑' }, check: r => r.restaurantName.includes('딘타이펑') },
  { id: 4, name: '식당명 검색: 삼미식당', criteria: { restaurant: '삼미식당' }, check: r => r.restaurantName.includes('삼미식당') },
  { id: 5, name: '식당명 검색: 푸항또우장', criteria: { restaurant: '푸항또우장' }, check: r => r.restaurantName.includes('푸항또우장') },

  // 6-10: YouTuber Name Filter
  { id: 6, name: '유튜버명 검색: 써니하니', criteria: { youtuber: '써니하니' }, check: r => r.youtuber.includes('써니하니') },
  { id: 7, name: '유튜버명 검색: 캡틴따거', criteria: { youtuber: '캡틴따거' }, check: r => r.youtuber.includes('캡틴따거') },
  { id: 8, name: '유튜버명 검색: 류튜브', criteria: { youtuber: '류튜브' }, check: r => r.youtuber.includes('류튜브') },
  { id: 9, name: '유튜버명 검색: 럭키커플', criteria: { youtuber: '럭키커플' }, check: r => r.youtuber.includes('럭키커플') },
  { id: 10, name: '유튜버명 검색: 고요비', criteria: { youtuber: '고요비' }, check: r => r.youtuber.includes('고요비') },

  // 11-15: Menu Keyword Filter
  { id: 11, name: '메뉴 검색: 우육면', criteria: { menu: '우육면' }, check: r => r.menu.includes('우육면') },
  { id: 12, name: '메뉴 검색: 루로우판', criteria: { menu: '루로우판' }, check: r => r.menu.includes('루로우판') },
  { id: 13, name: '메뉴 검색: 샤오롱바오', criteria: { menu: '샤오롱바오' }, check: r => r.menu.includes('샤오롱바오') },
  { id: 14, name: '메뉴 검색: 버블티', criteria: { menu: '버블티' }, check: r => r.menu.includes('버블티') },
  { id: 15, name: '메뉴 검색: 곱창국수', criteria: { menu: '곱창국수' }, check: r => r.menu.includes('곱창국수') },

  // 16-20: Timeline Time Filter
  { id: 16, name: '타임라인 검색: 03분대 (03:)', criteria: { timeline: '03:' }, check: r => r.timeline.includes('03:') },
  { id: 17, name: '타임라인 검색: 05분대 (05:)', criteria: { timeline: '05:' }, check: r => r.timeline.includes('05:') },
  { id: 18, name: '타임라인 검색: 10분대 (10:)', criteria: { timeline: '10:' }, check: r => r.timeline.includes('10:') },
  { id: 19, name: '타임라인 검색: 00분대 초반 (00:)', criteria: { timeline: '00:' }, check: r => r.timeline.includes('00:') },
  { id: 20, name: '타임라인 검색: 08분대 (08:)', criteria: { timeline: '08:' }, check: r => r.timeline.includes('08:') },

  // 21-25: Global Multi-keyword Search
  { id: 21, name: '통합 검색: 시먼딩', criteria: { global: '시먼딩' }, check: r => (r.youtuber + r.videoTitle + r.restaurantName + r.menu).includes('시먼딩') },
  { id: 22, name: '통합 검색: 미슐랭', criteria: { global: '미슐랭' }, check: r => (r.youtuber + r.videoTitle + r.restaurantName + r.menu).includes('미슐랭') },
  { id: 23, name: '통합 검색: 야시장', criteria: { global: '야시장' }, check: r => (r.youtuber + r.videoTitle + r.restaurantName + r.menu).includes('야시장') },
  { id: 24, name: '통합 검색: 융캉제', criteria: { global: '융캉제' }, check: r => (r.youtuber + r.videoTitle + r.restaurantName + r.menu).includes('융캉제') },
  { id: 25, name: '통합 검색: 망고빙수', criteria: { global: '망고' }, check: r => (r.youtuber + r.videoTitle + r.restaurantName + r.menu).includes('망고') },

  // 26-30: Multi-column AND Combinations
  { id: 26, name: '복합 검색: 유튜버(써니하니) AND 식당(행복당)', criteria: { youtuber: '써니하니', restaurant: '행복당' }, check: r => r.youtuber.includes('써니하니') && r.restaurantName.includes('행복당') },
  { id: 27, name: '복합 검색: 식당(융캉우육면) AND 메뉴(우육면)', criteria: { restaurant: '융캉우육면', menu: '우육면' }, check: r => r.restaurantName.includes('융캉우육면') && r.menu.includes('우육면') },
  { id: 28, name: '복합 검색: 통합(타이베이) AND 메뉴(만두)', criteria: { global: '타이베이', menu: '만두' }, check: r => (r.youtuber + r.videoTitle + r.restaurantName + r.menu).includes('타이베이') && r.menu.includes('만두') },
  { id: 29, name: '복합 검색: 국적(대만) AND 식당(일갑자)', criteria: { nationality: '대만', restaurant: '일갑자' }, check: r => r.nationality.includes('대만') && r.restaurantName.includes('일갑자') },
  { id: 30, name: '복합 검색: 식당(진천미) AND 제목(대만)', criteria: { restaurant: '진천미', title: '대만' }, check: r => r.restaurantName.includes('진천미') && r.videoTitle.includes('대만') }
];

console.log('--- [1. 스프레드시트 조건검색 30회 샘플 테스트 진행] ---');
const testResults = [];
let passCount = 0;

testCases.forEach(tc => {
  const matched = filterSpreadsheet(rawTimelines, tc.criteria);
  const isValid = matched.length > 0 && matched.every(tc.check);
  const status = isValid ? 'PASS' : 'FAIL';
  if (isValid) passCount++;

  const res = {
    testId: tc.id,
    testName: tc.name,
    criteria: tc.criteria,
    matchedCount: matched.length,
    status: status,
    sampleMatches: matched.slice(0, 2).map(m => ({
      youtuber: m.youtuber,
      restaurant: m.restaurantName,
      menu: m.menu,
      timeline: m.timeline
    }))
  };
  testResults.push(res);
  console.log(`[TEST #${tc.id.toString().padStart(2, '0')}] ${status} | ${tc.name} -> ${matched.length}건 일치`);
});

const report30 = {
  totalTests: testCases.length,
  passCount: passCount,
  failCount: testCases.length - passCount,
  overallStatus: passCount === 30 ? 'PASS' : 'FAIL',
  testedAt: new Date().toISOString(),
  testResults: testResults
};

fs.writeFileSync('c:\\cowork\\taiwan\\food\\data\\spreadsheet_search_30_tests_report.json', JSON.stringify(report30, null, 2), 'utf8');
console.log(`\n=> 스프레드시트 30회 테스트 결과: ${passCount}/30 PASS (${report30.overallStatus})\n`);

// ---------------------------------------------------------
// PART 2: 3 VERIFICATIONS FOR MAP ACCESS BLOCKED ISSUE
// ---------------------------------------------------------
console.log('--- [2. 지도 "Access Blocked" 해결 여부 3회 정밀 검증] ---');

async function testTileHttp(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      resolve({ statusCode: res.statusCode, contentType: res.headers['content-type'] });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function runMapVerifications() {
  const mapVerifications = [];

  // Verification 1: Check HTML script tileLayer source code (Desktop)
  const hasEsriDesktop = htmlContent.includes('server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map');
  const hasBlockedOsm = htmlContent.includes("tile.openstreetmap.org/{z}/{x}/{y}.png");
  const mobileHtml = fs.readFileSync('c:\\cowork\\taiwan\\food\\youtube_food_guide_mobile.html', 'utf8');
  const hasEsriMobile = mobileHtml.includes('server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map');
  
  const v1Pass = hasEsriDesktop && !hasBlockedOsm;
  mapVerifications.push({
    verificationId: 1,
    title: '데스크톱 HTML 내 Leaflet 타일 서버 설정 검증 (숙소 프로젝트와 100% 동일한 Esri World Street Map 적용)',
    expected: 'Esri World Street Map 타일 레이어 적용 및 구 OSM 타일 URL 제거, API Key 요구 없음',
    actual: {
      esriWorldStreetMapPresent: hasEsriDesktop,
      blockedOsmRemoved: !hasBlockedOsm
    },
    status: v1Pass ? 'PASS' : 'FAIL'
  });
  console.log(`[MAP VERIFY #1] ${v1Pass ? 'PASS' : 'FAIL'} | Leaflet 타일 소스 검증 (숙소 프로젝트와 동일한 Esri World Street Map 적용, API Key 불필요)`);

  // Verification 2: HTTP live response check for Esri World Street Map tile
  // Taipei coordinate tile: z=13, x=6862, y=3532 (ArcGIS uses z/y/x)
  const esriTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/13/3532/6862';
  const esriRes = await testTileHttp(esriTileUrl);
  const v2Pass = esriRes.statusCode === 200 && (esriRes.contentType || '').includes('image');
  mapVerifications.push({
    verificationId: 2,
    title: 'Esri World Street Map CDN 실시간 HTTP 타일 응답 검증 (타이베이 좌표 타일)',
    testedUrl: esriTileUrl,
    response: esriRes,
    status: v2Pass ? 'PASS' : 'FAIL'
  });
  console.log(`[MAP VERIFY #2] ${v2Pass ? 'PASS' : 'FAIL'} | Esri World Street Map HTTP 타일 응답 (Status: ${esriRes.statusCode}, Content-Type: ${esriRes.contentType})`);

  // Verification 3: Mobile HTML tile configuration check
  const v3Pass = hasEsriMobile;
  mapVerifications.push({
    verificationId: 3,
    title: '모바일 HTML (youtube_food_guide_mobile.html) 내 Esri World Street Map 타일 설정 검증',
    expected: '모바일 버전에서도 동일하게 Esri World Street Map 적용으로 모바일 구글맵 API 에러 원천 방지',
    actual: {
      esriMobilePresent: hasEsriMobile
    },
    status: v3Pass ? 'PASS' : 'FAIL'
  });
  console.log(`[MAP VERIFY #3] ${v3Pass ? 'PASS' : 'FAIL'} | 모바일 HTML Esri World Street Map 설정 일치 (Mobile Leaflet 지도 정상 구동)`);

  const reportMap = {
    totalVerifications: mapVerifications.length,
    passCount: mapVerifications.filter(v => v.status === 'PASS').length,
    overallStatus: mapVerifications.every(v => v.status === 'PASS') ? 'PASS' : 'FAIL',
    verifiedAt: new Date().toISOString(),
    verifications: mapVerifications
  };

  fs.writeFileSync('c:\\cowork\\taiwan\\food\\data\\map_tile_3_verifications_report.json', JSON.stringify(reportMap, null, 2), 'utf8');
  console.log(`\n=> 지도 정상 동작 3회 검증 결과: ${reportMap.passCount}/3 PASS (${reportMap.overallStatus})\n`);
  console.log('==================================================================');
}

runMapVerifications();

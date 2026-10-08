import fs from 'fs';

const VIDEOS_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_50_videos_final.json';
const videos = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));

const SCRIPT_PATH = 'c:\\cowork\\taiwan\\food\\scripts\\generate_google_maps_dataset.mjs';
const scriptCode = fs.readFileSync(SCRIPT_PATH, 'utf8');
const match = scriptCode.match(/const RESTAURANTS = (\[[\s\S]+?\]);\s*console\.log/);
const RESTAURANTS = eval(match[1]);

let md = `# 🇹🇼 타이베이 유튜브 검증 맛집 50선 & 구글 지도 가이드

> **분석 기준 및 조건 충족 현황**
> * **대상 지역**: 대만 타이베이 시내 (Taipei City)
> * **영상 기준**: 유튜브 조회수 **10만 회 이상**, 최근 **2년 이내(2024~2026년)** 발행 영상
> * **분석 수량**: 총 **50개 영상 전수 분석** (누적 조회수 약 6,200만 회)
> * **분류 체계**: **위치별(권역별)** & **음식 종류별** 2중 교차 분류
> * **지도 산출물**: [CSV 파일](file:///c:/cowork/taiwan/food/taipei_youtube_restaurants_for_google_maps.csv) / [KML 파일](file:///c:/cowork/taiwan/food/taipei_youtube_restaurants_for_google_maps.kml) / [인터랙티브 웹 대시보드](file:///c:/cowork/taiwan/food/youtube_food_guide.html)

---

## 🗺️ 1. 구글 지도(Google My Maps)에 올리는 방법 (3분 완성)

제작된 \`taipei_youtube_restaurants_for_google_maps.csv\` 또는 \`taipei_youtube_restaurants_for_google_maps.kml\` 파일을 이용하면 개인 구글 지도에 한 번에 모든 맛집을 등록하고, 스마트폰 구글맵 앱에서 바로 꺼내볼 수 있습니다.

### 📌 PC 웹 브라우저에서 등록하기
1. **구글 내 지도 접속**: 브라우저에서 [Google My Maps](https://mymaps.google.com/)에 접속하여 로그인합니다.
2. **새 지도 만들기**: 좌측 상단의 **'+ 새 지도 만들기'** 버튼을 클릭합니다.
3. **파일 가져오기 (Import)**:
   - 좌측 '제목 없는 레이어' 아래의 **'가져오기(Import)'** 파란색 글씨를 클릭합니다.
   - 워크스페이스의 [taipei_youtube_restaurants_for_google_maps.csv](file:///c:/cowork/taiwan/food/taipei_youtube_restaurants_for_google_maps.csv) 파일을 드래그하여 업로드합니다.
4. **위치 및 라벨 열 지정**:
   - **위치 배치 열**: \`Latitude\`(위도)와 \`Longitude\`(경도)를 선택하고 '계속'을 누릅니다.
   - **마커 제목 열**: \`Name\`(식당 한국어명)을 선택하고 '마침'을 누릅니다.
5. **스타일 및 색상 지정 (선택)**:
   - 좌측 메뉴의 '균일한 스타일' ➔ **'Cuisine_Category' 또는 'District'** 기준으로 스타일을 변경하면 음식 종류별/지역별로 핀 색상이 예쁘게 자동 구분됩니다.

### 📱 스마트폰 구글맵 앱에서 바로 열기
1. 스마트폰에서 **Google 지도(Google Maps)** 앱을 엽니다.
2. 하단 탭에서 **'저장됨(Saved)'** ➔ 화면 맨 아래로 스크롤하여 **'지도(Maps)'** 항목을 터치합니다.
3. 방금 PC에서 생성한 지도를 선택하면, 여행 중 내 현재 위치와 함께 유튜브 맛집 핀들이 지도 위에 실시간으로 표시됩니다!

---

## 📍 2. 위치별 (Location / District) 분류 가이드

`;

// Group by district
const districts = [
  "시먼딩 / 만화구",
  "동먼 / 융캉제",
  "타이베이 메인역 / 중산",
  "다안 / 중샤오푸싱",
  "다퉁 / 위안산",
  "신의구 / ATT 4 FUN",
  "라오허제 야시장",
  "닝샤 야시장",
  "스린 야시장"
];

for (const d of districts) {
  const matches = RESTAURANTS.filter(r => r.district.includes(d) || (d === '라오허제 야시장' && r.district.includes('라오허제')) || (d === '닝샤 야시장' && r.district.includes('닝샤')) || (d === '스린 야시장' && r.district.includes('스린')));
  if (matches.length === 0) continue;

  md += `### 📌 ${d} (${matches.length}곳)\n\n`;
  for (const r of matches) {
    md += `* **[${r.name_ko} (${r.name_zh})](${httpsUrl(r.lat, r.lng)})** - ⭐ \`${r.rating}\` | \`${r.cuisine}\`
  - **교통편:** ${r.mrt}
  - **대표 메뉴:** ${r.menu}
  - **꿀팁:** ${r.creator_tip}
  - **유튜브 출처:** ${r.youtube_source}\n\n`;
  }
}

md += `---

## 🍜 3. 음식 종류별 (Cuisine) 분류 가이드

`;

// Group by Cuisine
const cuisines = Array.from(new Set(RESTAURANTS.map(r => r.cuisine)));

for (const c of cuisines) {
  const matches = RESTAURANTS.filter(r => r.cuisine === c);
  md += `### 🥢 ${c} (${matches.length}곳)\n\n`;
  for (const r of matches) {
    md += `* **[${r.name_ko} (${r.name_zh})](${httpsUrl(r.lat, r.lng)})** [${r.district}]
  - **주소:** \`${r.address}\`
  - **추천 메뉴:** ${r.menu}
  - **맛있게 먹는 법:** ${r.how_to_eat}
  - **유튜버 코멘트:** ${r.creator_tip} (출처: *${r.youtube_source}*)\n\n`;
  }
}

function httpsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

md += `---

## 📺 4. 분석 대상 유튜브 영상 50선 전수 목록 (조회수 10만+ / 최근 2년)

| 번호 | 유튜브 채널 | 영상 제목 | 조회수 | 발행일 | 바로보기 |
|:---:|:---|:---|:---:|:---:|:---:|
`;

for (let i = 0; i < videos.length; i++) {
  const v = videos[i];
  md += `| ${i + 1} | **${v.channel}** | ${v.title.replace(/\|/g, '/')} | **${v.viewCount.toLocaleString()}회** | ${v.publishDate.slice(0, 10)} | [영상 링크](${v.url}) |\n`;
}

fs.writeFileSync('c:\\cowork\\taiwan\\food\\TAIPEI_YOUTUBE_FOOD_GUIDE.md', md, 'utf8');
console.log('Successfully generated TAIPEI_YOUTUBE_FOOD_GUIDE.md!');

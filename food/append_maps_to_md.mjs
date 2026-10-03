import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('c:\\cowork\\taiwan\\food\\data\\places_full_manifest.json', 'utf8'));

let mapSection = '\n\n## 5. 🗺️ 구글 지도(Google Maps) 연동 리스트 및 저장 방법\n\n';
mapSection += '> **선정된 15개 식당을 스마트폰/PC의 구글 지도에 저장하고 즉시 길찾기 및 여행 동선에 활용할 수 있도록 3가지 연동 방식을 제공합니다.**\n\n';

mapSection += '### 1) 구글 내 지도(Google My Maps) 1초 일괄 가져오기 (Import)\n\n';
mapSection += '아래 제공된 **CSV** 또는 **KML** 파일을 사용하면, 구글 지도에 15개 식당 핀을 한 번에 생성하여 나만의 여행 지도 레이어로 저장할 수 있습니다.\n\n';
mapSection += '- **CSV 파일 (스프레드시트/구글 지도용)**: [`taiwan_restaurants_google_maps.csv`](file:///c:/cowork/taiwan/food/taiwan_restaurants_google_maps.csv)\n';
mapSection += '- **KML 파일 (구글 어스/구글 내 지도용)**: [`taiwan_restaurants_google_maps.kml`](file:///c:/cowork/taiwan/food/taiwan_restaurants_google_maps.kml)\n\n';

mapSection += '#### 📌 구글 내 지도 가져오기 3단계 가이드:\n';
mapSection += '1. PC 웹브라우저에서 **[Google My Maps (google.com/mymaps)](https://www.google.com/mymaps)** 에 접속합니다.\n';
mapSection += '2. 좌측 상단의 **[+ 새 지도 만들기]** 버튼을 클릭합니다.\n';
mapSection += '3. \'제목 없는 레이어\' 아래의 **[가져오기 (Import)]** 를 누르고, 위 [`taiwan_restaurants_google_maps.csv`](file:///c:/cowork/taiwan/food/taiwan_restaurants_google_maps.csv) 파일을 업로드합니다.\n';
mapSection += '   - 위치 열: `Latitude`와 `Longitude` 선택\n';
mapSection += '   - 마커 제목 열: `Name` 선택\n';
mapSection += '4. **완료!** 15개 식당의 핀, 주소, 평점, 추천메뉴, 먹는법이 구글 지도에 한 번에 표시되며, 스마트폰의 **구글 지도 앱 > [저장됨] > [지도]** 탭에서 언제든 바로 열어볼 수 있습니다.\n\n';

mapSection += '### 2) 15개 식당별 원클릭 구글 지도 다이렉트 저장 링크 목록\n\n';
mapSection += '| 번호 | 식당명 (원문) | 카테고리 | 구글 실측 평점 | 위도/경도 좌표 | 구글 지도 다이렉트 링크 |\n';
mapSection += '| :--- | :--- | :--- | :--- | :--- | :--- |\n';

manifest.forEach(m => {
  mapSection += `| #${m.id} | **${m.name}**<br>(${m.originalName}) | ${m.category} | ⭐️ ${m.rating} | \`${m.lat}, ${m.lng}\` | [🗺️ 구글지도 열기/저장](${m.directUrl}) |\n`;
});

let md = fs.readFileSync('c:\\cowork\\taiwan\\food\\TAIWAN_FOOD_GUIDE.md', 'utf8');
if (!md.includes('5. 🗺️ 구글 지도')) {
  md += mapSection;
  fs.writeFileSync('c:\\cowork\\taiwan\\food\\TAIWAN_FOOD_GUIDE.md', md, 'utf8');
  fs.writeFileSync('C:\\Users\\pobco\\.gemini\\antigravity\\brain\\7fe98584-6233-42a1-90e1-ed2ded1c6c26\\taiwan_food_guide.md', md, 'utf8');
  console.log('Appended Google Maps section to MD guides!');
} else {
  console.log('Already contains Google Maps section!');
}

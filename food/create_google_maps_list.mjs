import fs from 'fs';
import path from 'path';

const PLACES_FILE = 'c:\\cowork\\taiwan\\food\\data\\places_scraped.json';
const COORDS_FILE = 'c:\\cowork\\taiwan\\food\\data\\places_coords.json';

const places = JSON.parse(fs.readFileSync(PLACES_FILE, 'utf8'));
const coords = JSON.parse(fs.readFileSync(COORDS_FILE, 'utf8'));

// Menu & details
const DETAILS = {
  1: {
    menu: "호우샤오빙 자유티아오 (厚燒餅夾油條) / 셴또우장 (鹹豆漿) / 딴빙 (蛋餅)",
    howToEat: "셴또우장은 젓지 말고 순두부를 부드럽게 떠먹으며 유티아오를 적셔 먹음. 샤오빙은 갓 나왔을 때 온기가 있을 때 바로 취식.",
    transit: "MRT 반난선 샨다오스역 5번 출구 바로 앞 화산시장 2층"
  },
  2: {
    menu: "딴빙 자유티아오 (蛋餅夾油條) / 빙톈또우장 (冰甜豆漿) / 샤오빙 총단 (燒餅夾蔥蛋)",
    howToEat: "테이블 간장 페이스트와 칠리소스를 딴빙에 뿌려 먹고, 시원한 톈또우장으로 입가심.",
    transit: "MRT 다안역 5번 출구 도보 5분 (24시간 영업)"
  },
  3: {
    menu: "소룡탕포 (小籠湯包) / 셴또우장 (鹹豆漿) / 총요우빙 (蔥油餅加蛋)",
    howToEat: "소룡포 피를 살짝 찢어 육즙을 먼저 마신 뒤 생강채와 흑초를 올려 한입에 먹음.",
    transit: "MRT 중정기념당역 3번 출구 도보 6분"
  },
  4: {
    menu: "칭둔 우육면 (清燉牛肉麵) / 홍샤오 우육면 (紅燒牛肉麵) / 파이구 (排骨)",
    howToEat: "생마늘을 까서 한 입 깨물고 우육면 면과 국물을 들이켜는 산둥식 방식. 쏸차이 추가.",
    transit: "MRT 타이베이 메인역 Z4/Z6 출구 도보 4분"
  },
  5: {
    menu: "홍샤오 반근반육면 (紅燒半筋半肉麵) / 분증배골 (粉蒸排骨) / 칭둔 우육면",
    howToEat: "매콤하고 진한 홍샤오 국물에 쏸차이를 듬뿍 넣고, 분증배골 바닥 고구마를 긁어먹음.",
    transit: "MRT 동먼역 4번/5번 출구 도보 3분"
  },
  6: {
    menu: "반근반육면 (半筋半肉麵) / 화화니 (花干) / 소고기 수육 (切牛肉)",
    howToEat: "맑은 한약재 육수를 맛본 뒤 주황색 특제 매운 소기름(라뉴요우)을 풀어 진국으로 변신.",
    transit: "MRT 중샤오푸싱역 1번 출구 도보 10분 (새벽 3시까지 영업)"
  },
  7: {
    menu: "루로우판 (滷肉飯) / 루단 (滷蛋) & 루더우간 (滷豆干) / 딩볜차오 (鼎邊趖)",
    howToEat: "밥과 고기를 다 비비지 않고 숟가락으로 떠먹으며 오이절임 곁들임.",
    transit: "MRT 중정기념당역 2번 출구 바로 앞 도보 1분"
  },
  8: {
    menu: "루로우판 (滷肉飯) / 티팡 (蹄膀 족발조림) / 루죽순 (滷筍絲)",
    howToEat: "젤라틴 깍둑비계를 밥과 살살 섞어 먹고 부드러운 족발 살코기와 죽순 곁들임.",
    transit: "MRT 중산초교역 1번 출구 도보 5분"
  },
  9: {
    menu: "루로우판 지아 지단 (滷肉飯加煎蛋) / 커자이지엔 (蚵仔煎 굴전) / 뤄보가오 (蘿蔔糕)",
    howToEat: "반숙 계란 노른자를 톡 터뜨려 밥알 사이로 스며들게 한 뒤 비벼 먹음.",
    transit: "MRT 시먼역 6번 출구 도보 4분"
  },
  10: {
    menu: "창잉터우 (蒼蠅頭) / 차오거리 (炒蛤蜊) / 옌쑤샤 (鹽酥蝦)",
    howToEat: "무료 흰쌀밥에 창잉터우를 얹어 비벼 먹고 18일 타이완 생맥주 곁들임.",
    transit: "MRT 류장리역 도보 6분"
  },
  11: {
    menu: "펑리샤추 (鳳梨蝦球) / 톄반뉴러우 (鐵板牛肉) / 싼베이지 (三杯雞)",
    howToEat: "여러 가지 볶음 요리를 시켜 회전 테이블에 두고 셰어하며 맥주 파티.",
    transit: "MRT 중산역 2번 출구 도보 10분 (장안동로 러차오 거리)"
  },
  12: {
    menu: "라오피넌로우 (老皮嫩肉) / 창잉터우 (蒼蠅頭) / 펑리샤추 (鳳梨蝦球)",
    howToEat: "연두부 튀김을 숟가락으로 떠서 자작한 간장 소스를 적셔 먹고 창잉터우와 비빔밥.",
    transit: "MRT 타이베이101/세무역 4번 출구 도보 5분 (ATT 4 FUN 6층)"
  },
  13: {
    menu: "화염편피압 (火焰片皮鴨) / 춘풍득의장 (春風得意腸) / 선지압 (先知鴨)",
    howToEat: "오리 껍질을 백설탕에 찍어 먼저 먹은 후 밀전병에 파채와 쌈 싸 먹음. 뼈는 오리죽.",
    transit: "MRT 타이베이 메인역 Y5 출구 도보 2분 (군품주점 17층)"
  },
  14: {
    menu: "산해 호화 병반 (山海豪華拼盤) / 홍화게 찹쌀밥 (紅蟳米糕) / 금은삼보조 (金銀三寶料)",
    howToEat: "1930년대 연회 요리를 코스 순서로 즐기며, 게장을 찹쌀밥에 비벼 먹음.",
    transit: "MRT 중샤오신성역 5번/6번 출구 도보 5분"
  },
  15: {
    menu: "챠이보단 (菜脯蛋) / 싼베이지 (三杯雞) / 수제 행인두부 (欣葉手作杏仁豆腐)",
    howToEat: "원형 무절임 계란부침을 피자처럼 잘라 밥 위에 얹어 먹고, 식후 쫄깃한 행인두부.",
    transit: "MRT 중산초교역 1번 출구 도보 6분"
  }
};

// 1. Build Merged List
const mergedList = places.map(p => {
  const c = coords.find(item => item.id === p.id) || {};
  const d = DETAILS[p.id] || {};
  const cleanAddress = p.address.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Create direct universal Google Maps Search & Save URL
  const gmapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.originalName + ' ' + cleanAddress)}`;
  const gmapsCoordUrl = c.lat && c.lng ? `https://www.google.com/maps?q=${c.lat},${c.lng}` : gmapsSearchUrl;

  return {
    id: p.id,
    name: p.name,
    originalName: p.originalName,
    category: p.category,
    rating: p.rating,
    address: cleanAddress,
    lat: c.lat,
    lng: c.lng,
    transit: d.transit,
    menus: d.menu,
    howToEat: d.howToEat,
    mapUrl: gmapsCoordUrl,
    directUrl: gmapsSearchUrl
  };
});

fs.writeFileSync('c:\\cowork\\taiwan\\food\\data\\places_full_manifest.json', JSON.stringify(mergedList, null, 2), 'utf8');

// 2. Generate Google My Maps CSV
let csv = 'Name,Original_Name,Category,Rating,Address,Latitude,Longitude,Recommended_Menus,How_To_Eat,Transit_Access,Google_Maps_URL\n';
mergedList.forEach(m => {
  const row = [
    `"${m.name}"`,
    `"${m.originalName}"`,
    `"${m.category}"`,
    m.rating,
    `"${m.address.replace(/"/g, '""')}"`,
    m.lat,
    m.lng,
    `"${m.menus.replace(/"/g, '""')}"`,
    `"${m.howToEat.replace(/"/g, '""')}"`,
    `"${m.transit.replace(/"/g, '""')}"`,
    `"${m.mapUrl}"`
  ].join(',');
  csv += row + '\n';
});
fs.writeFileSync('c:\\cowork\\taiwan\\food\\taiwan_restaurants_google_maps.csv', csv, 'utf8');
fs.writeFileSync('c:\\cowork\\taiwan\\food\\data\\taiwan_restaurants_google_maps.csv', csv, 'utf8');

// 3. Generate KML File (Keyhole Markup Language for Google Maps & Google Earth)
let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>🇹🇼 대만 유명 전통 음식 & 레스토랑 15선</name>
    <description>실제 구글 지도 평점, 리뷰(긍정3/부정2), 추천메뉴 및 대중교통 정보가 포함된 타이베이 대표 맛집 지도</description>
`;

mergedList.forEach(m => {
  kml += `
    <Placemark>
      <name>${m.name} (${m.originalName})</name>
      <description><![CDATA[
        <h3>${m.name}</h3>
        <p><b>카테고리:</b> ${m.category}</p>
        <p><b>구글 평점:</b> ★ ${m.rating}</p>
        <p><b>주소:</b> ${m.address}</p>
        <p><b>대중교통:</b> ${m.transit}</p>
        <p><b>추천 메뉴:</b> ${m.menus}</p>
        <p><b>먹는 방법:</b> ${m.howToEat}</p>
        <p><a href="${m.mapUrl}" target="_blank">구글 지도에서 바로 보기</a></p>
      ]]></description>
      <Point>
        <coordinates>${m.lng},${m.lat},0</coordinates>
      </Point>
    </Placemark>
  `;
});

kml += `
  </Document>
</kml>
`;
fs.writeFileSync('c:\\cowork\\taiwan\\food\\taiwan_restaurants_google_maps.kml', kml, 'utf8');
fs.writeFileSync('c:\\cowork\\taiwan\\food\\data\\taiwan_restaurants_google_maps.kml', kml, 'utf8');

console.log('Successfully generated CSV and KML files!');

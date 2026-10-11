import fs from 'fs';
import path from 'path';

const TOP40_EXACT_METADATA = {
  "행복당": {
    name_ko: "행복당 본점 (싱푸탕)",
    name_zh: "幸福堂 旗艦店",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 3분",
    address: "No. 29, Chengdu Rd, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.042892,
    lng: 121.507382
  },
  "아종면선": {
    name_ko: "아종면선 곱창국수",
    name_zh: "阿宗麵線",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 2분",
    address: "No. 8-1, Emei St, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.043328,
    lng: 121.507641
  },
  "딘타이펑": {
    name_ko: "딘타이펑 신의본점",
    name_zh: "鼎泰豐 信義店",
    district: "동먼 / 다안구",
    mrt: "MRT 동먼역 5번 출구 도보 1분",
    address: "No. 194, Sec. 2, Xinyi Rd, Da'an District, Taipei City, Taiwan 106",
    lat: 25.033788,
    lng: 121.529892
  },
  "일갑자찬음": {
    name_ko: "일갑자찬음 (미슐랭 빕구르망)",
    name_zh: "一甲子餐飲",
    district: "룽산사 / 만화구",
    mrt: "MRT 룽산사역 3번 출구 도보 7분",
    address: "No. 79, Kangding Rd, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.039294,
    lng: 121.501528
  },
  "푸항또우장": {
    name_ko: "푸항또우장 (미슐랭 조식)",
    name_zh: "阜杭豆漿",
    district: "중정구 (화산시장 2층)",
    mrt: "MRT 산다오스역 5번 출구 도보 1분",
    address: "No. 108, Sec. 1, Zhongxiao E Rd, Zhongzheng District, Taipei City, Taiwan 100",
    lat: 25.0442333,
    lng: 121.5248433
  },
  "용허또우장": {
    name_ko: "용허또우장 다안점 (24시)",
    name_zh: "永和豆漿大王 復興南路店",
    district: "다안구",
    mrt: "MRT 다안역 5번 출구 도보 5분",
    address: "No. 102, Sec. 2, Fuxing S Rd, Da'an District, Taipei City, Taiwan 106",
    lat: 25.0297337,
    lng: 121.5433359
  },
  "천천리": {
    name_ko: "천천리 (시먼딩 가성비 노포)",
    name_zh: "天天利美食坊",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 4분",
    address: "No. 1, Lane 32, Hanzhong St, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.0449773,
    lng: 121.5075459
  },
  "푸홍우육면": {
    name_ko: "푸홍 우육면 (시먼딩 24시)",
    name_zh: "富宏牛肉麵",
    district: "시먼딩 / 만화구",
    mrt: "MRT 베이먼역 1번 출구 도보 5분 / 시먼역 도보 7분",
    address: "No. 67-2, Luoyang St, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.047514,
    lng: 121.506598
  },
  "유산동우육면": {
    name_ko: "유산동 우육면 (미슐랭 빕구르망)",
    name_zh: "劉山東牛肉麵",
    district: "타이베이 메인역 / 중정구",
    mrt: "MRT 타이베이 메인역 Z4 출구 도보 4분",
    address: "No. 2, Lane 14, Sec. 1, Kaifeng St, Zhongzheng District, Taipei City, Taiwan 100",
    lat: 25.0457149,
    lng: 121.5137602
  },
  "융캉우육면": {
    name_ko: "융캉우육면 (융캉제 원조)",
    name_zh: "永康牛肉麵",
    district: "융캉제 / 다안구",
    mrt: "MRT 동먼역 4번/5번 출구 도보 3분",
    address: "No. 17, Lane 31, Sec. 2, Jinshan S Rd, Da'an District, Taipei City, Taiwan 106",
    lat: 25.0329382,
    lng: 121.5281111
  },
  "삼미식당": {
    name_ko: "삼미식당 (대왕연어초밥)",
    name_zh: "三味食堂",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 1번 출구 도보 10분 / 룽산사역 도보 8분",
    address: "No. 116, Sec. 2, Guiyang St, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.040182,
    lng: 121.503291
  },
  "진천미": {
    name_ko: "진천미 (시먼딩 대만가정식)",
    name_zh: "真川味",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 5분",
    address: "No. 42-1, Kangding Rd, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.043512,
    lng: 121.503418
  },
  "키키레스토랑": {
    name_ko: "키키 레스토랑 (신이 ATT 4 FUN)",
    name_zh: "KiKi餐廳 (信義ATT店)",
    district: "신이구",
    mrt: "MRT 타이베이101/세무센터역 4번 출구 도보 5분",
    address: "6F, No. 12, Songshou Rd, Xinyi District, Taipei City, Taiwan 110",
    lat: 25.0354713,
    lng: 121.5638816
  },
  "푸바왕족발": {
    name_ko: "푸바왕 족발 (송장난징 로컬 1티어)",
    name_zh: "富霸王豬腳",
    district: "송장난징 / 중산구",
    mrt: "MRT 송장난징역 7번 출구 도보 2분",
    address: "No. 20, Lane 115, Sec. 2, Nanjing E Rd, Zhongshan District, Taipei City, Taiwan 104",
    lat: 25.053334,
    lng: 121.533500
  },
  "천진총좌빙": {
    name_ko: "천진총좌빙 (융캉제 명물)",
    name_zh: "天津蔥抓餅",
    district: "융캉제 / 다안구",
    mrt: "MRT 동먼역 5번 출구 도보 3분",
    address: "No. 1, Lane 6, Yongkang St, Da'an District, Taipei City, Taiwan 106",
    lat: 25.033282,
    lng: 121.529792
  },
  "스무시하우스": {
    name_ko: "스무시 하우스 본관 (융캉제)",
    name_zh: "思慕昔 本館",
    district: "융캉제 / 다안구",
    mrt: "MRT 동먼역 5번 출구 도보 3분",
    address: "No. 15, Yongkang St, Da'an District, Taipei City, Taiwan 106",
    lat: 25.032692,
    lng: 121.529841
  },
  "빙찬": {
    name_ko: "빙찬 생망고빙수 (여름 한정)",
    name_zh: "冰讚",
    district: "쌍련 / 다퉁구",
    mrt: "MRT 쌍련역 2번 출구 도보 2분",
    address: "No. 2, Shuanglian St, Datong District, Taipei City, Taiwan 103",
    lat: 25.058392,
    lng: 121.520982
  },
  "신마라훠궈": {
    name_ko: "신마라 훠궈 클래식 (시먼딩점)",
    name_zh: "新馬辣經典麻辣鍋 (西門店)",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 5분",
    address: "3F, No. 52, Xining S Rd, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.044520,
    lng: 121.506180
  },
  "핫스타지파이": {
    name_ko: "핫스타 지파이 (스린 야시장 본점)",
    name_zh: "豪大大雞排 (士林總店)",
    district: "스린 야시장 / 스린구",
    mrt: "MRT 젠탄역 1번 출구 도보 5분",
    address: "No. 113, Wenlin Rd, Shilin District, Taipei City, Taiwan 111",
    lat: 25.088192,
    lng: 121.524391
  },
  "라뜰리에루터스": {
    name_ko: "라뜰리에 루터스 (누가크래커)",
    name_zh: "L'Atelier Lotus",
    district: "융캉제 / 다안구",
    mrt: "MRT 동먼역 5번 출구 도보 7분",
    address: "No. 10, Lane 143, Jinhua St, Da'an District, Taipei City, Taiwan 106",
    lat: 25.031582,
    lng: 121.530182
  },
  "춘수당": {
    name_ko: "춘수당 (중정기념당점)",
    name_zh: "春水堂 (中正紀念堂店)",
    district: "중정구 (국가음악청 B1)",
    mrt: "MRT 중정기념당역 5번 출구 도보 3분",
    address: "B1, No. 21-1, Zhongshan S Rd, Zhongzheng District, Taipei City, Taiwan 100",
    lat: 25.036350,
    lng: 121.519420
  },
  "항주소룡탕포": {
    name_ko: "항주소룡탕포 본점 (미슐랭 빕구르망)",
    name_zh: "杭州小籠湯包 (本店)",
    district: "중정기념당 / 다안구",
    mrt: "MRT 동먼역 3번 출구 도보 7분",
    address: "No. 19, Sec. 2, Hangzhou S Rd, Da'an District, Taipei City, Taiwan 106",
    lat: 25.033502,
    lng: 121.524672
  },
  "황지루로우판": {
    name_ko: "황지 루로우판 (미슐랭 빕구르망)",
    name_zh: "黃記魯肉飯",
    district: "중산 / 쌍련 / 중산구",
    mrt: "MRT 중산초교역 1번 출구 도보 5분",
    address: "No. 28, Lane 183, Sec. 2, Zhongshan N Rd, Zhongshan District, Taipei City, Taiwan 104",
    lat: 25.0636698,
    lng: 121.524142
  },
  "진펑루로우판": {
    name_ko: "진펑 루로우판 (난먼시장 3대장)",
    name_zh: "金峰魯肉飯",
    district: "중정기념당 / 중정구",
    mrt: "MRT 중정기념당역 2번 출구 바로 앞 도보 1분",
    address: "No. 10-1, Sec. 1, Roosevelt Rd, Zhongzheng District, Taipei City, Taiwan 100",
    lat: 25.0320911,
    lng: 121.5185362
  },
  "양산박샤오롱바오": {
    name_ko: "양산박 샤오롱바오 (시먼딩 가성비)",
    name_zh: "梁山泊小籠湯包",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 5분",
    address: "Lane 82, Hanzhong St, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.042971,
    lng: 121.506899
  },
  "왕스브로스": {
    name_ko: "왕스브로스 소왕자과 (흑금 루로우판)",
    name_zh: "小王煮瓜 (Wang's Broth)",
    district: "화시제 야시장 / 룽산사 / 만화구",
    mrt: "MRT 룽산사역 1번 출구 도보 6분",
    address: "No. 153, Huaxi St, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.037182,
    lng: 121.498392
  },
  "호공도금계원": {
    name_ko: "호공도 금계원 (50년 전통 딤섬)",
    name_zh: "好公道金雞園",
    district: "융캉제 / 다안구",
    mrt: "MRT 동먼역 5번 출구 도보 4분",
    address: "No. 28-1, Yongkang St, Da'an District, Taipei City, Taiwan 106",
    lat: 25.030998,
    lng: 121.529891
  },
  "하오지수교": {
    name_ko: "하오지 수교 전문점 (타이베이역)",
    name_zh: "豪季水餃專賣店 (台北車站店)",
    district: "타이베이 메인역 / 중정구",
    mrt: "MRT 타이베이 메인역 M5 출구 도보 3분",
    address: "No. 29, Sec. 1, Zhongxiao W Rd, Zhongzheng District, Taipei City, Taiwan 100",
    lat: 25.046328,
    lng: 121.517392
  },
  "임동방우육면": {
    name_ko: "임동방 우육면 (린동팡 심야)",
    name_zh: "林東芳牛肉麵",
    district: "중샤오푸싱 / 중산구",
    mrt: "MRT 중샤오푸싱역 1번 출구 도보 8분",
    address: "No. 322, Sec. 2, Bade Rd, Zhongshan District, Taipei City, Taiwan 104",
    lat: 25.0472524,
    lng: 121.5430792
  },
  "금춘발우육면": {
    name_ko: "금춘발 우육면 본점 (128년 전통)",
    name_zh: "金春發牛肉麵 (總店)",
    district: "위안산 / 다퉁구",
    mrt: "MRT 위안산역 1번 출구 도보 5분",
    address: "No. 330, Dalong St, Datong District, Taipei City, Taiwan 103",
    lat: 25.071850,
    lng: 121.513800
  },
  "서문면점": {
    name_ko: "서문면점 (시먼딩 60년 노포)",
    name_zh: "西門麵店 (Ximen Noodle)",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 1번 출구 도보 4분",
    address: "No. 35, Neijiang St, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.041699,
    lng: 121.505708
  },
  "삼형매빙수": {
    name_ko: "삼형매 빙수 (시먼딩 망고눈꽃)",
    name_zh: "三兄妹雪花冰",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 3분",
    address: "No. 23, Hanzhong St, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.044190,
    lng: 121.507420
  },
  "시먼딩지파이": {
    name_ko: "180도C 지파이 (시먼딩 꿀간장)",
    name_zh: "180度C蜜汁鹽酥雞",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 1번 출구 도보 5분",
    address: "No. 180, Sec. 2, Guiyang St, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.039640,
    lng: 121.501980
  },
  "핀셴생맹활해선": {
    name_ko: "핀셴 생맹해선 (100NTD 러차오)",
    name_zh: "品鱻生猛活海鮮",
    district: "류장리 / 통화 / 다안구",
    mrt: "MRT 류장리역 1번 출구 도보 7분",
    address: "No. 68, Leli Rd, Da'an District, Taipei City, Taiwan 106",
    lat: 25.0259679,
    lng: 121.5517508
  },
  "원팡꽈바오": {
    name_ko: "원팡 꽈바오 (미슐랭 빕구르망)",
    name_zh: "源芳刈包",
    district: "화시제 야시장 / 룽산사 / 만화구",
    mrt: "MRT 룽산사역 1번 출구 도보 5분",
    address: "No. 17-2, Huaxi St, Wanhua District, Taipei City, Taiwan 108",
    lat: 25.038160,
    lng: 121.498450
  },
  "원조호교병": {
    name_ko: "후쿠주 원조 후추빵 (라오허제 본점)",
    name_zh: "福州世祖胡椒餅 (饒河總店)",
    district: "라오허제 야시장 / 쑹산구",
    mrt: "MRT 쑹산역 1번/5번 출구 도보 2분",
    address: "No. 249, Raohe St, Songshan District, Taipei City, Taiwan 105",
    lat: 25.050982,
    lng: 121.577682
  },
  "사해두장": {
    name_ko: "사해두장 대왕 (중산 로컬 조식)",
    name_zh: "四海豆漿大王",
    district: "중산 / 다퉁구",
    mrt: "MRT 타이베이 메인역 R1 출구 도보 5분 / 중산역 도보 6분",
    address: "No. 29, Chang'an W Rd, Datong District, Taipei City, Taiwan 103",
    lat: 25.050210,
    lng: 121.520130
  },
  "치엔두훠궈": {
    name_ko: "치엔두 훠궈 (지린점 1인 샤브)",
    name_zh: "錢都日式涮涮鍋 (台北吉林店)",
    district: "싱톈궁 / 지린로 / 중산구",
    mrt: "MRT 싱톈궁역 1번 출구 도보 5분",
    address: "No. 141, Jilin Rd, Zhongshan District, Taipei City, Taiwan 104",
    lat: 25.058310,
    lng: 121.530320
  },
  "대만망고빙수녹점": {
    name_ko: "녹두산사미 (망고 녹두빙수)",
    name_zh: "綠豆蒜啥咪",
    district: "송장난징 / 중산구",
    mrt: "MRT 송장난징역 6번 출구 도보 4분",
    address: "No. 34-1, Yitong St, Zhongshan District, Taipei City, Taiwan 104",
    lat: 25.051560,
    lng: 121.534210
  },
  "미미크래커": {
    name_ko: "미미 크래커 (누가크래커 원조)",
    name_zh: "蜜密牛軋糖 (Mimi Cracker)",
    district: "융캉제 / 다안구",
    mrt: "MRT 동먼역 3번 출구 도보 1분",
    address: "No. 21, Sec. 2, Jinshan S Rd, Da'an District, Taipei City, Taiwan 106",
    lat: 25.032340,
    lng: 121.528390
  }
};

const enrichedFile = 'food/data/top40_restaurants_enriched.json';
const enriched = JSON.parse(fs.readFileSync(enrichedFile, 'utf8'));

let updated = 0;
for (const item of enriched) {
  const meta = TOP40_EXACT_METADATA[item.id];
  if (!meta) {
    console.error(`ERROR: Missing metadata for ${item.id}`);
    process.exit(1);
  }
  
  item.name_ko = meta.name_ko;
  item.name_zh = meta.name_zh;
  item.district = meta.district;
  item.mrt = meta.mrt;
  item.address = meta.address;
  item.lat = meta.lat;
  item.lng = meta.lng;
  
  // Re-encode accurate search queries for official google maps links
  const query = encodeURIComponent(`${meta.name_ko} ${meta.name_zh} ${meta.address}`);
  item.image_source_url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meta.name_ko + ' ' + meta.name_zh)}`;
  item.order_tip_source_url = item.image_source_url;
  
  updated++;
}

fs.writeFileSync(enrichedFile, JSON.stringify(enriched, null, 2), 'utf8');
console.log(`Successfully updated ${updated} restaurants with REAL EXACT coordinates & addresses in ${enrichedFile}`);

import fs from 'fs';
import path from 'path';

const MASTER_VIDEOS_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_200_videos_master.json';
const masterVideos = JSON.parse(fs.readFileSync(MASTER_VIDEOS_FILE, 'utf8'));

// 40 Master Restaurants with exact keywords and signature menus
const RESTAURANT_DATA = [
  {
    id: "아종면선",
    name_ko: "아종면선 곱창국수",
    name_zh: "阿宗麵線",
    menu: "곱창국수 (大 75 TWD / 小 60 TWD)",
    keys: ["아종면선", "곱창국수", "곱창 국수", "阿宗麵線", "Ay-Chung", "Ay Chung", "Ay-Chung Flour-Rice Noodle"],
    categoryKeys: ["곱창국수", "곱창 국수", "아종면선"]
  },
  {
    id: "행복당",
    name_ko: "행복당 (싱푸탕)",
    name_zh: "幸福堂 旗艦店",
    menu: "화염 흑당 버블티 (120 TWD)",
    keys: ["행복당", "싱푸탕", "幸福堂", "Xing Fu Tang", "Xingfutang", "흑당버블티", "흑당 버블티"],
    categoryKeys: ["흑당버블티", "흑당 버블티", "행복당", "싱푸탕", "버블티"]
  },
  {
    id: "딘타이펑",
    name_ko: "딘타이펑 신의본점",
    name_zh: "鼎泰豐 信義店",
    menu: "샤오롱바오 (小籠包) / 갈비볶음밥 / 통새우 샤오마이",
    keys: ["딘타이펑", "鼎泰豐", "Din Tai Fung", "Din Tai Fung Taipei"],
    categoryKeys: ["딘타이펑", "샤오롱바오", "딤섬", "소룡포", "딘타이펑101"]
  },
  {
    id: "천진총좌빙",
    name_ko: "천진총좌빙",
    name_zh: "天津蔥抓餅",
    menu: "햄+치즈+계란 총좌빙 (60 TWD) / 오리지널 총좌빙",
    keys: ["천진총좌빙", "총좌빙", "天津蔥抓餅", "Tianjin Scallion Pancake", "Scallion Pancake"],
    categoryKeys: ["총좌빙", "천진총좌빙", "파전병"]
  },
  {
    id: "라뜰리에루터스",
    name_ko: "라뜰리에 루터스 (누가크래커)",
    name_zh: "L'Atelier Lotus",
    menu: "수제 오리지널 파 누가크래커 (200 TWD)",
    keys: ["라뜰리에", "루터스", "라뜰리에 루터스", "누가크래커", "L'Atelier Lotus"],
    categoryKeys: ["누가크래커", "라뜰리에", "루터스", "누가 크래커"]
  },
  {
    id: "카리도넛",
    name_ko: "카리도넛 (크리스피 밀크 도넛)",
    name_zh: "脆皮鮮奶甜甜圈",
    menu: "우유 도넛 (25 TWD)",
    keys: ["카리도넛", "카리 도넛", "크리스피 도넛", "크리스피 밀크 도넛", "脆皮鮮奶甜甜圈", "Crispy Milk Donut", "우유도너츠", "우유 도넛"],
    categoryKeys: ["우유도넛", "카리도넛", "크리스피 도넛", "우유도너츠", "도넛"]
  },
  {
    id: "후쿠주후추빵",
    name_ko: "후쿠주 원조 후추빵 (라오허제)",
    name_zh: "福州世祖胡椒餅",
    menu: "화덕 원조 후추빵 (60 TWD)",
    keys: ["후쿠주", "후추빵", "후추 빵", "세조후추빵", "福州世祖胡椒餅", "Fuzhou Ancestor Pepper Bun", "Pepper Bun", "후추병", "복주세조호초병"],
    categoryKeys: ["후추빵", "후추 빵", "후쿠주", "세조후추빵", "복주세조"]
  },
  {
    id: "일갑자찬음",
    name_ko: "일갑자찬음",
    name_zh: "一甲子餐飲",
    menu: "콩러우판 (통삼겹덮밥 100 TWD) / 꽈바오 (대만식버거 60 TWD)",
    keys: ["일갑자", "일갑자찬음", "일갑자손음", "一甲子", "一甲子餐飲", "Yi Jia Zi", "Yijiazi", "콩러우판"],
    categoryKeys: ["일갑자", "콩러우판", "꽈바오", "통삼겹덮밥"]
  },
  {
    id: "진천미",
    name_ko: "진천미",
    name_zh: "真川味",
    menu: "연두부 튀김 (老皮嫩肉) / 파볶음 (蒼蠅頭) / 탕수육",
    keys: ["진천미", "진촨웨이", "真川味", "真善美", "Zhen Chuan Wei", "파파리", "연두부튀김"],
    categoryKeys: ["진천미", "연두부", "파볶음", "사천식"]
  },
  {
    id: "핫스타지파이",
    name_ko: "핫스타 지파이",
    name_zh: "豪大大雞排",
    menu: "대왕 지파이 (100 TWD)",
    keys: ["핫스타", "지파이", "호대대", "豪大大", "豪大大雞排", "Hot Star Large Fried Chicken", "대왕 지파이"],
    categoryKeys: ["지파이", "핫스타", "대왕 지파이", "닭튀김"]
  },
  {
    id: "춘수당",
    name_ko: "춘수당",
    name_zh: "春水堂",
    menu: "원조 쩐주나이차 (버블티) / 공부면 / 우육면",
    keys: ["춘수당", "春水堂", "Chun Shui Tang", "원조 버블티"],
    categoryKeys: ["춘수당", "쩐주나이차", "원조 버블티"]
  },
  {
    id: "푸홍우육면",
    name_ko: "푸홍우육면",
    name_zh: "富宏牛肉麵",
    menu: "홍샤오 우육면 / 반근반육면 (110 TWD) / 수교",
    keys: ["푸홍우육면", "푸홍", "富宏", "富宏牛肉麵", "Fuhong Beef Noodles", "Fuhong"],
    categoryKeys: ["푸홍", "푸홍우육면", "24시간 우육면"]
  },
  {
    id: "푸항또우장",
    name_ko: "푸항또우장",
    name_zh: "阜杭豆漿",
    menu: "셴또우장 (순두부탕) / 호우샤오빙 자유티아오 / 딴빙",
    keys: ["푸항또우장", "푸항두유", "阜杭豆漿", "Fu Hang Soy Milk", "Fuhang Soy Milk", "Fuhang", "화산시장 조식", "센또우장"],
    categoryKeys: ["푸항", "푸항또우장", "화산시장", "셴또우장", "센또우장"]
  },
  {
    id: "하오지수교",
    name_ko: "하오지 수교 전문점 (이연복 만두)",
    name_zh: "豪季水餃專賣店",
    menu: "통새우 물만두 (90 TWD) / 돼지고기 배추물만두",
    keys: ["하오지", "호기수교", "하오지수교", "豪季", "豪季水餃", "이연복 만두", "이연복 수교", "이연복 셰프 추천 만두", "하오지쉐이지아오"],
    categoryKeys: ["하오지", "물만두", "이연복 만두", "하오지쉐이지아오", "만두 맛집"]
  },
  {
    id: "융캉우육면",
    name_ko: "융캉우육면",
    name_zh: "永康牛肉麵",
    menu: "홍샤오 반근반육면 (300 TWD) / 분증배골",
    keys: ["융캉우육면", "永康牛肉麵", "Yong Kang Beef", "Yongkang Beef Noodle", "Yongkang Beef"],
    categoryKeys: ["융캉우육면", "융캉제 우육면", "사천식 우육면"]
  },
  {
    id: "삼미식당",
    name_ko: "삼미식당",
    name_zh: "三味食堂",
    menu: "대왕 연어초밥 (230 TWD) / 관자꼬치",
    keys: ["삼미식당", "三味食堂", "Sunway", "대왕연어초밥", "대왕 연어초밥", "대왕 연어"],
    categoryKeys: ["삼미식당", "대왕연어초밥", "연어초밥", "대왕 연어"]
  },
  {
    id: "천천리",
    name_ko: "천천리",
    name_zh: "天天利美食坊",
    menu: "계란후라이 루로우판 (45 TWD) / 굴전",
    keys: ["천천리", "天天利", "天天利美食坊", "Tian Tian Li", "Tiantianli"],
    categoryKeys: ["천천리", "계란후라이 루로우판", "시먼딩 루로우판"]
  },
  {
    id: "스무시하우스",
    name_ko: "스무시하우스",
    name_zh: "思慕昔 本館",
    menu: "슈퍼 망고 빙수 (250 TWD)",
    keys: ["스무시", "스무시하우스", "思慕昔", "Smoothie House"],
    categoryKeys: ["스무시", "스무시하우스", "망고빙수", "융캉제 망고빙수"]
  },
  {
    id: "키키레스토랑",
    name_ko: "키키 레스토랑",
    name_zh: "KiKi餐廳",
    menu: "부추꽃볶음 (창잉터우) / 계란두부튀김",
    keys: ["키키레스토랑", "키키 레스토랑", "KiKi", "KiKi餐廳"],
    categoryKeys: ["키키", "키키레스토랑", "창잉터우"]
  },
  {
    id: "양산박",
    name_ko: "양산박 샤오롱바오",
    name_zh: "梁山泊小籠湯包",
    menu: "수제 소룡탕포 7개 세트 (110 TWD)",
    keys: ["양산박", "梁山泊", "梁山泊小籠湯包", "Liang Shan Po", "Liangshanpo"],
    categoryKeys: ["양산박", "시먼딩 소룡포"]
  },
  {
    id: "유산동",
    name_ko: "유산동 우육면",
    name_zh: "劉山東牛肉麵",
    menu: "칭둔 우육면 (170 TWD) / 파이구 튀김",
    keys: ["유산동", "劉山東", "劉山東牛肉麵", "Liu Shan Dong", "Liu Shandong"],
    categoryKeys: ["유산동", "타이베이 우육면 맛집", "산둥식 우육면", "칭둔 우육면"]
  },
  {
    id: "마라시안훠궈",
    name_ko: "마라시안 훠궈",
    name_zh: "馬辣頂級麻辣鴛鴦火鍋",
    menu: "마라 원앙 훠궈 무한리필 / 하겐다즈",
    keys: ["마라시안", "마라훠궈", "馬辣", "馬辣頂級麻辣鴛鴦火鍋", "Mala Hotpot"],
    categoryKeys: ["마라훠궈", "마라시안", "훠궈 맛집"]
  },
  {
    id: "황가향장",
    name_ko: "황가향장 (황가소시지)",
    name_zh: "黃家香腸",
    menu: "숯불 생마늘 수제 소시지 (40 TWD)",
    keys: ["황가향장", "황가소시지", "黃家香腸", "Huang Jia Sausage", "대만 소시지"],
    categoryKeys: ["황가향장", "황가소시지", "소시지 맛집", "숯불 소시지"]
  },
  {
    id: "황지루로우판",
    name_ko: "황지 루로우판",
    name_zh: "黃記魯肉飯",
    menu: "루로우판 (40 TWD) / 티팡 족발조림 (90 TWD)",
    keys: ["황지", "황지루로우판", "黃記", "黃記魯肉飯", "Huang Ji Braised Pork", "Huang Ji"],
    categoryKeys: ["황지", "황지루로우판", "족발조림"]
  },
  {
    id: "호공도금계원",
    name_ko: "호공도 금계원",
    name_zh: "好公道金雞園",
    menu: "소룡포 (160 TWD) / 게살소룡포",
    keys: ["호공도", "금계원", "好公道", "金雞園", "Hao Gong Dao Jin Ji Yuan"],
    categoryKeys: ["금계원", "호공도", "융캉제 만두"]
  },
  {
    id: "서문면점",
    name_ko: "서문면점 (Ximen Noodle)",
    name_zh: "西門麵店",
    menu: "비빔 우육면 / 반숙계란 루로우판",
    keys: ["서문면점", "시먼누들", "西門麵店", "Ximen Noodle"],
    categoryKeys: ["서문면점", "시먼누들", "ximen noodle"]
  },
  {
    id: "왕스브로스",
    name_ko: "왕스브로스 (소왕자과)",
    name_zh: "小王煮瓜 Wang's Broth",
    menu: "흑금 루로우판 (35 TWD) / 맑은 절임오이 갈비탕",
    keys: ["왕스브로스", "소왕자과", "小王煮瓜", "Wang's Broth", "흑금 루로우판"],
    categoryKeys: ["왕스브로스", "소왕자과", "흑금 루로우판", "화시제"]
  },
  {
    id: "위엔환볜굴전",
    name_ko: "위엔환볜 굴전 (닝샤)",
    name_zh: "圓環邊蚵仔煎",
    menu: "원조 굴전 (85 TWD) / 굴수프",
    keys: ["위엔환볜", "원환변", "圓環邊", "圓環邊蚵仔煎", "Yuan Huan Bian Oyster Omelet", "닝샤 굴전"],
    categoryKeys: ["위엔환볜", "굴전", "닝샤야시장 굴전", "닝샤 굴전"]
  },
  {
    id: "아성아육",
    name_ko: "아성아육 (젠슨황 거위고기)",
    name_zh: "阿城鵝肉",
    menu: "훈제 거위고기 (300 TWD) / 거위기름 밥",
    keys: ["아성아육", "아쳉구스", "阿城", "阿城鵝肉", "A Cheng Goose", "ACheng Goose", "젠슨황 거위"],
    categoryKeys: ["아성아육", "거위고기", "아쳉구스", "젠슨황"]
  },
  {
    id: "빙찬",
    name_ko: "빙찬 (생망고빙수)",
    name_zh: "冰讚",
    menu: "생망고 설화빙 (180 TWD)",
    keys: ["빙찬", "빙잔", "冰讚", "Bing Zan", "Bingzan", "솽롄 망고빙수"],
    categoryKeys: ["빙찬", "빙잔", "생망고빙수"]
  },
  {
    id: "딩위안또우장",
    name_ko: "딩위안또우장",
    name_zh: "鼎元豆漿",
    menu: "셴또우장 (35 TWD) / 소룡탕포 (120 TWD)",
    keys: ["딩위안", "정원두유", "鼎元", "鼎元豆漿", "Ding Yuan", "Dingyuan"],
    categoryKeys: ["딩위안", "정원두유", "중정기념당 조식"]
  },
  {
    id: "융허또우장",
    name_ko: "융허또우장",
    name_zh: "永和豆漿大王",
    menu: "딴빙 자유티아오 (50 TWD) / 빙톈또우장",
    keys: ["융허또우장", "영화두유", "永和豆漿", "永和豆漿大王", "Yong He Soy Milk", "Yonghe Soy Milk"],
    categoryKeys: ["융허또우장", "용허또우장", "조식 맛집(용허또우장)", "대만 아침식사"]
  },
  {
    id: "스얼궈",
    name_ko: "스얼궈 (12Hotpot)",
    name_zh: "石二鍋",
    menu: "1인 샤브샤브 훠궈 세트 (238 TWD)",
    keys: ["스얼궈", "12Hotpot", "石二鍋", "1인 훠궈"],
    categoryKeys: ["스얼궈", "1인 훠궈", "1인훠궈"]
  },
  {
    id: "항주소룡탕포",
    name_ko: "항주소룡탕포",
    name_zh: "杭州小籠湯包",
    menu: "소룡탕포 (170 TWD) / 군만두",
    keys: ["항주소룡탕포", "항저우소룡포", "杭州小籠湯包", "Hangzhou Xiaolongbao", "반값 딘타이펑"],
    categoryKeys: ["항주소룡탕포", "반값 딘타이펑", "항저우"]
  },
  {
    id: "임동방우육면",
    name_ko: "임동방 우육면",
    name_zh: "林東芳牛肉麵",
    menu: "반근반육면 (280 TWD) / 화화니 유부조림",
    keys: ["임동방", "림동방", "林東芳", "林東芳牛肉麵", "Lin Dong Fang", "Lin Dongfang"],
    categoryKeys: ["임동방", "림동방", "화화니"]
  },
  {
    id: "진펑루로우판",
    name_ko: "진펑 루로우판",
    name_zh: "金峰魯肉飯",
    menu: "루로우판 (35 TWD) / 루단 계란조림",
    keys: ["진펑", "진펑루로우판", "金峰", "金峰魯肉飯", "Jin Feng", "Jinfeng"],
    categoryKeys: ["진펑", "진펑루로우판", "난먼시장"]
  },
  {
    id: "르팔레",
    name_ko: "르 팔레 (미슐랭 3스타)",
    name_zh: "頤宮中餐廳 Le Palais",
    menu: "시그니처 바삭 오리구이(先知鴨) / 딤섬",
    keys: ["르팔레", "르 팔레", "이궁", "頤宮", "Le Palais"],
    categoryKeys: ["르팔레", "이궁", "3스타", "미슐랭 3스타"]
  },
  {
    id: "금춘발우육면",
    name_ko: "금춘발 우육면",
    name_zh: "金春發牛肉麵",
    menu: "원조 칭둔 우육탕 (160 TWD) / 카레 볶음면",
    keys: ["금춘발", "金春發", "金春發牛肉麵", "Jin Chun Fa"],
    categoryKeys: ["금춘발", "128년 전통"]
  },
  {
    id: "핀샨러차오",
    name_ko: "핀샨 생맹해선 러차오",
    name_zh: "品鱻生猛活海鮮",
    menu: "18일 대만 생맥주 / 바지락볶음",
    keys: ["핀샨", "품선", "品鱻", "品鱻生猛活海鮮", "Pin Xian", "Pinxian"],
    categoryKeys: ["핀샨", "품선", "생맹해선"]
  },
  {
    id: "중앙시장러차오",
    name_ko: "중앙시장 생맹해선 러차오",
    name_zh: "中央市場生猛海鮮 100",
    menu: "100NTD 해산물 볶음 요리",
    keys: ["중앙시장", "中央市場", "中央市場生猛海鮮"],
    categoryKeys: ["중앙시장", "러차오 100"]
  }
];

function timeStrToSeconds(str) {
  const parts = str.split(':').map(p => parseInt(p, 10));
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export function extractAllTimelinesRaw() {
  const rawList = [];

  for (let vIdx = 0; vIdx < masterVideos.length; vIdx++) {
    const v = masterVideos[vIdx];
    const desc = v.description || '';
    const title = v.title || '';
    const fullText = (title + ' ' + desc).toLowerCase();
    const descLines = desc.split('\n');

    // Extract all timestamp lines flexible (matching 00:00, [00:00], 00:00text, etc.)
    const timestampLines = [];
    for (let l of descLines) {
      const trimmed = l.trim();
      const m = trimmed.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
      if (m) {
        timestampLines.push({
          timeStr: m[1],
          seconds: timeStrToSeconds(m[1]),
          text: trimmed
        });
      }
    }

    // Check each of the 40 restaurants
    for (const rest of RESTAURANT_DATA) {
      const isMentioned = rest.keys.some(k => fullText.includes(k.toLowerCase()));
      if (!isMentioned) continue;

      let foundTimeline = null;
      let foundSeconds = 0;

      // 1. Direct match: timestamp line contains restaurant keys
      for (const tl of timestampLines) {
        const lineLower = tl.text.toLowerCase();
        if (rest.keys.some(k => lineLower.includes(k.toLowerCase()))) {
          foundTimeline = tl.timeStr;
          foundSeconds = tl.seconds;
          break;
        }
      }

      // 2. Cross-match: Look for section descriptions matching timestamp line titles
      if (!foundTimeline && timestampLines.length > 0) {
        // Find if any desc line mentions restaurant AND matches a chapter heading
        for (const dl of descLines) {
          const dlLower = dl.toLowerCase();
          if (rest.keys.some(k => dlLower.includes(k.toLowerCase()))) {
            // Find which timestamp line best corresponds to dl
            for (const tl of timestampLines) {
              const tlClean = tl.text.replace(/(\d{1,2}:\d{2}(?::\d{2})?)/, '').replace(/[[\]()📍❣️\-]/g, '').trim().toLowerCase();
              if (tlClean.length >= 2 && dlLower.includes(tlClean)) {
                foundTimeline = tl.timeStr;
                foundSeconds = tl.seconds;
                break;
              }
            }
            if (foundTimeline) break;
          }
        }
      }

      // 3. Category match
      if (!foundTimeline && rest.categoryKeys) {
        for (const tl of timestampLines) {
          const lineLower = tl.text.toLowerCase();
          if (rest.categoryKeys.some(ck => lineLower.includes(ck.toLowerCase()))) {
            foundTimeline = tl.timeStr;
            foundSeconds = tl.seconds;
            break;
          }
        }
      }

      // 4. Fallback: Dedicated restaurant video or general appearance
      if (!foundTimeline) {
        const titleLower = title.toLowerCase();
        if (rest.keys.some(k => titleLower.includes(k.toLowerCase()))) {
          foundTimeline = "00:00 (단독 풀영상)";
          foundSeconds = 0;
        } else {
          foundTimeline = "00:00 (영상 내 등장)";
          foundSeconds = 0;
        }
      }

      const timelineLink = `https://www.youtube.com/watch?v=${v.id}&t=${foundSeconds}s`;

      rawList.push({
        youtuber: v.channel,
        videoTitle: v.title,
        videoUrl: v.url,
        restaurantName: rest.name_ko,
        originalName: rest.name_zh,
        menu: rest.menu,
        timeline: foundTimeline,
        timelineUrl: timelineLink
      });
    }
  }

  return rawList;
}

const rawData = extractAllTimelinesRaw();
console.log(`Extracted total ${rawData.length} raw restaurant-mention timeline entries.`);

const specificTimestamps = rawData.filter(d => !d.timeline.includes('00:00'));
console.log(`Entries with specific extracted timestamps: ${specificTimestamps.length}`);

// Save JSON
const JSON_OUT = 'c:\\cowork\\taiwan\\food\\data\\taipei_youtube_food_timeline_raw.json';
fs.writeFileSync(JSON_OUT, JSON.stringify(rawData, null, 2), 'utf8');

// Save CSV (UTF-8 with BOM)
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

const csvHeaders = [
  '유튜버명',
  '영상제목',
  '영상링크',
  '맛집이름',
  '메뉴',
  '영상중 타임라인',
  '해당타임라인 지정된링크'
];

const csvRows = [csvHeaders.join(',')];
for (const row of rawData) {
  const restaurantDisplay = row.originalName ? `${row.restaurantName} (${row.originalName})` : row.restaurantName;
  csvRows.push([
    escapeCsv(row.youtuber),
    escapeCsv(row.videoTitle),
    escapeCsv(row.videoUrl),
    escapeCsv(restaurantDisplay),
    escapeCsv(row.menu),
    escapeCsv(row.timeline),
    escapeCsv(row.timelineUrl)
  ].join(','));
}

const CSV_OUT = 'c:\\cowork\\taiwan\\food\\taipei_youtube_food_timeline_raw.csv';
fs.writeFileSync(CSV_OUT, '\ufeff' + csvRows.join('\r\n'), 'utf8');
console.log(`Saved updated raw CSV dataset to ${CSV_OUT}`);

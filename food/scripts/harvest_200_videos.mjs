import fs from 'fs';
import path from 'path';

const EXISTING_50_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_50_videos_final.json';
const OUTPUT_200_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_200_videos_master.json';
const MENTION_STATS_FILE = 'c:\\cowork\\taiwan\\food\\data\\restaurant_mention_counts.json';

const existing50 = JSON.parse(fs.readFileSync(EXISTING_50_FILE, 'utf8'));
console.log(`Loaded ${existing50.length} base verified videos.`);

const SEARCH_QUERIES = [
  // Korean queries
  '대만 타이베이 맛집',
  '타이베이 맛집 브이로그',
  '대만 먹방 브이로그 타이베이',
  '타이베이 우육면 맛집',
  '타이베이 루로우판 맛집',
  '타이베이 샤오롱바오 딤섬',
  '타이베이 조식 또우장',
  '타이베이 야시장 먹거리',
  '시먼딩 맛집 투어',
  '융캉제 맛집 투어',
  '중산역 맛집 투어',
  '타이베이 러차오 술집',
  '타이베이 망고빙수',
  '타이베이 훠궈 마라훠궈',
  '백종원 대만 맛집',
  '이연복 대만 맛집',
  '정지선 셰프 대만',
  '김숙 대만 먹방',
  '쯔양 대만',
  '육식맨 대만',
  '하말넘많 대만',
  '수코 대만',
  '최술진 대만',
  '흥삶이네 대만',
  '채코제 대만',
  '원지의하루 대만',
  '우니의끼니 대만',
  '고요비 대만',
  'UCC 미누키 대만',
  '보리코 대만',
  '해피뉴먼쓰 대만',
  '럭키커플트립 대만',
  '잠티 대만',
  '가오니의 메뉴판 대만',
  '탸퍄 대만',
  '인영 대만',
  '이자반 대만',
  '예또세상 대만',
  '히제이 대만',
  '현주zip 대만',
  '연수연 대만',
  '모르는지 대만',
  '먹지희 대만',
  '나나 대만 여행',
  '톡파원 25시 대만',
  '다시갈지도 대만 타이베이',
  '배틀트립 대만 타이베이',
  '대만 3박4일 먹투어',
  '타이베이 2박3일 맛집',
  '대만 타이베이 현지인 맛집',
  '타이베이 미슐랭 빕구르망',

  // Global / English queries
  'Taipei food vlog 2024',
  'Taipei food vlog 2025',
  'Taipei street food 2024',
  'what to eat in Taipei',
  'best foods in Taipei',
  'Taipei must eat food',
  'Taipei night market food',
  'Taipei beef noodles',
  'Taipei breakfast tour',
  'Taipei Michelin food',
  'Mark Wiens Taipei food',
  'Strictly Dumpling Taipei',
  'Luke Martin Taipei',
  'Tiffy Cooks Taipei',
  'CupofTJ Taipei',

  // Traditional Chinese / Local Taiwan queries
  '台北 美食 2024',
  '台北 美食 2025',
  '台北 必吃 美食',
  '台北 夜市 美食',
  '台北 牛肉麵 推薦',
  '台北 早餐 推薦',
  '台北 魯肉飯 推薦',
  '台北 小籠包 推薦',
  '西門町 美食 推薦',
  '永康街 美食 推薦',
  '千千進食中 台北',
  '欸你這週要幹嘛 台北美食',
  '陪沈團 台北美食',
  '酷的夢 台北美食',
  '痛痛 台北美食'
];

async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,zh-TW;q=0.7'
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});/);
    if (!match) return [];
    const data = JSON.parse(match[1]);
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    if (!contents) return [];

    const list = [];
    for (const section of contents) {
      const items = section.itemSectionRenderer?.contents;
      if (!items) continue;
      for (const item of items) {
        if (item.videoRenderer) {
          const v = item.videoRenderer;
          list.push({
            id: v.videoId,
            title: v.title?.runs?.map(r => r.text).join('') || v.title?.simpleText || '',
            channel: v.ownerText?.runs?.[0]?.text || '',
            viewsText: v.viewCountText?.simpleText || '',
            publishedText: v.publishedTimeText?.simpleText || ''
          });
        }
      }
    }
    return list;
  } catch (err) {
    return [];
  }
}

async function fetchVideoDetails(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,zh-TW;q=0.7'
      }
    });
    if (!res.ok) return null;
    const text = await res.text();
    let pData = null;
    const match = text.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (match) {
      try {
        pData = JSON.parse(match[1]);
      } catch (e) {}
    }

    const details = pData?.videoDetails || {};
    const micro = pData?.microformat?.playerMicroformatRenderer || {};

    let viewCount = parseInt(details.viewCount || '0', 10);
    if (!viewCount) {
      const vMatch = text.match(/<meta itemprop="interactionCount" content="([0-9]+)"/);
      if (vMatch) viewCount = parseInt(vMatch[1], 10);
    }

    let publishDate = micro.publishDate || micro.uploadDate || '';
    if (!publishDate) {
      const dMatch = text.match(/<meta itemprop="datePublished" content="([^"]+)"/);
      if (dMatch) publishDate = dMatch[1];
    }

    const title = details.title || '';
    const author = details.author || '';
    const description = details.shortDescription || '';

    return {
      id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title,
      channel: author,
      viewCount,
      publishDate,
      description
    };
  } catch (e) {
    return null;
  }
}

function parseViewsRough(text) {
  if (!text) return 0;
  const m = text.match(/([0-9,.]+)\s*만/);
  if (m) return parseFloat(m[1].replace(/,/g, '')) * 10000;
  const kMatch = text.match(/([0-9,.]+)\s*K/i);
  if (kMatch) return parseFloat(kMatch[1].replace(/,/g, '')) * 1000;
  const mMatch = text.match(/([0-9,.]+)\s*M/i);
  if (mMatch) return parseFloat(mMatch[1].replace(/,/g, '')) * 1000000;
  const num = text.replace(/[^0-9]/g, '');
  return parseInt(num, 10) || 0;
}

// Master restaurant dictionary for frequency matching
const RESTAURANT_KEYWORDS = [
  { id: "아종면선", name_ko: "아종면선 곱창국수", keys: ["아종면선", "곱창국수", "阿宗麵線", "Ay-Chung Flour-Rice Noodle", "Ay Chung"] },
  { id: "융캉우육면", name_ko: "융캉우육면", keys: ["융캉우육면", "永康牛肉麵", "Yong Kang Beef Noodle", "Yongkang Beef Noodle"] },
  { id: "푸항또우장", name_ko: "푸항또우장", keys: ["푸항또우장", "푸항두유", "阜杭豆漿", "Fu Hang Soy Milk", "Fuhang Soy Milk", "화산시장 조식"] },
  { id: "천천리", name_ko: "천천리", keys: ["천천리", "天天利", "天天利美食坊", "Tian Tian Li"] },
  { id: "유산동", name_ko: "유산동 우육면", keys: ["유산동", "劉山東", "劉山東牛肉麵", "Liu Shan Dong"] },
  { id: "딘타이펑", name_ko: "딘타이펑", keys: ["딘타이펑", "鼎泰豐", "Din Tai Fung", "딘타이펑 본점", "딘타이펑 101"] },
  { id: "일갑자찬음", name_ko: "일갑자찬음", keys: ["일갑자", "일갑자찬음", "일갑자손음", "一甲子", "一甲子餐飲", "Yi Jia Zi"] },
  { id: "후쿠주후추빵", name_ko: "후쿠주 원조 후추빵 (라오허제)", keys: ["후추빵", "후쿠주", "세조후추빵", "福州世祖胡椒餅", "Fuzhou Ancestor Pepper Bun"] },
  { id: "삼미식당", name_ko: "삼미식당", keys: ["삼미식당", "三味食堂", "Sunway", "대왕연어초밥", "대왕 연어초밥"] },
  { id: "황지루로우판", name_ko: "황지 루로우판", keys: ["황지", "황지루로우판", "黃記", "黃記魯肉飯", "Huang Ji Braised Pork"] },
  { id: "천진총좌빙", name_ko: "천진총좌빙", keys: ["천진총좌빙", "총좌빙", "天津蔥抓餅", "Tianjin Scallion Pancake"] },
  { id: "위엔환볜굴전", name_ko: "위엔환볜 굴전 (닝샤)", keys: ["위엔환볜", "원환변", "圓環邊", "圓環邊蚵仔煎", "Yuan Huan Bian Oyster Omelet", "닝샤 굴전"] },
  { id: "푸홍우육면", name_ko: "푸홍우육면", keys: ["푸홍우육면", "푸홍", "富宏", "富宏牛肉麵", "Fuhong Beef Noodles"] },
  { id: "스무시하우스", name_ko: "스무시하우스", keys: ["스무시", "스무시하우스", "思慕昔", "Smoothie House", "융캉제 망고빙수"] },
  { id: "아성아육", name_ko: "아성아육 (젠슨황 거위고기)", keys: ["아성아육", "아쳉구스", "阿城", "阿城鵝肉", "A Cheng Goose", "젠슨황 거위", "젠슨 황"] },
  { id: "임동방우육면", name_ko: "임동방 우육면", keys: ["임동방", "림동방", "林東芳", "林東芳牛肉麵", "Lin Dong Fang"] },
  { id: "카리도넛", name_ko: "카리도넛 (크리스피 밀크 도넛)", keys: ["카리도넛", "크리스피 도넛", "크리스피 밀크 도넛", "脆皮鮮奶甜甜圈", "Crispy Milk Donut"] },
  { id: "행복당", name_ko: "행복당 (싱푸탕)", keys: ["행복당", "싱푸탕", "幸福堂", "Xing Fu Tang"] },
  { id: "항주소룡탕포", name_ko: "항주소룡탕포", keys: ["항주소룡탕포", "항저우소룡포", "杭州小籠湯包", "Hangzhou Xiaolongbao", "반값 딘타이펑"] },
  { id: "빙찬", name_ko: "빙찬 (생망고빙수)", keys: ["빙찬", "빙잔", "冰讚", "Bing Zan", "솽롄 망고빙수"] },
  { id: "핀샨러차오", name_ko: "핀샨 생맹해선 러차오", keys: ["핀샨", "품선", "品鱻", "品鱻生猛活海鮮", "Pin Xian"] },
  { id: "키키레스토랑", name_ko: "키키 레스토랑", keys: ["키키", "키키레스토랑", "KiKi", "KiKi餐廳"] },
  { id: "진천미", name_ko: "진천미", keys: ["진천미", "진촨웨이", "真川味", "真善美", "Zhen Chuan Wei"] },
  { id: "양산박", name_ko: "양산박 샤오롱바오", keys: ["양산박", "梁山泊", "梁山泊小籠湯包", "Liang Shan Po"] },
  { id: "핫스타지파이", name_ko: "핫스타 지파이", keys: ["핫스타", "지파이", "호대대", "豪大大", "豪大大雞排", "Hot Star Large Fried Chicken"] },
  { id: "호공도금계원", name_ko: "호공도 금계원", keys: ["호공도", "금계원", "好公道", "金雞園", "Hao Gong Dao Jin Ji Yuan"] },
  { id: "진펑루로우판", name_ko: "진펑 루로우판", keys: ["진펑", "진펑루로우판", "金峰", "金峰魯肉飯", "Jin Feng"] },
  { id: "딩위안또우장", name_ko: "딩위안또우장", keys: ["딩위안", "정원두유", "鼎元", "鼎元豆漿", "Ding Yuan"] },
  { id: "융허또우장", name_ko: "융허또우장", keys: ["융허또우장", "영화두유", "永和豆漿", "永和豆漿大王", "Yong He Soy Milk"] },
  { id: "서문면점", name_ko: "서문면점 (Ximen Noodle)", keys: ["서문면점", "시먼누들", "西門麵店", "Ximen Noodle"] },
  { id: "마라시안훠궈", name_ko: "마라시안 훠궈", keys: ["마라시안", "마라훠궈", "馬辣", "馬辣頂級麻辣鴛鴦火鍋", "Mala Hotpot"] },
  { id: "스얼궈", name_ko: "스얼궈 (12Hotpot)", keys: ["스얼궈", "12Hotpot", "石二鍋", "1인 훠궈"] },
  { id: "춘수당", name_ko: "춘수당", keys: ["춘수당", "春水堂", "Chun Shui Tang", "원조 버블티"] },
  { id: "하오지수교", name_ko: "하오지 수교 (이연복 만두)", keys: ["하오지", "호기수교", "豪季", "豪季水餃", "이연복 만두"] },
  { id: "왕스브로스", name_ko: "왕스브로스 (소왕자과)", keys: ["왕스브로스", "소왕자과", "小王煮瓜", "Wang's Broth", "흑금 루로우판"] },
  { id: "황가향장", name_ko: "황가향장 (황가소시지)", keys: ["황가향장", "황가소시지", "黃家香腸", "Huang Jia Sausage", "대만 소시지"] },
  { id: "르팔레", name_ko: "르 팔레 (미슐랭 3스타)", keys: ["르팔레", "르 팔레", "이궁", "頤宮", "Le Palais"] },
  { id: "중앙시장러차오", name_ko: "중앙시장 생맹해선 러차오", keys: ["중앙시장", "中央市場", "中央市場生猛海鮮"] },
  { id: "라뜰리에루터스", name_ko: "라뜰리에 루터스 (누가크래커)", keys: ["라뜰리에", "루터스", "누가크래커", "라뜰리에 루터스", "L'Atelier Lotus"] },
  { id: "금춘발우육면", name_ko: "금춘발 우육면", keys: ["금춘발", "金春發", "金春發牛肉麵", "Jin Chun Fa"] }
];

async function run() {
  const masterVideos = [...existing50];
  const seenIds = new Set(existing50.map(v => v.id));

  console.log(`Phase 1: Querying YouTube search across ${SEARCH_QUERIES.length} queries...`);
  const candidatePool = [];

  for (let i = 0; i < SEARCH_QUERIES.length; i++) {
    const q = SEARCH_QUERIES[i];
    const results = await searchYouTube(q);
    let added = 0;
    for (const item of results) {
      if (!item.id || seenIds.has(item.id)) continue;
      const v = parseViewsRough(item.viewsText);
      if (v >= 100000) {
        seenIds.add(item.id);
        candidatePool.push(item);
        added++;
      }
    }
    if ((i + 1) % 10 === 0 || i === SEARCH_QUERIES.length - 1) {
      console.log(`[${i + 1}/${SEARCH_QUERIES.length}] Query "${q}" -> Total candidates: ${candidatePool.length}`);
    }
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\nPhase 2: Verifying exact video details for ${candidatePool.length} candidates until we reach 200 total videos...`);

  for (let i = 0; i < candidatePool.length; i++) {
    const c = candidatePool[i];
    const details = await fetchVideoDetails(c.id);
    if (!details) continue;

    // Strict validation
    if (details.viewCount < 100000) continue;
    if (!details.publishDate || details.publishDate < '2024-01-01') continue;

    const t = (details.title + ' ' + details.description).toLowerCase();
    
    // Disqualify purely other cities
    if (t.includes('치앙마이') || t.includes('칭다오') || t.includes('홍콩') || t.includes('도쿄') || t.includes('오사카') || t.includes('베이징') || t.includes('대구')) {
      if (!t.includes('대만') && !t.includes('타이베이') && !t.includes('taipei') && !t.includes('台北')) {
        continue;
      }
    }

    const isTaipei = t.includes('타이베이') || t.includes('타이페이') || t.includes('시먼') || t.includes('융캉') || t.includes('taipei') || t.includes('台北') || t.includes('야시장') || t.includes('대만') || t.includes('taiwan');
    const isFood = t.includes('맛집') || t.includes('먹방') || t.includes('food') || t.includes('eat') || t.includes('noodle') || t.includes('beef') || t.includes('pork') || t.includes('night market') || t.includes('美食') || t.includes('吃') || t.includes('우육면') || t.includes('루로우판') || t.includes('또우장') || t.includes('만두') || t.includes('빙수');

    if (!isTaipei || !isFood) continue;

    masterVideos.push(details);
    if (masterVideos.length % 10 === 0 || masterVideos.length >= 200) {
      console.log(`Verified [${masterVideos.length}/200] videos... (Latest: ${details.channel} | ${details.viewCount.toLocaleString()} views)`);
    }

    if (masterVideos.length >= 200) {
      console.log(`\n🎉 TARGET REACHED! 200 high-view videos verified!`);
      break;
    }

    await new Promise(r => setTimeout(r, 450));
  }

  console.log(`Total verified videos: ${masterVideos.length}`);
  fs.writeFileSync(OUTPUT_200_FILE, JSON.stringify(masterVideos, null, 2), 'utf8');

  // Phase 3: Aggregating restaurant mention frequency across all 200 videos
  console.log(`\nPhase 3: Aggregating restaurant mention frequencies across all ${masterVideos.length} videos...`);
  
  const mentionStats = RESTAURANT_KEYWORDS.map(r => {
    let count = 0;
    const mentioningVideos = [];

    for (let idx = 0; idx < masterVideos.length; idx++) {
      const v = masterVideos[idx];
      const fullText = (v.title + ' ' + v.description).toLowerCase();
      
      const isMentioned = r.keys.some(k => fullText.includes(k.toLowerCase()));
      if (isMentioned) {
        count++;
        mentioningVideos.push({
          videoIndex: idx + 1,
          channel: v.channel,
          title: v.title,
          views: v.viewCount,
          url: v.url
        });
      }
    }

    return {
      id: r.id,
      name_ko: r.name_ko,
      mention_count: count,
      percentage: ((count / masterVideos.length) * 100).toFixed(1) + '%',
      top_creators: mentioningVideos.slice(0, 5).map(m => m.channel),
      mentioningVideos
    };
  });

  // Sort by mention_count descending
  mentionStats.sort((a, b) => b.mention_count - a.mention_count);
  mentionStats.forEach((item, rank) => {
    item.rank = rank + 1;
  });

  console.log(`\n=== TOP 10 MOST MENTIONED RESTAURANTS IN 200 VIDEOS ===`);
  mentionStats.slice(0, 15).forEach(m => {
    console.log(`[Rank ${m.rank}] ${m.name_ko}: ${m.mention_count}회 언급 (${m.percentage}) - 주요 채널: ${m.top_creators.slice(0, 3).join(', ')}`);
  });

  fs.writeFileSync(MENTION_STATS_FILE, JSON.stringify(mentionStats, null, 2), 'utf8');
  console.log(`Saved frequency statistics to ${MENTION_STATS_FILE}`);
}

run();

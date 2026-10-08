import fs from 'fs';
import path from 'path';

const MASTER_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_200_videos_master.json';
const MENTION_STATS_FILE = 'c:\\cowork\\taiwan\\food\\data\\restaurant_mention_counts.json';

let masterVideos = [];
if (fs.existsSync(MASTER_FILE)) {
  masterVideos = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf8'));
}
const seenIds = new Set(masterVideos.map(v => v.id));
console.log(`[Init] Currently verified master videos: ${masterVideos.length} (Need: ${200 - masterVideos.length})`);

const TARGET_QUERIES = [
  '대만 타이베이 먹방 2024',
  '대만 타이베이 먹방 2025',
  '대만 야시장 먹거리 2024',
  '대만 길거리음식 먹방 2024',
  '대만 시먼딩 먹거리 2024',
  '대만 융캉제 먹거리 2024',
  '대만 우육면 먹방 2024',
  '대만 맛집 추천 2024 먹방',
  '대만 여행 먹킷리스트 2024',
  '대만 3박4일 먹방 2024',
  '대만 현지인 맛집 2024',
  '대만 라오허제 야시장 먹방 2024',
  '대만 스린 야시장 먹방 2024',
  '대만 닝샤 야시장 먹방 2024',
  '대만 편의점 먹방 2024',
  '대만 훠궈 먹방 2024',
  '대만 딘타이펑 먹방 2024',
  'taipei street food 2024 4k',
  'taipei must eat food 2024 4k',
  'taipei night market 2024 4k'
];

async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
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

    const videos = [];
    for (const section of contents) {
      const items = section.itemSectionRenderer?.contents;
      if (!items) continue;
      for (const item of items) {
        if (item.videoRenderer) {
          const v = item.videoRenderer;
          videos.push({
            id: v.videoId,
            title: v.title?.runs?.map(r => r.text).join('') || v.title?.simpleText || '',
            channel: v.ownerText?.runs?.[0]?.text || '',
            viewsText: v.viewCountText?.simpleText || '',
            publishedText: v.publishedTimeText?.simpleText || ''
          });
        }
      }
    }
    return videos;
  } catch (err) {
    return [];
  }
}

async function fetchDetails(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,zh-TW;q=0.7',
        'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+478'
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

// 40 Master Restaurants & Keywords
const RESTAURANT_KEYWORDS = [
  { id: "아종면선", name_ko: "아종면선 곱창국수", name_zh: "阿宗麵線", district: "시먼딩 / 만화구", cuisine: "로컬 길거리 간식", rating: 4.0, keys: ["아종면선", "곱창국수", "곱창 국수", "阿宗麵線", "Ay-Chung", "Ay Chung", "Ay-Chung Flour-Rice"] },
  { id: "융캉우육면", name_ko: "융캉우육면", name_zh: "永康牛肉麵", district: "동먼 / 융캉제", cuisine: "우육면", rating: 3.8, keys: ["융캉우육면", "永康牛肉麵", "Yong Kang Beef", "Yongkang Beef Noodle", "Yongkang Beef"] },
  { id: "푸항또우장", name_ko: "푸항또우장", name_zh: "阜杭豆漿", district: "샨다오스 / 화산시장", cuisine: "전통 조식 / 또우장", rating: 4.1, keys: ["푸항또우장", "푸항두유", "阜杭豆漿", "Fu Hang Soy Milk", "Fuhang Soy Milk", "Fuhang", "화산시장 조식"] },
  { id: "천천리", name_ko: "천천리", name_zh: "天天利美食坊", district: "시먼딩 / 만화구", cuisine: "루로우판", rating: 4.1, keys: ["천천리", "天天利", "天天利美食坊", "Tian Tian Li", "Tiantianli"] },
  { id: "유산동", name_ko: "유산동 우육면", name_zh: "劉山東牛肉麵", district: "타이베이 메인역 / 중산", cuisine: "우육면", rating: 4.0, keys: ["유산동", "劉山東", "劉山東牛肉麵", "Liu Shan Dong", "Liu Shandong"] },
  { id: "딘타이펑", name_ko: "딘타이펑", name_zh: "鼎泰豐 信義店", district: "동먼 / 융캉제", cuisine: "만두 / 샤오롱바오", rating: 4.5, keys: ["딘타이펑", "鼎泰豐", "Din Tai Fung", "Din Tai Fung Taipei"] },
  { id: "일갑자찬음", name_ko: "일갑자찬음", name_zh: "一甲子餐飲", district: "시먼딩 / 만화구", cuisine: "루로우판", rating: 4.2, keys: ["일갑자", "일갑자찬음", "일갑자손음", "一甲子", "一甲子餐飲", "Yi Jia Zi", "Yijiazi"] },
  { id: "후쿠주후추빵", name_ko: "후쿠주 원조 후추빵 (라오허제)", name_zh: "福州世祖胡椒餅", district: "쑹산 / 라오허제 야시장", cuisine: "야시장 명물", rating: 4.1, keys: ["후추빵", "후쿠주", "세조후추빵", "福州世祖胡椒餅", "Fuzhou Ancestor Pepper Bun", "Pepper Bun", "후추 빵"] },
  { id: "삼미식당", name_ko: "삼미식당", name_zh: "三味食堂", district: "시먼딩 / 만화구", cuisine: "일식 / 대왕 연어초밥", rating: 4.0, keys: ["삼미식당", "三味食堂", "Sunway", "대왕연어초밥", "대왕 연어초밥", "대왕 연어"] },
  { id: "황지루로우판", name_ko: "황지 루로우판", name_zh: "黃記魯肉飯", district: "중산 / 쌍련", cuisine: "루로우판", rating: 4.3, keys: ["황지", "황지루로우판", "黃記", "黃記魯肉飯", "Huang Ji Braised Pork", "Huang Ji"] },
  { id: "천진총좌빙", name_ko: "천진총좌빙", name_zh: "天津蔥抓餅", district: "동먼 / 융캉제", cuisine: "로컬 길거리 간식", rating: 4.4, keys: ["천진총좌빙", "총좌빙", "天津蔥抓餅", "Tianjin Scallion Pancake", "Scallion Pancake"] },
  { id: "위엔환볜굴전", name_ko: "위엔환볜 굴전 (닝샤)", name_zh: "圓環邊蚵仔煎", district: "다퉁 / 닝샤 야시장", cuisine: "야시장 명물", rating: 4.1, keys: ["위엔환볜", "원환변", "圓環邊", "圓環邊蚵仔煎", "Yuan Huan Bian Oyster Omelet", "닝샤 굴전", "닝샤야시장 굴전"] },
  { id: "푸홍우육면", name_ko: "푸홍우육면", name_zh: "富宏牛肉麵", district: "시먼딩 / 만화구", cuisine: "우육면", rating: 4.2, keys: ["푸홍우육면", "푸홍", "富宏", "富宏牛肉麵", "Fuhong Beef Noodles", "Fuhong"] },
  { id: "스무시하우스", name_ko: "스무시하우스", name_zh: "思慕昔 本館", district: "동먼 / 융캉제", cuisine: "디저트 / 망고빙수", rating: 4.0, keys: ["스무시", "스무시하우스", "思慕昔", "Smoothie House", "융캉제 망고빙수"] },
  { id: "아성아육", name_ko: "아성아육 (젠슨황 거위고기)", name_zh: "阿城鵝肉 A Cheng Goose", district: "중산 / 행천궁", cuisine: "고기 요리 / 거위고기", rating: 4.4, keys: ["아성아육", "아쳉구스", "阿城", "阿城鵝肉", "A Cheng Goose", "ACheng Goose", "젠슨황 거위", "젠슨 황"] },
  { id: "임동방우육면", name_ko: "임동방 우육면", name_zh: "林東芳牛肉麵", district: "다안 / 중샤오푸싱", cuisine: "우육면", rating: 3.9, keys: ["임동방", "림동방", "林東芳", "林東芳牛肉麵", "Lin Dong Fang", "Lin Dongfang"] },
  { id: "카리도넛", name_ko: "카리도넛 (크리스피 밀크 도넛)", name_zh: "脆皮鮮奶甜甜圈", district: "타이베이 메인역 / 화인거리", cuisine: "로컬 길거리 간식", rating: 4.5, keys: ["카리도넛", "크리스피 도넛", "크리스피 밀크 도넛", "脆皮鮮奶甜甜圈", "Crispy Milk Donut"] },
  { id: "행복당", name_ko: "행복당 (싱푸탕)", name_zh: "幸福堂 旗艦店", district: "시먼딩 / 만화구", cuisine: "디저트 / 버블티", rating: 4.4, keys: ["행복당", "싱푸탕", "幸福堂", "Xing Fu Tang", "Xingfutang"] },
  { id: "항주소룡탕포", name_ko: "항주소룡탕포", name_zh: "杭州小籠湯包", district: "중정기념당 / 다안", cuisine: "만두 / 샤오롱바오", rating: 4.1, keys: ["항주소룡탕포", "항저우소룡포", "杭州小籠湯包", "Hangzhou Xiaolongbao", "반값 딘타이펑"] },
  { id: "빙찬", name_ko: "빙찬 (생망고빙수)", name_zh: "冰讚", district: "중산 / 쌍련역", cuisine: "디저트 / 망고빙수", rating: 4.5, keys: ["빙찬", "빙잔", "冰讚", "Bing Zan", "Bingzan", "솽롄 망고빙수"] },
  { id: "핀샨러차오", name_ko: "핀샨 생맹해선 러차오", name_zh: "品鱻生猛活海鮮", district: "다안 / 류장리", cuisine: "러차오 (대만식 선술집)", rating: 4.1, keys: ["핀샨", "품선", "品鱻", "品鱻生猛活海鮮", "Pin Xian", "Pinxian"] },
  { id: "키키레스토랑", name_ko: "키키 레스토랑", name_zh: "KiKi餐廳 台北信義", district: "신의구 / ATT 4 FUN", cuisine: "사천 퓨전 요리", rating: 4.1, keys: ["키키", "키키레스토랑", "KiKi", "KiKi餐廳", "키키 레스토랑"] },
  { id: "진천미", name_ko: "진천미", name_zh: "真川味 / 真善美", district: "시먼딩 / 만화구", cuisine: "러차오 (대만식 선술집)", rating: 4.2, keys: ["진천미", "진촨웨이", "真川味", "真善美", "Zhen Chuan Wei"] },
  { id: "양산박", name_ko: "양산박 샤오롱바오", name_zh: "梁山泊小籠湯包", district: "시먼딩 / 만화구", cuisine: "만두 / 샤오롱바오", rating: 4.4, keys: ["양산박", "梁山泊", "梁山泊小籠湯包", "Liang Shan Po", "Liangshanpo"] },
  { id: "핫스타지파이", name_ko: "핫스타 지파이", name_zh: "豪大大雞排", district: "스린 야시장", cuisine: "야시장 명물", rating: 4.0, keys: ["핫스타", "지파이", "호대대", "豪大大", "豪大大雞排", "Hot Star Large Fried Chicken", "대왕 지파이"] },
  { id: "호공도금계원", name_ko: "호공도 금계원", name_zh: "好公道金雞園", district: "동먼 / 융캉제", cuisine: "만두 / 샤오롱바오", rating: 4.1, keys: ["호공도", "금계원", "好公道", "金雞園", "Hao Gong Dao Jin Ji Yuan"] },
  { id: "진펑루로우판", name_ko: "진펑 루로우판", name_zh: "金峰魯肉飯", district: "중정기념당 / 난먼시장", cuisine: "루로우판", rating: 3.8, keys: ["진펑", "진펑루로우판", "金峰", "金峰魯肉飯", "Jin Feng", "Jinfeng"] },
  { id: "딩위안또우장", name_ko: "딩위안또우장", name_zh: "鼎元豆漿", district: "중정기념당 / 진화가", cuisine: "전통 조식 / 또우장", rating: 4.1, keys: ["딩위안", "정원두유", "鼎元", "鼎元豆漿", "Ding Yuan", "Dingyuan"] },
  { id: "융허또우장", name_ko: "융허또우장", name_zh: "永和豆漿大王 復興南路", district: "다안 / 푸싱난로", cuisine: "전통 조식 / 또우장", rating: 4.1, keys: ["융허또우장", "영화두유", "永和豆漿", "永和豆漿大王", "Yong He Soy Milk", "Yonghe Soy Milk"] },
  { id: "서문면점", name_ko: "서문면점 (Ximen Noodle)", name_zh: "西門麵店 Ximen Noodle", district: "시먼딩 / 만화구", cuisine: "우육면", rating: 4.1, keys: ["서문면점", "시먼누들", "西門麵店", "Ximen Noodle"] },
  { id: "마라시안훠궈", name_ko: "마라시안 훠궈", name_zh: "馬辣頂級麻辣鴛鴦火鍋 漢口店", district: "시먼딩 / 만화구", cuisine: "훠궈", rating: 4.2, keys: ["마라시안", "마라훠궈", "馬辣", "馬辣頂級麻辣鴛鴦火鍋", "Mala Hotpot", "시먼 훠궈"] },
  { id: "스얼궈", name_ko: "스얼궈 (12Hotpot)", name_zh: "石二鍋 台北桂林家樂福店", district: "시먼딩 / 까르푸 구이린점", cuisine: "훠궈", rating: 4.3, keys: ["스얼궈", "12Hotpot", "石二鍋", "1인 훠궈"] },
  { id: "춘수당", name_ko: "춘수당", name_zh: "春水堂 南西店", district: "중산 / 신광미츠코시", cuisine: "디저트 / 버블티 & 식사", rating: 4.2, keys: ["춘수당", "春水堂", "Chun Shui Tang", "원조 버블티"] },
  { id: "하오지수교", name_ko: "하오지 수교 (이연복 만두)", name_zh: "豪季水餃專賣店", district: "타이베이 메인역 / 중산", cuisine: "만두 / 샤오롱바오", rating: 4.2, keys: ["하오지", "호기수교", "豪季", "豪季水餃", "이연복 만두"] },
  { id: "왕스브로스", name_ko: "왕스브로스 (소왕자과)", name_zh: "小王煮瓜 Wang's Broth", district: "만화구 / 화시제 야시장", cuisine: "루로우판", rating: 4.3, keys: ["왕스브로스", "소왕자과", "小王煮瓜", "Wang's Broth", "흑금 루로우판"] },
  { id: "황가향장", name_ko: "황가향장 (황가소시지)", name_zh: "黃家香腸", district: "중정구 / 취안저우제", cuisine: "로컬 길거리 간식", rating: 4.5, keys: ["황가향장", "황가소시지", "黃家香腸", "Huang Jia Sausage", "대만 소시지"] },
  { id: "르팔레", name_ko: "르 팔레 (미슐랭 3스타)", name_zh: "頤宮中餐廳 Le Palais", district: "타이베이 메인역 / 팔레드쉰 호텔", cuisine: "미슐랭 3스타 파인다이닝", rating: 4.5, keys: ["르팔레", "르 팔레", "이궁", "頤宮", "Le Palais"] },
  { id: "중앙시장러차오", name_ko: "중앙시장 생맹해선 러차오", name_zh: "中央市場生猛海鮮 100", district: "중산 / 장안동로 러차오 거리", cuisine: "러차오 (대만식 선술집)", rating: 3.8, keys: ["중앙시장", "中央市場", "中央市場生猛海鮮"] },
  { id: "라뜰리에루터스", name_ko: "라뜰리에 루터스 (누가크래커)", name_zh: "L'Atelier Lotus", district: "동먼 / 융캉제", cuisine: "디저트 / 기념품", rating: 4.6, keys: ["라뜰리에", "루터스", "누가크래커", "라뜰리에 루터스", "L'Atelier Lotus"] },
  { id: "금춘발우육면", name_ko: "금춘발 우육면", name_zh: "金春發牛肉麵", district: "다퉁 / 위안산", cuisine: "우육면", rating: 4.1, keys: ["금춘발", "金春發", "金春發牛肉麵", "Jin Chun Fa"] }
];

async function main() {
  console.log(`Starting to fill remaining videos to reach EXACTLY 200...`);

  for (const q of TARGET_QUERIES) {
    if (masterVideos.length >= 200) break;

    console.log(`\n[Search] "${q}"`);
    const results = await searchYouTube(q);

    for (const item of results) {
      if (masterVideos.length >= 200) break;
      if (seenIds.has(item.id)) continue;

      seenIds.add(item.id);
      const details = await fetchDetails(item.id);
      if (!details) continue;

      // Condition 1: viewCount >= 100,000
      if (details.viewCount < 100000) continue;

      // Condition 2: Recent 2 years (publishDate >= 2024-01-01)
      if (!details.publishDate || details.publishDate < '2024-01-01') continue;

      // Condition 3: Taiwan / Taipei relevance
      const t = details.title;
      const text = (details.title + ' ' + details.description).toLowerCase();

      const foreign = ['베트남', '다낭', '나트랑', '푸꾸옥', '호치민', '하노이', '칭다오', '홍콩', '도쿄', '오사카', '후쿠오카', '치앙마이', '방콕', '발리', '마카오', '싱가폴', '대구'];
      if (foreign.some(f => t.includes(f)) && !t.includes('대만') && !t.includes('타이베이')) continue;

      const isOtherExclusive = (t.includes('가오슝') || t.includes('타이난') || t.includes('타이중')) && 
                               (!t.includes('타이베이') && !t.includes('대만') && !t.includes('taipei') && !text.includes('타이베이'));
      if (isOtherExclusive) continue;

      const titleNoDaeManJok = t.replace(/대만족/g, '');
      const isTW = titleNoDaeManJok.includes('대만') || titleNoDaeManJok.includes('타이베이') || titleNoDaeManJok.includes('타이페이') || 
                   /taipei|taiwan|台北|台湾/i.test(titleNoDaeManJok) || text.includes('타이베이') || text.includes('taipei') || text.includes('台北');
      if (!isTW) continue;

      masterVideos.push(details);
      console.log(`[${masterVideos.length}/200] Added: ${details.channel} | ${details.viewCount.toLocaleString()} views | ${details.publishDate.slice(0, 10)} | ${details.title.slice(0, 30)}`);

      await new Promise(r => setTimeout(r, 120));
    }
    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\n======================================================`);
  console.log(`🎉 FINAL MASTER VIDEO COUNT: ${masterVideos.length}`);
  console.log(`======================================================`);

  fs.writeFileSync(MASTER_FILE, JSON.stringify(masterVideos, null, 2), 'utf8');

  // Aggregating mention frequency
  console.log(`\nAggregating mention frequencies across all ${masterVideos.length} videos...`);
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
      name_zh: r.name_zh,
      district: r.district,
      cuisine: r.cuisine,
      rating: r.rating,
      mention_count: count,
      percentage: ((count / masterVideos.length) * 100).toFixed(1) + '%',
      top_creators: mentioningVideos.slice(0, 8).map(m => m.channel),
      mentioningVideos
    };
  });

  mentionStats.sort((a, b) => b.mention_count - a.mention_count);
  mentionStats.forEach((item, rank) => {
    item.rank = rank + 1;
  });

  fs.writeFileSync(MENTION_STATS_FILE, JSON.stringify(mentionStats, null, 2), 'utf8');
  console.log(`Saved frequency statistics to ${MENTION_STATS_FILE}`);

  console.log(`\n======================================================`);
  console.log(`👑 TAIWAN RESTAURANT FREQUENCY RANKING (${masterVideos.length} VIDEOS) 👑`);
  console.log(`======================================================`);
  mentionStats.forEach(m => {
    console.log(`[Rank ${String(m.rank).padStart(2, ' ')}] ${m.name_ko.padEnd(25, ' ')} : ${String(m.mention_count).padStart(3, ' ')}회 (${m.percentage.padStart(5, ' ')}) | 주요 채널: ${m.top_creators.slice(0, 3).join(', ')}`);
  });

  console.log(`\nUpdating all final deliverables (CSV, KML, HTML, MD)...`);
  const { runDeliverablesGeneration } = await import('./generate_final_deliverables.mjs');
  runDeliverablesGeneration();
  console.log(`\n🎉 COMPLETED ALL DELIVERABLES!`);
}

main().catch(console.error);

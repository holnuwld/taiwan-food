import fs from 'fs';
import path from 'path';

const EXISTING_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_50_videos_final.json';
const OUTPUT_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_200_videos_master.json';

const existingVideos = JSON.parse(fs.readFileSync(EXISTING_FILE, 'utf8'));
const existingIds = new Set(existingVideos.map(v => v.id));

console.log(`Loaded ${existingVideos.length} existing videos.`);

const SEARCH_QUERIES = [
  // Korean travel & food queries
  '대만 타이베이 맛집 브이로그 2024',
  '대만 타이베이 맛집 브이로그 2025',
  '타이베이 먹방 브이로그 2024',
  '타이베이 먹방 2025',
  '타이베이 인생 맛집',
  '타이베이 우육면 추천',
  '타이베이 루로우판 추천',
  '타이베이 샤오롱바오 딤섬',
  '타이베이 야시장 길거리 음식',
  '시먼딩 먹거리 브이로그',
  '융캉제 먹거리 브이로그',
  '타이베이 조식 맛집 투어',
  '타이베이 3박4일 먹투어',
  '대만 맛집 지도 추천',
  '타이베이 혼자 여행 먹방',
  '백종원 대만 맛집 투어',
  '이연복 대만 맛집',
  '정지선 셰프 대만',
  '김숙 대만 미식',
  '성시경 대만',
  '쯔양 대만 맛집',
  '육식맨 대만 맛집',
  '하말넘많 대만 맛집',
  '수코 대만 맛집',
  '최술진 대만 맛집',
  '흥삶이네 대만 맛집',
  '채코제 대만 맛집',
  '원지의하루 대만 맛집',
  '우니의끼니 대만',
  '고요비 대만 맛집',
  'UCC 미누키 대만',
  '톡파원 25시 대만 맛집',
  '다시갈지도 대만 타이베이',
  '배틀트립 대만 타이베이',

  // Global / English food vloggers
  'Taipei food vlog 2024',
  'Taipei food vlog 2025',
  'Taipei street food 2024',
  'what to eat in Taipei 2024',
  'Taipei must eat restaurants 2024',
  'Taipei Michelin food 2024',
  'Taipei night market food tour 2024',
  'best beef noodles Taipei 2024',
  'Taipei breakfast food tour 2024',
  'Mark Wiens Taipei food',
  'Strictly Dumpling Taipei food',
  'Luke Martin Taipei food',
  'Tiffy Cooks Taipei vlog',
  'CupofTJ Taipei food',

  // Local Taiwanese food vloggers
  '台北 美食 2024',
  '台北 美食 2025',
  '台北 必吃 美食 2024',
  '台北 夜市 美食 2024',
  '台北 牛肉麵 2024',
  '台北 早餐 推薦 2024',
  '台北 魯肉飯 2024',
  '台北 小籠包 2024',
  '西門町 美食 2024',
  '永康街 美食 2024',
  '千千進食中 台北',
  '欸你這週要幹嘛 台北美食',
  '陪沈團 台北美食',
  '痛痛 台北美食',
  '酷的夢 台北美食'
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
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
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
    if (match) pData = JSON.parse(match[1]);

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

async function run() {
  const masterVideos = [...existingVideos];
  const seenIds = new Set(existingVideos.map(v => v.id));

  console.log(`Starting with ${masterVideos.length} verified videos. Need ${200 - masterVideos.length} more.`);

  const candidateQueue = [];

  for (let i = 0; i < SEARCH_QUERIES.length; i++) {
    const q = SEARCH_QUERIES[i];
    console.log(`[${i + 1}/${SEARCH_QUERIES.length}] Searching query: ${q}...`);
    const results = await searchYouTube(q);
    
    for (const item of results) {
      if (!item.id || seenIds.has(item.id)) continue;
      const v = parseViewsRough(item.viewsText);
      if (v >= 100000) {
        seenIds.add(item.id);
        candidateQueue.push(item);
      }
    }

    console.log(`  -> Current candidate queue: ${candidateQueue.length}`);
    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\nGathered ${candidateQueue.length} strong candidates. Now verifying exact details...`);

  for (let i = 0; i < candidateQueue.length; i++) {
    const c = candidateQueue[i];
    const details = await fetchVideoDetails(c.id);
    if (!details) continue;

    if (details.viewCount < 100000) continue;
    if (!details.publishDate || details.publishDate < '2024-01-01') continue;

    const t = (details.title + ' ' + details.description).toLowerCase();
    
    // Disqualify if primarily other cities
    if (t.includes('치앙마이') || t.includes('칭다오') || t.includes('홍콩') || t.includes('도쿄') || t.includes('오사카') || t.includes('다낭') || t.includes('대구')) {
      if (!t.includes('대만') && !t.includes('타이베이') && !t.includes('taipei') && !t.includes('台北')) {
        continue;
      }
    }

    // Must be Taipei food
    const isTaipei = t.includes('타이베이') || t.includes('타이페이') || t.includes('시먼') || t.includes('융캉') || t.includes('taipei') || t.includes('台北') || t.includes('야시장') || t.includes('대만') || t.includes('taiwan');
    const isFood = t.includes('맛집') || t.includes('먹방') || t.includes('food') || t.includes('eat') || t.includes('noodle') || t.includes('beef') || t.includes('pork') || t.includes('night market') || t.includes('美食') || t.includes('吃') || t.includes('우육면') || t.includes('루로우판') || t.includes('또우장') || t.includes('만두') || t.includes('빙수');

    if (!isTaipei || !isFood) continue;

    masterVideos.push(details);
    console.log(`[${masterVideos.length}/200] MATCH: [${details.viewCount.toLocaleString()} views | ${details.publishDate.slice(0, 10)}] ${details.title.slice(0, 35)}...`);

    if (masterVideos.length >= 200) {
      console.log(`SUCCESS! Reached target of 200 total videos!`);
      break;
    }

    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\nFinal verified master videos: ${masterVideos.length}`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(masterVideos, null, 2), 'utf8');
  console.log(`Saved master dataset to ${OUTPUT_FILE}`);
}

run();

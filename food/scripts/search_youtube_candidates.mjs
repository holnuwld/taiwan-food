import fs from 'fs';
import path from 'path';

const QUERIES = [
  '대만 타이베이 맛집',
  '타이베이 맛집 브이로그',
  '대만 맛집 투어 타이베이',
  '타이베이 먹방 투어',
  '타이베이 우육면 맛집',
  '타이베이 야시장 맛집',
  '타이베이 현지인 맛집',
  '타이베이 조식 또우장 맛집',
  '타이베이 훠궈 맛집',
  '타이베이 딤섬 샤오롱바오 맛집',
  '타이베이 시먼딩 맛집',
  '타이베이 융캉제 동먼 맛집',
  '타이베이 중산 맛집',
  '타이베이 다안 맛집',
  '타이베이 루로우판 맛집',
  '타이베이 러차오 맛집',
  '대만 3박4일 타이베이 맛집',
  '캡틴따거 대만 타이베이 맛집',
  '쯔양 대만 타이베이',
  '육식맨 대만',
  '하말넘많 대만',
  '써니하니 대만 타이베이',
  '류튜브 대만',
  '최술진 대만 타이베이',
  '해피뉴먼쓰 대만',
  '럭키커플트립 대만',
  '고요비 대만 타이베이',
  'UCC 미누키 대만',
  '보리코 대만 타이베이',
  '지뻔뻔 대만',
  '채코제 대만 타이베이',
  '곽튜브 대만 타이베이',
  '빠니보틀 대만 타이베이',
  '히밥 대만 타이베이',
  '상해기 대만 타이베이',
  '유이키 대만 타이베이',
  '토모토모 대만 타이베이',
  '웅이 대만 타이베이',
  '대만 여행 2024 타이베이 맛집',
  '대만 여행 2025 타이베이 맛집',
  '타이베이 현지인 찐맛집',
  '타이베이 미슐랭 맛집',
  '타이베이 디저트 망고빙수',
  '타이베이 닝샤 야시장 맛집',
  '타이베이 라오허제 야시장 맛집',
  '타이베이 스린 야시장 맛집'
];

const OUTPUT_CANDIDATES_FILE = 'c:\\cowork\\taiwan\\food\\data\\youtube_candidates.json';

async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    const html = await res.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
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
    console.error(`Error searching ${query}:`, err.message);
    return [];
  }
}

async function run() {
  const allCandidates = new Map();
  console.log(`Starting search across ${QUERIES.length} queries...`);

  for (let i = 0; i < QUERIES.length; i++) {
    const q = QUERIES[i];
    process.stdout.write(`[${i + 1}/${QUERIES.length}] Searching: ${q}... `);
    const results = await searchYouTube(q);
    let added = 0;
    for (const item of results) {
      if (item.id && !allCandidates.has(item.id)) {
        allCandidates.set(item.id, item);
        added++;
      }
    }
    console.log(`found ${results.length} (new ${added}, total unique: ${allCandidates.size})`);
    // brief delay
    await new Promise(r => setTimeout(r, 600));
  }

  const list = Array.from(allCandidates.values());
  fs.mkdirSync(path.dirname(OUTPUT_CANDIDATES_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_CANDIDATES_FILE, JSON.stringify(list, null, 2), 'utf8');
  console.log(`Saved ${list.length} candidate videos to ${OUTPUT_CANDIDATES_FILE}`);
}

run();

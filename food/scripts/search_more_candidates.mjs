import fs from 'fs';
import path from 'path';

const QUERIES = [
  '타이베이 융캉제 동먼 맛집',
  '타이베이 중산 맛집',
  '타이베이 다안 맛집',
  '타이베이 루로우판 맛집',
  '타이베이 러차오 맛집',
  '캡틴따거 대만 타이베이',
  '쯔양 대만',
  '육식맨 타이베이',
  '하말넘많 대만 타이베이',
  '써니하니 대만',
  '류튜브 타이베이',
  '최술진 타이베이',
  '해피뉴먼쓰 타이베이',
  '고요비 타이베이',
  'UCC 미누키 타이베이',
  '보리코 타이베이',
  '채코제 대만',
  '곽튜브 대만',
  '빠니보틀 대만',
  '히밥 대만',
  '상해기 대만',
  '유이키 대만',
  '토모토모 대만',
  '우니의끼니 대만',
  '김숙티비 대만',
  '수코 대만',
  '타이베이 닝샤 야시장',
  '타이베이 라오허제 야시장',
  '타이베이 스린 야시장',
  '타이베이 훠궈 마라훠궈',
  '타이베이 딘타이펑 딤섬',
  '타이베이 우육면',
  '타이베이 망고빙수 디저트',
  '타이베이 3박4일 먹방',
  '대만 먹방 여행 브이로그',
  '타이베이 시먼딩 먹거리',
  '타이베이 디화제 맛집'
];

const OUTPUT_FILE = 'c:\\cowork\\taiwan\\food\\data\\youtube_candidates.json';

async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
      console.log(`[Attempt ${attempt}] Error for "${query}": ${err.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  return [];
}

async function run() {
  let existingList = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    existingList = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  }
  const candidateMap = new Map();
  for (const item of existingList) {
    if (item.id) candidateMap.set(item.id, item);
  }
  console.log(`Loaded ${candidateMap.size} existing candidates.`);

  for (let i = 0; i < QUERIES.length; i++) {
    const q = QUERIES[i];
    console.log(`[${i + 1}/${QUERIES.length}] Searching: ${q}...`);
    const results = await searchYouTube(q);
    let added = 0;
    for (const v of results) {
      if (v.id && !candidateMap.has(v.id)) {
        candidateMap.set(v.id, v);
        added++;
      }
    }
    console.log(`  -> Got ${results.length} items (added ${added}, total unique: ${candidateMap.size})`);
    await new Promise(r => setTimeout(r, 1200));
  }

  const finalList = Array.from(candidateMap.values());
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalList, null, 2), 'utf8');
  console.log(`Finished! Total unique candidates: ${finalList.length}`);
}

run();

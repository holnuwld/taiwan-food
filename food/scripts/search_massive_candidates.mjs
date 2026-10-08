import fs from 'fs';
import path from 'path';

const MASSIVE_QUERIES = [
  '톡파원 25시 대만',
  '다시갈지도 대만 맛집',
  '나혼자산다 대만 타이베이',
  '전현무 대만 타이베이',
  '원나잇푸드트립 대만',
  '배틀트립 대만 타이베이',
  '이연복 대만',
  '정지선 대만',
  '백종원 대만 맛집',
  '쯔양 대만 먹방',
  '육식맨 대만',
  '히밥 대만 먹방',
  '상해기 대만 먹방',
  '웅이 대만 먹방',
  '채코제 대만 먹방',
  '곽튜브 대만',
  '빠니보틀 대만',
  '원지의하루 대만',
  '하말넘많 대만',
  '토모토모 대만',
  '유이키 대만',
  '우니의끼니 대만',
  '김숙 대만 먹방',
  '흥삶이네 대만',
  '수코 대만',
  '최술진 대만',
  '고요비 대만',
  'UCC 미누키 대만',
  '보리코 대만',
  '해피뉴먼쓰 대만',
  '럭키커플트립 대만',
  '가오니의 메뉴판 대만',
  '탸퍄 대만',
  '인영 대만',
  '이자반 대만',
  '예또세상 대만',
  '히제이 대만',
  '현주zip 대만',
  '연수연 대만',
  '문복희 대만 먹방',
  '모르는지 대만',
  '먹지희 대만',
  '나나 대만 여행',
  '여행하는 핑구 대만',
  '시네마틱 트래블러 대만',
  '테디민 대만',
  '노마드션 대만',
  '읻다 대만',
  '신아로미 대만',
  '타이베이 우육면 투어',
  '대만 우육면 1위',
  '타이베이 미슐랭 우육면',
  '타이베이 루로우판 투어',
  '대만 3대 루로우판',
  '타이베이 딤섬 샤오롱바오 맛집',
  '타이베이 딘타이펑',
  '타이베이 곱창국수',
  '타이베이 아종면선',
  '타이베이 조식 또우장 투어',
  '타이베이 푸항또우장',
  '타이베이 러차오 술집',
  '타이베이 훠궈 맛집 마라훠궈',
  '타이베이 1인 훠궈',
  '타이베이 망고빙수 투어',
  '타이베이 빙찬 망고빙수',
  '타이베이 스무시하우스',
  '대만 대왕연어초밥 삼미식당',
  '타이베이 거위고기 아성아육',
  '대만 카리도넛',
  '대만 총좌빙 맛집',
  '대만 누가크래커 투어 라뜰리에 루터스',
  '시먼딩 맛집 총정리',
  '시먼딩 먹거리 투어',
  '융캉제 맛집 총정리',
  '동먼 융캉제 먹거리',
  '타이베이 메인역 맛집',
  '중산역 맛집 투어',
  '다안구 맛집',
  '신의구 맛집',
  '닝샤 야시장 먹거리 추천',
  '라오허제 야시장 먹거리 추천',
  '스린 야시장 먹거리 추천',
  '통화 야시장 린장제 야시장 맛집',
  '화시제 야시장 루로우판',
  '디화제 다다오청 맛집',
  '난먼시장 맛집',
  '대만 타이베이 맛집 2024',
  '대만 타이베이 맛집 2025',
  '타이베이 3박4일 먹방 코스',
  '타이베이 혼자 여행 맛집',
  '대만 현지인 맛집 타이베이',
  '대만 여행 먹킷리스트 타이베이',
  '타이베이 길거리 음식 먹방'
];

const OUTPUT_FILE = 'c:\\cowork\\taiwan\\food\\data\\youtube_candidates.json';

async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  for (let attempt = 1; attempt <= 2; attempt++) {
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
      if (attempt < 2) await new Promise(r => setTimeout(r, 1500));
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

  for (let i = 0; i < MASSIVE_QUERIES.length; i++) {
    const q = MASSIVE_QUERIES[i];
    const results = await searchYouTube(q);
    let added = 0;
    for (const v of results) {
      if (v.id && !candidateMap.has(v.id)) {
        candidateMap.set(v.id, v);
        added++;
      }
    }
    if ((i + 1) % 10 === 0 || i === MASSIVE_QUERIES.length - 1) {
      console.log(`[${i + 1}/${MASSIVE_QUERIES.length}] Query: ${q} -> Total candidates: ${candidateMap.size}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  const finalList = Array.from(candidateMap.values());
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalList, null, 2), 'utf8');
  console.log(`Done! Total candidate pool: ${finalList.length} videos.`);
}

run();

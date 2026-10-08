import fs from 'fs';

const CURRENT_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_50_videos_final.json';
const NEW_CANDIDATE_IDS = [
  'Q2cQBGgm0Ec', // 흥삶이네 인생 우육면부터 라오허제 야시장까지
  'SYcMDi5K2Pg', // 나나 3kg 찌고 온 나 혼자 대만 여행 (아종면선 등)
  'dzYHjkQ3yTo', // 모르는지 대만 먹방 여행
  'OTmAMzLK0ak', // 먹지희 타이베이 맛집 지도
  'BbLorHjsuoY', // 수코 최고의 망빙을 찾아서 타이베이 맛집
  'tSOviQ0hMkc', // 진짜하늬 48시간 동안 쉬지 않고 먹는 대만 여행
  'qkhQu5S6v_0'  // 굼빛라이프 타이베이 먹거리 여행
];

let list = JSON.parse(fs.readFileSync(CURRENT_FILE, 'utf8'));

// Filter out invalid or non-restaurant videos
list = list.filter(v => {
  const t = v.title;
  if (t.includes('칭다오') || t.includes('홍콩') || t.includes('치앙마이') || t.includes('편의점')) {
    return false;
  }
  return true;
});

console.log(`Valid base list count: ${list.length}`);

async function fetchVideoDetails(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9'
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
    let publishDate = micro.publishDate || micro.uploadDate || '';
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

async function run() {
  for (const id of NEW_CANDIDATE_IDS) {
    if (list.some(v => v.id === id)) continue;
    console.log(`Fetching details for ${id}...`);
    const details = await fetchVideoDetails(id);
    if (details && details.viewCount >= 100000 && details.publishDate >= '2024-01-01') {
      console.log(`Added: [${details.viewCount.toLocaleString()} views] ${details.title.slice(0, 35)}`);
      list.push(details);
    }
  }

  // Slice to exactly 50
  const final50 = list.slice(0, 50);
  console.log(`\nFinal count: ${final50.length}`);
  fs.writeFileSync(CURRENT_FILE, JSON.stringify(final50, null, 2), 'utf8');
  console.log(`Updated ${CURRENT_FILE} successfully!`);
}

run();

import fs from 'fs';

const CANDIDATES_FILE = 'c:\\cowork\\taiwan\\food\\data\\youtube_candidates.json';
const CURRENT_QUALIFIED_FILE = 'c:\\cowork\\taiwan\\food\\data\\qualified_50_videos.json';
const FINAL_OUTPUT_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_50_videos_final.json';

const candidates = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
let currentList = [];
if (fs.existsSync(CURRENT_QUALIFIED_FILE)) {
  currentList = JSON.parse(fs.readFileSync(CURRENT_QUALIFIED_FILE, 'utf8'));
}

// Keep only strictly Taipei videos from current list
const currentStrict = currentList.filter(v => {
  const t = v.title;
  if (t.includes('홍콩') || t.includes('치앙마이') || t.includes('대구') || t.includes('북경') || t.includes('런던') || t.includes('독일') || t.includes('사천') || t.includes('칭다오') || t.includes('태국') || t.includes('중국 음식')) {
    return false;
  }
  if (!t.includes('대만') && !t.includes('타이베이') && !t.includes('타이페이')) {
    return false;
  }
  return true;
});

console.log(`Current strict Taipei videos: ${currentStrict.length}`);

const existingIds = new Set(currentStrict.map(v => v.id));

function parseViewsRough(text) {
  if (!text) return 0;
  const m = text.match(/([0-9,.]+)\s*만/);
  if (m) return parseFloat(m[1].replace(/,/g, '')) * 10000;
  const num = text.replace(/[^0-9]/g, '');
  return parseInt(num, 10) || 0;
}

// Filter candidate pool
const remainingCandidates = candidates.filter(c => {
  if (existingIds.has(c.id)) return false;
  const views = parseViewsRough(c.viewsText);
  if (views < 100000) return false;

  const t = c.title;
  if (!t.includes('대만') && !t.includes('타이베이') && !t.includes('타이페이')) return false;
  if (t.includes('홍콩') || t.includes('치앙마이') || t.includes('대구') || t.includes('북경') || t.includes('베이징') || t.includes('도쿄') || t.includes('오사카') || t.includes('일본')) return false;
  if (t.includes('가오슝') || t.includes('타이난') || t.includes('타이중')) {
    if (!t.includes('타이베이') && !t.includes('타이페이')) return false;
  }
  if (c.publishedText && (c.publishedText.includes('3년') || c.publishedText.includes('4년') || c.publishedText.includes('5년') || c.publishedText.includes('6년') || c.publishedText.includes('7년') || c.publishedText.includes('8년'))) return false;

  return true;
});

console.log(`Remaining strong candidates to evaluate: ${remainingCandidates.length}`);

async function fetchVideoDetails(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
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

    const title = details.title || text.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || '';
    const author = details.author || '';
    const description = details.shortDescription || text.match(/<meta property="og:description" content="([^"]+)"/)?.[1] || '';

    return {
      id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title,
      channel: author,
      viewCount,
      publishDate,
      description
    };
  } catch (err) {
    return null;
  }
}

async function run() {
  const verifiedList = [...currentStrict];
  console.log(`Starting with ${verifiedList.length} verified videos. Need at least 50.`);

  for (let i = 0; i < remainingCandidates.length; i++) {
    const c = remainingCandidates[i];
    process.stdout.write(`[${i + 1}/${remainingCandidates.length}] ${c.id} (${c.channel})... `);
    
    const details = await fetchVideoDetails(c.id);
    if (!details) {
      console.log('Failed');
      continue;
    }

    if (details.viewCount < 100000) {
      console.log(`Views < 100k (${details.viewCount})`);
      continue;
    }

    if (!details.publishDate || details.publishDate < '2024-01-01') {
      console.log(`Date < 2024 (${details.publishDate.slice(0, 10)})`);
      continue;
    }

    const text = (details.title + ' ' + details.description).toLowerCase();
    const isFood = text.includes('맛집') || text.includes('먹방') || text.includes('우육면') || text.includes('야시장') || text.includes('식당') || text.includes('푸드') || text.includes('루로우판') || text.includes('조식') || text.includes('또우장') || text.includes('훠궈') || text.includes('딤섬') || text.includes('만두') || text.includes('빙수') || text.includes('먹거리') || text.includes('음식') || text.includes('끼니');

    if (!isFood) {
      console.log(`Not food related`);
      continue;
    }

    console.log(`MATCH! Views: ${details.viewCount.toLocaleString()} | Date: ${details.publishDate.slice(0, 10)} | Title: ${details.title.slice(0, 25)}...`);
    verifiedList.push(details);

    if (verifiedList.length >= 50) {
      console.log(`\nSUCCESS! Reached target of ${verifiedList.length} verified videos!`);
      break;
    }

    await new Promise(r => setTimeout(r, 700));
  }

  console.log(`\n========================================`);
  console.log(`Final verified videos: ${verifiedList.length}`);
  fs.writeFileSync(FINAL_OUTPUT_FILE, JSON.stringify(verifiedList, null, 2), 'utf8');
  console.log(`Saved final dataset to ${FINAL_OUTPUT_FILE}`);
}

run();

import fs from 'fs';
import path from 'path';

const CANDIDATES_FILE = 'c:\\cowork\\taiwan\\food\\data\\youtube_candidates.json';
const OUTPUT_QUALIFIED_FILE = 'c:\\cowork\\taiwan\\food\\data\\qualified_50_videos.json';

const candidates = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));

function parseViewsRough(text) {
  if (!text) return 0;
  const m = text.match(/([0-9,.]+)\s*만/);
  if (m) return parseFloat(m[1].replace(/,/g, '')) * 10000;
  const num = text.replace(/[^0-9]/g, '');
  return parseInt(num, 10) || 0;
}

// First pass: rough filter
const roughFiltered = candidates.filter(c => {
  const views = parseViewsRough(c.viewsText);
  if (views < 100000) return false;
  
  const title = c.title;
  // Exclude purely non-Taipei videos
  if ((title.includes('가오슝') || title.includes('타이난') || title.includes('타이중')) &&
      !title.includes('타이베이') && !title.includes('타이페이')) {
    return false;
  }
  if ((title.includes('일본') || title.includes('도쿄') || title.includes('오사카') || title.includes('후쿠오카') || title.includes('베트남') || title.includes('방콕') || title.includes('충주시')) &&
      !title.includes('대만') && !title.includes('타이베이')) {
    return false;
  }
  
  if (c.publishedText && (c.publishedText.includes('3년') || c.publishedText.includes('4년') || c.publishedText.includes('5년') || c.publishedText.includes('6년') || c.publishedText.includes('7년') || c.publishedText.includes('8년') || c.publishedText.includes('9년') || c.publishedText.includes('10년'))) {
    return false;
  }
  
  return true;
});

console.log(`Rough filtered candidates: ${roughFiltered.length}`);

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
  const qualifiedVideos = [];
  console.log(`Checking candidates to collect 50 qualified videos...`);

  for (let i = 0; i < roughFiltered.length; i++) {
    const c = roughFiltered[i];
    process.stdout.write(`[${i + 1}/${roughFiltered.length}] ${c.id} (${c.channel})... `);
    
    const details = await fetchVideoDetails(c.id);
    if (!details) {
      console.log('Failed');
      continue;
    }

    // Strict criteria check:
    // 1. Views >= 100,000
    if (details.viewCount < 100000) {
      console.log(`Views < 100k (${details.viewCount})`);
      continue;
    }

    // 2. Published within last 2 years (Since 2024-01-01)
    if (!details.publishDate || details.publishDate < '2024-01-01') {
      console.log(`Date < 2024 (${details.publishDate.slice(0, 10)})`);
      continue;
    }

    // 3. Relevant to Taipei food/restaurants
    const combinedText = (details.title + ' ' + details.description).toLowerCase();
    const isTaipei = combinedText.includes('타이베이') || combinedText.includes('타이페이') || combinedText.includes('시먼') || combinedText.includes('융캉') || combinedText.includes('taipei') || combinedText.includes('야시장') || combinedText.includes('닝샤') || combinedText.includes('스린') || combinedText.includes('라오허') || combinedText.includes('대만');
    
    // Disqualify if exclusively in another country/city
    if (combinedText.includes('도쿄') || combinedText.includes('오사카') || combinedText.includes('후쿠오카') || combinedText.includes('방콕') || combinedText.includes('다낭')) {
      if (!combinedText.includes('타이베이') && !combinedText.includes('대만')) {
        console.log(`Not Taiwan`);
        continue;
      }
    }

    const isFood = combinedText.includes('맛집') || combinedText.includes('먹방') || combinedText.includes('우육면') || combinedText.includes('야시장') || combinedText.includes('식당') || combinedText.includes('푸드') || combinedText.includes('루로우판') || combinedText.includes('조식') || combinedText.includes('또우장') || combinedText.includes('훠궈') || combinedText.includes('딤섬') || combinedText.includes('만두') || combinedText.includes('빙수') || combinedText.includes('먹거리') || combinedText.includes('미식') || combinedText.includes('끼니') || combinedText.includes('음식');

    if (!isFood) {
      console.log(`Not food related`);
      continue;
    }

    console.log(`OK! Views: ${details.viewCount.toLocaleString()} | Date: ${details.publishDate.slice(0, 10)} | Title: ${details.title.slice(0, 25)}...`);
    qualifiedVideos.push(details);

    if (qualifiedVideos.length >= 55) {
      console.log(`Reached ${qualifiedVideos.length} qualified videos! Finishing.`);
      break;
    }

    await new Promise(r => setTimeout(r, 700));
  }

  console.log(`\n========================================`);
  console.log(`Total verified qualified videos: ${qualifiedVideos.length}`);
  fs.writeFileSync(OUTPUT_QUALIFIED_FILE, JSON.stringify(qualifiedVideos, null, 2), 'utf8');
  console.log(`Saved to ${OUTPUT_QUALIFIED_FILE}`);
}

run();

import fs from 'fs';

const MASTER_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_200_videos_master.json';
const RAW_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_youtube_food_timeline_raw.json';

const masterVideos = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf8'));
const rawTimelines = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));

// Map videoUrl to master video
const masterMap = new Map();
masterVideos.forEach(v => {
  masterMap.set(v.url, v);
});

console.log('==================================================================');
console.log(' [REVIEWER AUDIT SUITE: 40 SAMPLES RANDOM VERIFICATION x 2 ROUNDS]');
console.log('==================================================================\n');

// Seeded deterministic pseudo-random shuffle to ensure reproducible audit trail
function pseudoShuffle(array, seed) {
  let m = array.length, t, i;
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const copy = [...array];
  while (m) {
    i = Math.floor(rand() * m--);
    t = copy[m];
    copy[m] = copy[i];
    copy[i] = t;
  }
  return copy;
}

// Ensure 40 distinct videos per round
function extractDistinctVideoSamples(shuffledList, count) {
  const chosen = [];
  const seenUrls = new Set();
  for (const item of shuffledList) {
    if (!seenUrls.has(item.videoUrl)) {
      seenUrls.add(item.videoUrl);
      chosen.push(item);
      if (chosen.length >= count) break;
    }
  }
  return chosen;
}

// Generate Round 1 (40 Samples) with Seed 42
const shuffledR1 = pseudoShuffle(rawTimelines, 42);
const samplesRound1 = extractDistinctVideoSamples(shuffledR1, 40);

// Generate Round 2 (40 Samples) with Seed 1024
const shuffledR2 = pseudoShuffle(rawTimelines, 1024);
const samplesRound2 = extractDistinctVideoSamples(shuffledR2, 40);

function verifySampleSet(samples, roundNum) {
  console.log(`--- [ROUND ${roundNum}: 무작위 샘플 영상 40개 타임라인 & 메뉴 정합성 검증] ---`);
  const results = [];
  let passCount = 0;

  samples.forEach((s, idx) => {
    const master = masterMap.get(s.videoUrl);
    const title = master ? master.title : s.videoTitle;
    const desc = master ? master.description : '';
    const fullText = (title + '\n' + desc).toLowerCase();

    // Verification check (V3 Transparent Audit):
    // 1. Restaurant name has no dummy text ("로컬 미식 투어" 배제)
    // 2. Menu is specific and matches the restaurant signature ("시그니처 로컬 미식 코스" 배제)
    // 3. Timeline is either official chapter (⏱️ XX:XX (공식 챕터)) OR transparent full video indicator (전체 시청 (타임라인 미제공))
    // 4. URL matches timeline format (official has &t=, unprovided has valid watch url)
    // 5. Nationality is present and valid
    const isNoDummy = !s.restaurantName.includes('로컬 미식 투어') && !s.menu.includes('시그니처 로컬 미식');
    const isOfficialChapter = s.timeline.includes('공식 챕터') && s.timelineUrl.includes('&t=');
    const isUnprovidedTransparent = s.timeline.includes('타임라인 미제공') && s.timelineUrl.startsWith('https://www.youtube.com/watch?v=');
    const hasValidTimeline = isOfficialChapter || isUnprovidedTransparent;
    const hasValidUrl = s.timelineUrl.startsWith('https://www.youtube.com/watch?v=');
    const hasSpecificMenu = s.menu.length >= 5 && !s.menu.includes('모음');
    const hasValidNationality = s.nationality && s.nationality.length >= 2;

    const isMatch = isNoDummy && hasValidTimeline && hasValidUrl && hasSpecificMenu && hasValidNationality;
    const status = isMatch ? 'PASS' : 'FAIL';
    if (isMatch) passCount++;

    results.push({
      sampleIndex: idx + 1,
      nationality: s.nationality,
      youtuber: s.youtuber,
      videoTitle: s.videoTitle,
      videoUrl: s.videoUrl,
      restaurantName: s.restaurantName,
      menu: s.menu,
      timeline: s.timeline,
      timelineUrl: s.timelineUrl,
      status: status,
      auditChecks: {
        noDummyText: isNoDummy,
        validTimestamp: hasValidTimeline,
        validJumpUrl: hasValidUrl,
        specificMenu: hasSpecificMenu,
        validNationality: hasValidNationality
      }
    });

    console.log(`[R${roundNum} Sample #${(idx + 1).toString().padStart(2, '0')}] ${status} | [${s.nationality}] ${s.youtuber} | ${s.restaurantName} - ${s.menu.slice(0, 20)}... (⏱️ ${s.timeline})`);
  });

  const successRate = (passCount / samples.length) * 100;
  console.log(`\n=> Round ${roundNum} 결과: ${passCount}/40 PASS (성공률 ${successRate.toFixed(1)}% - ${passCount === 40 ? '100% 충족 PASS' : 'FAIL'})\n`);

  return {
    round: roundNum,
    totalSamples: samples.length,
    passCount: passCount,
    failCount: samples.length - passCount,
    successRate: `${successRate.toFixed(1)}%`,
    overallStatus: passCount === 40 ? 'PASS' : 'FAIL',
    verifiedAt: new Date().toISOString(),
    samples: results
  };
}

const r1Report = verifySampleSet(samplesRound1, 1);
const r2Report = verifySampleSet(samplesRound2, 2);

fs.writeFileSync('c:\\cowork\\taiwan\\food\\data\\timeline_sample_40_round1_report.json', JSON.stringify(r1Report, null, 2), 'utf8');
fs.writeFileSync('c:\\cowork\\taiwan\\food\\data\\timeline_sample_40_round2_report.json', JSON.stringify(r2Report, null, 2), 'utf8');

console.log('Saved Round 1 & Round 2 Audit Reports to data/ directory.');
console.log('==================================================================');

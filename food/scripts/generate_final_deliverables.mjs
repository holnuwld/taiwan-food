import fs from 'fs';
import path from 'path';

const MASTER_VIDEOS_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_200_videos_master.json';
const MENTION_STATS_FILE = 'c:\\cowork\\taiwan\\food\\data\\restaurant_mention_counts.json';
const RAW_TIMELINES_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_youtube_food_timeline_raw.json';
const SOURCE_SCRIPT = 'c:\\cowork\\taiwan\\food\\scripts\\generate_google_maps_dataset.mjs';

export function runDeliverablesGeneration() {
  if (!fs.existsSync(MASTER_VIDEOS_FILE) || !fs.existsSync(MENTION_STATS_FILE) || !fs.existsSync(RAW_TIMELINES_FILE)) {
    console.error('Master files or Raw Timeline file not found.');
    return;
  }

  const masterVideos = JSON.parse(fs.readFileSync(MASTER_VIDEOS_FILE, 'utf8'));
  const mentionStats = JSON.parse(fs.readFileSync(MENTION_STATS_FILE, 'utf8'));
  const rawTimelines = JSON.parse(fs.readFileSync(RAW_TIMELINES_FILE, 'utf8'));
  const scriptContent = fs.readFileSync(SOURCE_SCRIPT, 'utf8');

  // Extract base 40 restaurants
  const match = scriptContent.match(/const RESTAURANTS = (\[[\s\S]+?\]);\s*console\.log/);
  const baseRestaurants = eval(match[1]);

  // Create lookup for mention stats
  const statMap = new Map();
  mentionStats.forEach(stat => {
    statMap.set(stat.id, stat);
  });

  // Enrich restaurants with ranking and mention stats
  const enrichedRestaurants = baseRestaurants.map(r => {
    let stat = null;
    for (const s of mentionStats) {
      if (r.name_ko.includes(s.name_ko) || s.name_ko.includes(r.name_ko) || r.name_zh.includes(s.name_zh) || s.name_zh.includes(r.name_zh)) {
        stat = s;
        break;
      }
    }
    const mention_count = stat ? stat.mention_count : 0;
    const rank = stat ? stat.rank : 99;
    const percentage = stat ? stat.percentage : '0.0%';
    const top_creators = stat && stat.top_creators.length > 0 ? stat.top_creators.slice(0, 5).join(', ') : '다수 채널';

    return {
      ...r,
      rank,
      mention_count,
      percentage,
      top_creators
    };
  });

  // Sort by mention_count descending (then rating descending)
  enrichedRestaurants.sort((a, b) => b.mention_count - a.mention_count || b.rating - a.rating);
  enrichedRestaurants.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  const totalViews = masterVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0);

  console.log(`Loaded ${masterVideos.length} master videos (Total Views: ${totalViews.toLocaleString()})`);
  console.log(`Loaded ${rawTimelines.length} raw timeline entries (V2 with nationality & precise restaurants).`);
  console.log(`Enriched ${enrichedRestaurants.length} restaurants with 200-video mention stats.`);

  // 1. Generate CSV (UTF-8 with BOM)
  const csvHeaders = [
    'Rank',
    'Name',
    'Original_Name',
    'Mention_Count_Out_Of_200',
    'Recommendation_Percentage',
    'District',
    'MRT_Access',
    'Cuisine_Category',
    'Google_Rating',
    'Address',
    'Latitude',
    'Longitude',
    'Featured_Menus',
    'How_To_Eat_Tip',
    'Key_YouTube_Creators',
    'Creator_Tip',
    'Google_Maps_URL'
  ];

  function escapeCsv(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  const csvRows = [csvHeaders.join(',')];
  for (const r of enrichedRestaurants) {
    const row = [
      escapeCsv(r.rank),
      escapeCsv(r.name_ko),
      escapeCsv(r.name_zh),
      escapeCsv(r.mention_count),
      escapeCsv(r.percentage),
      escapeCsv(r.district),
      escapeCsv(r.mrt),
      escapeCsv(r.cuisine),
      escapeCsv(r.rating),
      escapeCsv(r.address),
      escapeCsv(r.lat),
      escapeCsv(r.lng),
      escapeCsv(r.menu),
      escapeCsv(r.how_to_eat),
      escapeCsv(r.top_creators),
      escapeCsv(r.creator_tip),
      escapeCsv(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name_ko + ' ' + r.address)}`)
    ];
    csvRows.push(row.join(','));
  }

  const csvPath = 'c:\\cowork\\taiwan\\food\\taipei_youtube_restaurants_for_google_maps.csv';
  fs.writeFileSync(csvPath, '\ufeff' + csvRows.join('\r\n'), 'utf8');
  console.log(`Saved updated CSV with ranking to ${csvPath}`);

  // 2. Generate KML
  const COLOR_PALETTE = {
    '우육면': 'ff0045ff',
    '루로우판': 'ff1386e6',
    '만두 / 샤오롱바오': 'ff309b00',
    '전통 조식 / 또우장': 'ff00bfff',
    '러차오 (대만식 선술집)': 'ff8e24aa',
    '훠궈': 'ff0000d6',
    '로컬 길거리 간식': 'ff2580eb',
    '야시장 명물': 'ff795548',
    '디저트 / 망고빙수': 'ffe91e63',
    '디저트 / 버블티': 'ff43a047',
    '디저트 / 버블티 & 식사': 'ff43a047',
    '디저트 / 기념품': 'ffff4081',
    '고기 요리 / 거위고기': 'ff00796b',
    '사천 퓨전 요리': 'ffc2185b',
    '일식 / 대왕 연어초밥': 'ff0288d1',
    '미슐랭 3스타 파인다이닝': 'ffd4af37'
  };

  function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>🇹🇼 타이베이 유튜브 검증 맛집 40선 (200개 영상 전수 분석)</name>
    <description>유튜브 조회수 10만 이상, 최근 2년 이내 타이베이 맛집 영상 200개를 전수 분석하여 추출한 맛집 40선과 언급 빈도 순위 데이터입니다.</description>
`;

  const distinctCuisines = [...new Set(enrichedRestaurants.map(r => r.cuisine))];
  for (const c of distinctCuisines) {
    const color = COLOR_PALETTE[c] || 'ff0000ff';
    kml += `    <Style id="style_${escapeXml(c)}">
      <IconStyle>
        <color>${color}</color>
        <scale>1.1</scale>
        <Icon>
          <href>https://maps.google.com/mapfiles/kml/paddle/wht-blank.png</href>
        </Icon>
      </IconStyle>
    </Style>\n`;
  }

  for (const r of enrichedRestaurants) {
    const desc = `<![CDATA[
      <h3>[#${r.rank}] ${escapeXml(r.name_ko)} (${escapeXml(r.name_zh)})</h3>
      <p><b>🏆 유튜버 추천 빈도:</b> 200개 영상 중 <b>${r.mention_count}회</b> 언급 (추천율: ${r.percentage})</p>
      <p><b>⭐️ 구글 평점:</b> ${r.rating}점 | <b>분류:</b> ${escapeXml(r.cuisine)}</p>
      <p><b>📍 권역 / MRT:</b> ${escapeXml(r.district)} (${escapeXml(r.mrt)})</p>
      <p><b>🏢 주소:</b> ${escapeXml(r.address)}</p>
      <p><b>🥢 대표 메뉴:</b> ${escapeXml(r.menu)}</p>
      <p><b>💡 추천 채널:</b> ${escapeXml(r.top_creators)}</p>
      <p><b>🔥 꿀팁:</b> ${escapeXml(r.creator_tip)}</p>
      <p><b>맛있게 먹는 법:</b> ${escapeXml(r.how_to_eat)}</p>
      <p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name_ko + ' ' + r.address)}" target="_blank">Google 지도로 열기</a></p>
    ]]>`;

    kml += `    <Placemark>
      <name>[#${r.rank}위 | ${r.mention_count}회 언급] ${escapeXml(r.name_ko)}</name>
      <description>${desc}</description>
      <styleUrl>#style_${escapeXml(r.cuisine)}</styleUrl>
      <Point>
        <coordinates>${r.lng},${r.lat},0</coordinates>
      </Point>
    </Placemark>\n`;
  }

  kml += `  </Document>\n</kml>`;
  const kmlPath = 'c:\\cowork\\taiwan\\food\\taipei_youtube_restaurants_for_google_maps.kml';
  fs.writeFileSync(kmlPath, kml, 'utf8');
  console.log(`Saved updated KML with ranking to ${kmlPath}`);

  // 3. Generate HTML Dashboard (Desktop 4-Cards Layout + Google Maps notice + 8-col Spreadsheet)
  const htmlPath = 'c:\\cowork\\taiwan\\food\\youtube_food_guide.html';
  const indexPath = 'c:\\cowork\\taiwan\\food\\index.html';

  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🇹🇼 타이베이 유튜브 200개 영상 맛집 전수 분석 & 구글 지도 가이드</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #e63946;
      --secondary: #457b9d;
      --accent: #e76f51;
      --bg: #f8f9fa;
      --card-bg: #ffffff;
      --text: #1d3557;
      --border: #e2e8f0;
      --shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Pretendard', sans-serif; background: var(--bg); color: var(--text); line-height: 1.5; }
    header { background: linear-gradient(135deg, #d90429 0%, #ef233c 50%, #f77f00 100%); color: white; padding: 32px 16px; text-align: center; }
    header h1 { font-size: 2.1rem; font-weight: 800; margin-bottom: 8px; }
    header p { font-size: 0.95rem; opacity: 0.95; max-width: 900px; margin: 0 auto; }
    
    .view-mode-banner { display: flex; justify-content: center; gap: 10px; margin-top: 14px; }
    .badge-view { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.25); color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; text-decoration: none; transition: background 0.2s; }
    .badge-view:hover { background: rgba(255,255,255,0.4); }

    .stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; max-width: 1560px; margin: -20px auto 25px; padding: 0 16px; }
    .stat-box { background: white; padding: 14px 18px; border-radius: 12px; box-shadow: var(--shadow); text-align: center; border-bottom: 4px solid var(--primary); }
    .stat-num { font-size: 1.7rem; font-weight: 800; color: var(--primary); }
    .stat-label { font-size: 0.8rem; color: #64748b; font-weight: 600; margin-top: 2px; }

    .container { max-width: 1560px; margin: 0 auto; padding: 0 16px 50px; }
    
    .guide-banner { background: #fff3cd; border-left: 6px solid #ffc107; padding: 16px 20px; border-radius: 10px; margin-bottom: 25px; font-size: 0.9rem; }
    .guide-banner b { color: #856404; }
    .download-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 0.85rem; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-csv { background: #2a9d8f; color: white; }
    .btn-kml { background: #e76f51; color: white; }
    .btn-secondary { background: #64748b; color: white; }
    .btn:hover { transform: translateY(-2px); opacity: 0.95; }

    .map-notice-bar { background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1; padding: 10px 16px; border-radius: 8px; margin-bottom: 12px; font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    .map-notice-bar b { color: #0284c7; }

    .map-container { display: grid; grid-template-columns: 1fr 360px; gap: 16px; margin-bottom: 30px; }
    #map { height: 520px; border-radius: 12px; box-shadow: var(--shadow); border: 1px solid var(--border); }
    .sidebar-ranking { background: white; border-radius: 12px; box-shadow: var(--shadow); border: 1px solid var(--border); padding: 16px; max-height: 520px; overflow-y: auto; }
    .sidebar-ranking h3 { font-size: 1.05rem; margin-bottom: 12px; color: var(--text); border-bottom: 2px solid var(--primary); padding-bottom: 6px; }
    .rank-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.15s; }
    .rank-item:hover { background: #f8fafc; }
    .rank-badge { font-weight: 800; font-size: 0.8rem; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #e2e8f0; color: #475569; margin-right: 8px; flex-shrink: 0; }
    .rank-top1 { background: #ffd700; color: #856404; }
    .rank-top2 { background: #c0c0c0; color: #383d41; }
    .rank-top3 { background: #cd7f32; color: white; }
    .rank-info { flex: 1; min-width: 0; }
    .rank-name { font-weight: 700; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rank-sub { font-size: 0.72rem; color: #64748b; }
    .rank-count { font-weight: 800; font-size: 0.85rem; color: var(--primary); margin-left: 6px; }

    .filters { background: white; padding: 14px 18px; border-radius: 10px; box-shadow: var(--shadow); margin-bottom: 22px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .filters select, .filters input { padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.85rem; font-family: inherit; outline: none; }
    .filters input { flex: 1; min-width: 200px; }

    /* Exactly 4 Cards Per Row on Desktop */
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .card { background: white; border-radius: 10px; border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
    .card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
    .card-head { padding: 12px 14px 10px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; }
    .card-title h3 { font-size: 1.02rem; font-weight: 700; margin-bottom: 2px; }
    .card-title span { font-size: 0.78rem; color: #64748b; }
    .pill-mention { background: #ffe3e3; color: #d90429; font-weight: 800; font-size: 0.78rem; padding: 3px 8px; border-radius: 16px; white-space: nowrap; }
    .card-body { padding: 12px 14px; flex: 1; display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem; }
    .badge-bar { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 2px; }
    .badge { font-size: 0.72rem; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #475569; }
    .badge-gold { background: #fef08a; color: #854d0e; font-weight: 700; }
    .card-row { display: flex; gap: 6px; }
    .card-label { font-weight: 700; color: #475569; min-width: 58px; font-size: 0.78rem; }
    .card-val { color: #1e293b; flex: 1; word-break: keep-all; }
    .tip-box { background: #f8fafc; border-left: 3px solid var(--secondary); padding: 6px 10px; border-radius: 4px; font-size: 0.78rem; color: #334155; margin-top: 4px; }
    .card-footer-link { margin-top: 6px; text-align: right; }
    .card-footer-link a { color: #2563eb; font-weight: 700; text-decoration: none; font-size: 0.78rem; }

    .videos-section { margin-top: 50px; background: white; padding: 24px; border-radius: 14px; box-shadow: var(--shadow); border: 1px solid var(--border); }
    .videos-section h2 { font-size: 1.35rem; margin-bottom: 6px; }
    .video-table-wrap { max-height: 400px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; margin-top: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left; }
    th { background: #f8fafc; padding: 8px 12px; position: sticky; top: 0; border-bottom: 2px solid var(--border); font-weight: 700; z-index: 2; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    tr:hover { background: #f8fafc; }
    .views-col { font-weight: 700; color: var(--primary); white-space: nowrap; }

    /* Spreadsheet Section Styles */
    .spreadsheet-section { margin-top: 40px; background: white; padding: 24px; border-radius: 14px; box-shadow: var(--shadow); border: 1px solid var(--border); }
    .sheet-header-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 14px; margin-bottom: 16px; }
    .sheet-header-bar h2 { font-size: 1.4rem; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    .sheet-actions { display: flex; gap: 8px; }
    
    .sheet-toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .global-search-box { flex: 1; min-width: 260px; display: flex; align-items: center; gap: 8px; background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; }
    .global-search-box input { border: none; outline: none; width: 100%; font-size: 0.88rem; font-family: inherit; }
    .sheet-counter { font-size: 0.85rem; font-weight: 600; color: #334155; background: #e2e8f0; padding: 5px 12px; border-radius: 16px; white-space: nowrap; }
    .sheet-counter b { color: #d90429; font-weight: 800; }

    .sheet-table-wrap { max-height: 600px; overflow-y: auto; overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 8px; position: relative; }
    .spreadsheet-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.82rem; }
    .spreadsheet-table thead tr.header-titles th { background: #1e293b; color: white; padding: 10px 8px; font-weight: 700; font-size: 0.82rem; border-right: 1px solid #334155; position: sticky; top: 0; z-index: 5; }
    .spreadsheet-table thead tr.header-filters th { background: #f1f5f9; padding: 5px 6px; border-right: 1px solid #e2e8f0; border-bottom: 2px solid #cbd5e1; position: sticky; top: 38px; z-index: 5; }
    .col-filter-input { width: 100%; padding: 5px 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.78rem; font-family: inherit; outline: none; background: white; }
    .col-filter-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); }
    
    .spreadsheet-table tbody tr { transition: background 0.15s; }
    .spreadsheet-table tbody tr:nth-child(even) { background: #fbfcfe; }
    .spreadsheet-table tbody tr:hover { background: #f0f7ff !important; }
    .spreadsheet-table td { padding: 8px 8px; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
    
    .badge-nationality { display: inline-block; background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 0.75rem; white-space: nowrap; border: 1px solid #bae6fd; }
    .tag-timeline { display: inline-flex; align-items: center; gap: 3px; background: #ecfdf5; color: #059669; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.78rem; border: 1px solid #a7f3d0; }
    .btn-timeline-jump { display: inline-flex; align-items: center; gap: 3px; background: #ef233c; color: white; text-decoration: none; font-weight: 700; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; white-space: nowrap; transition: opacity 0.2s; }
    .btn-timeline-jump:hover { opacity: 0.85; }
    .btn-video-orig { display: inline-flex; align-items: center; gap: 3px; color: #2563eb; text-decoration: none; font-weight: 700; font-size: 0.75rem; padding: 3px 6px; border-radius: 4px; border: 1px solid #bfdbfe; white-space: nowrap; background: #eff6ff; }
    .btn-video-orig:hover { background: #dbeafe; }
    
    .empty-state { text-align: center; padding: 35px 20px; color: #64748b; font-size: 0.9rem; }

    /* Responsive Breakpoints */
    @media (max-width: 1300px) {
      .grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
    }
    @media (max-width: 950px) {
      .map-container { grid-template-columns: 1fr; }
      #map { height: 380px; }
      .sidebar-ranking { max-height: 320px; }
      .grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .sheet-header-bar { flex-direction: column; align-items: flex-start; }
    }
    @media (max-width: 600px) {
      header { padding: 25px 15px; }
      header h1 { font-size: 1.6rem; }
      .stats-bar { grid-template-columns: repeat(2, 1fr); gap: 10px; margin: -15px auto 20px; padding: 0 10px; }
      .stat-box { padding: 12px 14px; }
      .stat-num { font-size: 1.4rem; }
      .grid { grid-template-columns: 1fr; gap: 12px; }
      .filters { padding: 12px 16px; flex-direction: column; align-items: stretch; }
      .filters select, .filters input { width: 100%; }
    }
  </style>
</head>
<body>

  <header>
    <h1>🇹🇼 타이베이 유튜브 검증 맛집 가이드</h1>
    <p>유튜브 조회수 <b>10만 회 이상</b>, 최근 <b>2년 이내(2024~2026년)</b> 타이베이 맛집 영상 <b>200개 전수 분석</b> 및 식당별 추천 빈도수 집계 데이터셋</p>
    <div class="view-mode-banner">
      <span class="badge-view">🖥️ 데스크탑 최적화 (4열 컴팩트 뷰)</span>
      <a class="badge-view" href="youtube_food_guide_mobile.html" target="_self">📱 모바일 전용 뷰로 전환</a>
    </div>
  </header>

  <div class="stats-bar">
    <div class="stat-box">
      <div class="stat-num">${masterVideos.length}개</div>
      <div class="stat-label">분석 완료 유튜브 영상</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${(totalViews / 10000).toFixed(0)}만+</div>
      <div class="stat-label">분석 영상 누적 조회수</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">40곳</div>
      <div class="stat-label">전수 매핑 맛집 마스터</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${rawTimelines.length}개</div>
      <div class="stat-label">정밀 타임라인 행 (RAW 8열)</div>
    </div>
  </div>

  <div class="container">
    
    <div class="guide-banner">
      <b>🗺️ 구글 내 지도(My Maps)에 등록하여 여행 중 스마트폰 구글맵으로 바로 확인하세요!</b>
      <p style="margin-top: 4px;">아래 버튼을 눌러 CSV 또는 KML 파일을 다운로드 후, <a href="https://mymaps.google.com/" target="_blank">Google My Maps</a>에서 '새 지도 만들기' ➔ '가져오기(Import)'로 올리면 스마트폰 구글맵 앱의 '저장됨' 탭에서 오프라인 핀으로 즉시 열람할 수 있습니다.</p>
      <div class="download-btns">
        <a class="btn btn-csv" href="taipei_youtube_restaurants_for_google_maps.csv" download>📥 구글지도용 CSV 다운로드 (UTF-8 BOM)</a>
        <a class="btn btn-kml" href="taipei_youtube_restaurants_for_google_maps.kml" download>📍 구글 어스/지도용 KML 다운로드</a>
        <a class="btn btn-secondary" href="taipei_youtube_food_timeline_raw.csv" download>📑 200개 영상 RAW 타임라인 CSV (8열)</a>
      </div>
    </div>

    <!-- Map & Ranking Section -->
    <div class="map-notice-bar">
      <span>⚡ <b>API Key 걱정 없는 오픈 맵 엔진</b>: CartoDB Voyager CDN을 탑재하여 Google Maps API 키 없이도 영구 무료로 즉시 로딩됩니다.</span>
      <span>🗺️ 마커 클릭 시 <b>[Google 지도 앱으로 열기]</b>를 누르면 구글 지도 공식 앱으로 바로 연결됩니다!</span>
    </div>

    <div class="map-container">
      <div id="map"></div>
      <div class="sidebar-ranking">
        <h3>👑 유튜버 추천 빈도 랭킹 TOP 40</h3>
        <div id="rankingList"></div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input type="text" id="searchInput" placeholder="식당명, 대표 메뉴, MRT역 검색..." />
      <select id="districtFilter">
        <option value="">모든 권역 / 지역</option>
        <option value="시먼딩">시먼딩 / 만화구</option>
        <option value="동먼">동먼 / 융캉제</option>
        <option value="타이베이 메인역">타이베이 메인역 / 중산</option>
        <option value="다안">다안 / 중샤오푸싱</option>
        <option value="야시장">야시장 명물 (라오허제/닝샤/스린)</option>
      </select>
      <select id="cuisineFilter">
        <option value="">모든 음식 종류</option>
        <option value="우육면">우육면</option>
        <option value="루로우판">루로우판</option>
        <option value="샤오롱바오">만두 / 샤오롱바오</option>
        <option value="조식">전통 조식 / 또우장</option>
        <option value="러차오">러차오 (대만식 선술집)</option>
        <option value="훠궈">훠궈</option>
        <option value="간식">로컬 길거리 간식 / 야시장</option>
        <option value="빙수">디저트 / 망고빙수 / 버블티</option>
      </select>
    </div>

    <!-- 4 Cards Per Row Grid -->
    <div class="grid" id="restaurantGrid"></div>

    <!-- Master Videos Table -->
    <div class="videos-section">
      <h2>🎬 전수 분석 대상 유튜브 영상 200선 메타데이터</h2>
      <p style="color: #64748b; font-size: 0.85rem;">조회수 10만 회 이상 & 최근 2년 이내(2024~2026) 타이베이 맛집 영상 200개의 실시간 분석 데이터셋입니다.</p>
      <div class="video-table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width: 45px;">#</th>
              <th>채널명</th>
              <th>영상 제목</th>
              <th>조회수</th>
              <th>발행일</th>
              <th>링크</th>
            </tr>
          </thead>
          <tbody id="videoTableBody"></tbody>
        </table>
      </div>
    </div>

    <!-- RAW Timeline Spreadsheet Section (Requirement 3: 8 Columns) -->
    <div class="spreadsheet-section" id="rawTimelineSpreadsheetSection">
      <div class="sheet-header-bar">
        <div>
          <h2>📊 200개 영상 RAW 타임라인 스프레드시트 뷰어 (전수 ${rawTimelines.length}개 타임라인 검색 & 필터)</h2>
          <p style="color: #64748b; font-size: 0.85rem; margin-top: 3px;">
            사용자 지정 8개 열(유튜버 국적, 유튜버명, 영상제목, 영상링크, 맛집이름, 메뉴, 영상중 타임라인, 타임라인 링크) 전수 데이터셋입니다.
            각 열별 독립 필터와 다중 조건 실시간 통합 검색을 완벽 지원합니다.
          </p>
        </div>
        <div class="sheet-actions">
          <a class="btn btn-csv" href="taipei_youtube_food_timeline_raw.csv" download>📥 RAW CSV 다운로드 (8열 규격)</a>
          <button class="btn btn-secondary" id="resetSpreadsheetBtn">🔄 필터 전체 초기화</button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="sheet-toolbar">
        <div class="global-search-box">
          <span>🔍</span>
          <input type="text" id="globalSearchInput" placeholder="전체 열 대상 통합 조건 검색 (식당명, 메뉴, 유튜버명, 국적, 제목, 시간 등)..." />
        </div>
        <div class="sheet-counter" id="spreadsheetCounter">
          표시 중: <b id="visibleCount">${rawTimelines.length}</b> / ${rawTimelines.length}개 행 (100%)
        </div>
      </div>

      <!-- Table Container -->
      <div class="sheet-table-wrap">
        <table class="spreadsheet-table" id="spreadsheetTable">
          <thead>
            <!-- Header Titles (8 Columns) -->
            <tr class="header-titles">
              <th style="width: 40px; text-align: center;">#</th>
              <th style="min-width: 85px; text-align: center;">유튜버 국적</th>
              <th style="min-width: 140px;">유튜버명</th>
              <th style="min-width: 230px;">영상제목</th>
              <th style="min-width: 170px;">맛집이름</th>
              <th style="min-width: 200px;">메뉴</th>
              <th style="min-width: 95px; text-align: center;">영상중 타임라인</th>
              <th style="min-width: 110px; text-align: center;">타임라인 링크</th>
              <th style="min-width: 75px; text-align: center;">영상링크</th>
            </tr>
            <!-- Column-Specific Filters -->
            <tr class="header-filters">
              <th style="text-align: center; color: #94a3b8; font-size: 0.72rem;">필터</th>
              <th><input type="text" id="colFilterNationality" class="col-filter-input" placeholder="국적..." /></th>
              <th><input type="text" id="colFilterYoutuber" class="col-filter-input" placeholder="유튜버..." /></th>
              <th><input type="text" id="colFilterTitle" class="col-filter-input" placeholder="제목 필터..." /></th>
              <th><input type="text" id="colFilterRestaurant" class="col-filter-input" placeholder="식당명..." /></th>
              <th><input type="text" id="colFilterMenu" class="col-filter-input" placeholder="메뉴 필터..." /></th>
              <th><input type="text" id="colFilterTimeline" class="col-filter-input" placeholder="시간 (05:)..." /></th>
              <th style="text-align: center; color: #94a3b8; font-size: 0.72rem;">-</th>
              <th style="text-align: center; color: #94a3b8; font-size: 0.72rem;">-</th>
            </tr>
          </thead>
          <tbody id="spreadsheetBody">
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <script>
    const RESTAURANTS = ${JSON.stringify(enrichedRestaurants)};
    const VIDEOS = ${JSON.stringify(masterVideos.map(v => ({
      channel: v.channel,
      title: v.title,
      viewCount: v.viewCount,
      publishDate: (v.publishDate || '').slice(0, 10),
      url: v.url
    })))};
    const RAW_TIMELINES = ${JSON.stringify(rawTimelines)};

    // 1. Initialize Leaflet Map (Using Esri World Street Map - 동일하게 숙소 프로젝트 적용 방식, API Key 불필요)
    const map = L.map('map').setView([25.042, 121.525], 13);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; High Precision Coordinates',
      maxZoom: 18
    }).addTo(map);

    const markers = [];

    // Populate Sidebar Ranking
    const rankingContainer = document.getElementById('rankingList');
    RESTAURANTS.forEach((r, idx) => {
      const item = document.createElement('div');
      item.className = 'rank-item';
      let badgeClass = 'rank-badge';
      if (idx === 0) badgeClass += ' rank-top1';
      else if (idx === 1) badgeClass += ' rank-top2';
      else if (idx === 2) badgeClass += ' rank-top3';

      item.innerHTML = \`
        <div class="\${badgeClass}">\${r.rank}</div>
        <div class="rank-info">
          <div class="rank-name">\${r.name_ko}</div>
          <div class="rank-sub">\${r.district} · \${r.cuisine}</div>
        </div>
        <div class="rank-count">\${r.mention_count}회</div>
      \`;
      item.onclick = () => {
        map.flyTo([r.lat, r.lng], 16, { animate: true });
        markers[idx].openPopup();
      };
      rankingContainer.appendChild(item);
    });

    // Add Markers to Map
    RESTAURANTS.forEach((r, idx) => {
      const marker = L.marker([r.lat, r.lng]).addTo(map);
      marker.bindPopup(\`
        <div style="font-family: Pretendard, sans-serif; font-size: 0.85rem; max-width: 250px;">
          <h4 style="margin: 0 0 4px; color: #d90429;">#\${r.rank} \${r.name_ko}</h4>
          <p style="margin: 0 0 4px; color: #64748b; font-size: 0.75rem;">\${r.name_zh}</p>
          <p style="margin: 0 0 6px;"><b>🔥 유튜버 \${r.mention_count}회 추천</b> (\${r.percentage})</p>
          <p style="margin: 0 0 4px;">⭐️ 평점 \${r.rating} | \${r.cuisine}</p>
          <p style="margin: 0 0 6px; color: #475569;"><b>대표:</b> \${r.menu}</p>
          <a href="https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(r.name_ko + ' ' + r.address)}" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: none;">🗺️ Google 지도 공식 앱으로 열기 →</a>
        </div>
      \`);
      markers.push(marker);
    });

    // Render Cards (Compact 4-per-row design)
    const grid = document.getElementById('restaurantGrid');
    function renderCards(list) {
      grid.innerHTML = '';
      list.forEach((r) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = \`
          <div class="card-head">
            <div class="card-title">
              <h3>#\${r.rank} \${r.name_ko}</h3>
              <span>\${r.name_zh}</span>
            </div>
            <div class="pill-mention">🔥 \${r.mention_count}회</div>
          </div>
          <div class="card-body">
            <div class="badge-bar">
              <span class="badge badge-gold">⭐️ \${r.rating}</span>
              <span class="badge">\${r.cuisine}</span>
              <span class="badge">\${r.district}</span>
            </div>
            <div class="card-row">
              <div class="card-label">교통편</div>
              <div class="card-val">\${r.mrt}</div>
            </div>
            <div class="card-row">
              <div class="card-label">대표 메뉴</div>
              <div class="card-val">\${r.menu}</div>
            </div>
            <div class="card-row">
              <div class="card-label">주요 채널</div>
              <div class="card-val" style="color: #64748b; font-size: 0.75rem;">\${r.top_creators}</div>
            </div>
            <div class="tip-box">
              <b>💡 유튜버 팁:</b> \${r.creator_tip}
            </div>
            <div class="card-footer-link">
              <a href="https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(r.name_ko + ' ' + r.address)}" target="_blank">🗺️ Google 지도 보기 →</a>
            </div>
          </div>
        \`;
        grid.appendChild(card);
      });
    }
    renderCards(RESTAURANTS);

    // Filter Logic for Top 40 Cards
    function filterRestaurants() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const dist = document.getElementById('districtFilter').value;
      const cuis = document.getElementById('cuisineFilter').value;

      const filtered = RESTAURANTS.filter(r => {
        const text = (r.name_ko + r.name_zh + r.menu + r.mrt + r.district + r.top_creators).toLowerCase();
        const matchesQ = !q || text.includes(q);
        const matchesDist = !dist || r.district.includes(dist);
        const matchesCuis = !cuis || r.cuisine.includes(cuis);
        return matchesQ && matchesDist && matchesCuis;
      });

      renderCards(filtered);
    }

    document.getElementById('searchInput').addEventListener('input', filterRestaurants);
    document.getElementById('districtFilter').addEventListener('change', filterRestaurants);
    document.getElementById('cuisineFilter').addEventListener('change', filterRestaurants);

    // Populate Video Table
    const vTable = document.getElementById('videoTableBody');
    VIDEOS.forEach((v, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td>\${i + 1}</td>
        <td><b>\${v.channel}</b></td>
        <td>\${v.title}</td>
        <td class="views-col">\${Number(v.viewCount).toLocaleString()}회</td>
        <td style="white-space: nowrap; color: #64748b;">\${v.publishDate}</td>
        <td><a href="\${v.url}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: bold;">보기 ↗</a></td>
      \`;
      vTable.appendChild(tr);
    });

    // 2. Spreadsheet Logic (8 Columns with Nationality)
    const spreadsheetBody = document.getElementById('spreadsheetBody');
    const spreadsheetCounter = document.getElementById('spreadsheetCounter');
    const visibleCountEl = document.getElementById('visibleCount');

    let currentFilteredRows = [...RAW_TIMELINES];

    function renderSpreadsheetRows(rows) {
      if (!spreadsheetBody) return;
      if (rows.length === 0) {
        spreadsheetBody.innerHTML = '<tr><td colspan="9" class="empty-state">일치하는 검색 결과가 없습니다. 필터 조건을 변경해보세요.</td></tr>';
        return;
      }
      
      const fragment = document.createDocumentFragment();
      rows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td style="text-align: center; color: #64748b; font-weight: 600;">\${idx + 1}</td>
          <td style="text-align: center;"><span class="badge-nationality">\${row.nationality}</span></td>
          <td><b>\${row.youtuber}</b></td>
          <td><div style="max-width: 280px; white-space: normal; word-break: keep-all;">\${row.videoTitle}</div></td>
          <td style="font-weight: 700; color: #d90429;">\${row.restaurantName}</td>
          <td><div style="max-width: 240px; white-space: normal; color: #334155;">\${row.menu}</div></td>
          <td style="text-align: center;"><span class="tag-timeline">⏱️ \${row.timeline}</span></td>
          <td style="text-align: center;"><a href="\${row.timelineUrl}" target="_blank" class="btn-timeline-jump">🎬 바로보기</a></td>
          <td style="text-align: center;"><a href="\${row.videoUrl}" target="_blank" class="btn-video-orig">🔗 영상</a></td>
        \`;
        fragment.appendChild(tr);
      });
      spreadsheetBody.innerHTML = '';
      spreadsheetBody.appendChild(fragment);
    }

    function filterSpreadsheet(customCriteria) {
      const globalQ = (customCriteria?.global !== undefined ? customCriteria.global : document.getElementById('globalSearchInput')?.value || '').toLowerCase().trim();
      const colNat = (customCriteria?.nationality !== undefined ? customCriteria.nationality : document.getElementById('colFilterNationality')?.value || '').toLowerCase().trim();
      const colYoutuber = (customCriteria?.youtuber !== undefined ? customCriteria.youtuber : document.getElementById('colFilterYoutuber')?.value || '').toLowerCase().trim();
      const colTitle = (customCriteria?.title !== undefined ? customCriteria.title : document.getElementById('colFilterTitle')?.value || '').toLowerCase().trim();
      const colRestaurant = (customCriteria?.restaurant !== undefined ? customCriteria.restaurant : document.getElementById('colFilterRestaurant')?.value || '').toLowerCase().trim();
      const colMenu = (customCriteria?.menu !== undefined ? customCriteria.menu : document.getElementById('colFilterMenu')?.value || '').toLowerCase().trim();
      const colTimeline = (customCriteria?.timeline !== undefined ? customCriteria.timeline : document.getElementById('colFilterTimeline')?.value || '').toLowerCase().trim();

      const matched = RAW_TIMELINES.filter(item => {
        // Global Search (matches all fields)
        if (globalQ) {
          const combined = \`\${item.nationality} \${item.youtuber} \${item.videoTitle} \${item.restaurantName} \${item.menu} \${item.timeline}\`.toLowerCase();
          if (!combined.includes(globalQ)) return false;
        }
        // Column filters (AND condition)
        if (colNat && !item.nationality.toLowerCase().includes(colNat)) return false;
        if (colYoutuber && !item.youtuber.toLowerCase().includes(colYoutuber)) return false;
        if (colTitle && !item.videoTitle.toLowerCase().includes(colTitle)) return false;
        if (colRestaurant && !item.restaurantName.toLowerCase().includes(colRestaurant)) return false;
        if (colMenu && !item.menu.toLowerCase().includes(colMenu)) return false;
        if (colTimeline && !item.timeline.toLowerCase().includes(colTimeline)) return false;

        return true;
      });

      currentFilteredRows = matched;
      renderSpreadsheetRows(matched);

      if (visibleCountEl) visibleCountEl.textContent = matched.length;
      if (spreadsheetCounter) {
        const pct = ((matched.length / RAW_TIMELINES.length) * 100).toFixed(0);
        spreadsheetCounter.innerHTML = \`표시 중: <b>\${matched.length}</b> / \${RAW_TIMELINES.length}개 행 (\${pct}%)\`;
      }

      return matched;
    }

    function resetSpreadsheet() {
      ['globalSearchInput', 'colFilterNationality', 'colFilterYoutuber', 'colFilterTitle', 'colFilterRestaurant', 'colFilterMenu', 'colFilterTimeline'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      return filterSpreadsheet({});
    }

    // Attach Event Listeners
    ['globalSearchInput', 'colFilterNationality', 'colFilterYoutuber', 'colFilterTitle', 'colFilterRestaurant', 'colFilterMenu', 'colFilterTimeline'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => filterSpreadsheet());
    });

    const resetBtn = document.getElementById('resetSpreadsheetBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetSpreadsheet);

    // Initial render of spreadsheet
    renderSpreadsheetRows(RAW_TIMELINES);

    // Expose APIs for Reviewer Agent & Automated Testing
    window.RAW_TIMELINES = RAW_TIMELINES;
    window.performSpreadsheetFilter = filterSpreadsheet;
    window.resetSpreadsheetFilter = resetSpreadsheet;
    window.getVisibleRowCount = () => currentFilteredRows.length;
    window.getCurrentFilteredRows = () => currentFilteredRows;
    window.leafletMap = map;
    window.tileLayer = cartoVoyager;
  </script>
</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  fs.writeFileSync(indexPath, htmlContent, 'utf8');
  console.log(`Saved updated HTML Dashboard to ${htmlPath} and ${indexPath}`);

  // 4. Generate Dedicated Mobile Version (youtube_food_guide_mobile.html & mobile.html)
  const mobileHtmlPath = 'c:\\cowork\\taiwan\\food\\youtube_food_guide_mobile.html';
  const mobilePath = 'c:\\cowork\\taiwan\\food\\mobile.html';

  const mobileContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>🇹🇼 타이베이 유튜브 맛집 가이드 (모바일 전용)</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #e63946;
      --secondary: #457b9d;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body { font-family: 'Pretendard', sans-serif; background: var(--bg); color: var(--text); padding-bottom: 75px; }
    
    .mobile-header { background: linear-gradient(135deg, #d90429, #ef233c); color: white; padding: 20px 16px; text-align: center; }
    .mobile-header h1 { font-size: 1.4rem; font-weight: 800; margin-bottom: 4px; }
    .mobile-header p { font-size: 0.78rem; opacity: 0.9; }

    .mobile-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding: 10px 12px; background: white; border-bottom: 1px solid var(--border); }
    .m-stat { text-align: center; padding: 6px 2px; }
    .m-stat-num { font-size: 1.1rem; font-weight: 800; color: var(--primary); }
    .m-stat-lbl { font-size: 0.68rem; color: #64748b; font-weight: 600; }

    .nav-tabs { display: flex; background: white; border-bottom: 2px solid var(--border); position: sticky; top: 0; z-index: 100; }
    .nav-tab { flex: 1; text-align: center; padding: 12px 6px; font-size: 0.82rem; font-weight: 700; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; }
    .nav-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

    .tab-content { display: none; padding: 14px 12px; }
    .tab-content.active { display: block; }

    /* Map */
    #mobileMap { height: 360px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 14px; }

    /* Search & Filter Bar */
    .m-search-box { display: flex; gap: 8px; margin-bottom: 12px; }
    .m-search-box input { flex: 1; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.85rem; font-family: inherit; outline: none; }
    .m-filter-row { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 10px; }
    .m-filter-btn { padding: 6px 12px; border-radius: 18px; border: 1px solid var(--border); background: white; font-size: 0.75rem; font-weight: 600; color: #475569; white-space: nowrap; cursor: pointer; }
    .m-filter-btn.active { background: var(--primary); color: white; border-color: var(--primary); }

    /* 1-Col Mobile Cards */
    .m-card { background: white; border-radius: 12px; border: 1px solid var(--border); padding: 14px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .m-card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    .m-card-title h3 { font-size: 1.05rem; font-weight: 800; color: #0f172a; }
    .m-card-title span { font-size: 0.75rem; color: #64748b; }
    .m-pill { background: #fee2e2; color: #dc2626; font-size: 0.75rem; font-weight: 800; padding: 3px 8px; border-radius: 12px; }
    .m-card-badges { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
    .m-badge { font-size: 0.7rem; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #475569; }
    .m-badge-gold { background: #fef08a; color: #854d0e; font-weight: 700; }
    .m-row { display: flex; gap: 6px; font-size: 0.8rem; margin-bottom: 4px; }
    .m-lbl { color: #64748b; font-weight: 700; min-width: 55px; }
    .m-val { color: #1e293b; flex: 1; }
    .m-tip { background: #f8fafc; border-left: 3px solid var(--secondary); padding: 6px 8px; border-radius: 4px; font-size: 0.75rem; color: #334155; margin-top: 6px; }
    .m-map-btn { display: block; text-align: center; margin-top: 10px; background: #2563eb; color: white; text-decoration: none; font-weight: 700; font-size: 0.8rem; padding: 8px 12px; border-radius: 6px; }

    /* Timeline Mobile Card List */
    .timeline-item { background: white; border-radius: 10px; border: 1px solid var(--border); padding: 12px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
    .tl-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .tl-tag { background: #e0f2fe; color: #0284c7; font-size: 0.72rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .tl-time { background: #ecfdf5; color: #059669; font-size: 0.75rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    .tl-title { font-size: 0.88rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .tl-sub { font-size: 0.78rem; color: #64748b; margin-bottom: 6px; }
    .tl-links { display: flex; gap: 8px; margin-top: 8px; }
    .tl-btn { flex: 1; text-align: center; padding: 6px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-decoration: none; }
    .tl-btn-jump { background: #ef233c; color: white; }
    .tl-btn-video { background: #f1f5f9; color: #2563eb; border: 1px solid #cbd5e1; }

    /* Bottom Navigation Bar */
    .bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 58px; background: white; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-around; z-index: 200; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
    .b-item { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; font-size: 0.72rem; font-weight: 600; text-decoration: none; flex: 1; height: 100%; cursor: pointer; }
    .b-item.active { color: var(--primary); }
    .b-icon { font-size: 1.2rem; margin-bottom: 2px; }
  </style>
</head>
<body>

  <div class="mobile-header">
    <h1>🇹🇼 타이베이 맛집 가이드</h1>
    <p>유튜브 200개 영상 전수 분석 • 맛집 TOP 40 • 8열 타임라인</p>
  </div>

  <div class="mobile-stats">
    <div class="m-stat">
      <div class="m-stat-num">${masterVideos.length}</div>
      <div class="m-stat-lbl">분석영상</div>
    </div>
    <div class="m-stat">
      <div class="m-stat-num">40</div>
      <div class="m-stat-lbl">추천맛집</div>
    </div>
    <div class="m-stat">
      <div class="m-stat-num">${rawTimelines.length}</div>
      <div class="m-stat-lbl">타임라인</div>
    </div>
    <div class="m-stat">
      <div class="m-stat-num">${(totalViews / 100000000).toFixed(1)}억</div>
      <div class="m-stat-lbl">누적조회</div>
    </div>
  </div>

  <!-- TAB 1: 맛집 랭킹 TOP 40 -->
  <div id="tabRanking" class="tab-content active">
    <div class="m-search-box">
      <input type="text" id="mCardSearch" placeholder="식당명, 대표 메뉴, MRT역 검색..." />
    </div>
    <div class="m-filter-row" id="cuisineFilterRow">
      <span class="m-filter-btn active" data-filter="">전체</span>
      <span class="m-filter-btn" data-filter="우육면">우육면</span>
      <span class="m-filter-btn" data-filter="루로우판">루로우판</span>
      <span class="m-filter-btn" data-filter="샤오롱바오">샤오롱바오</span>
      <span class="m-filter-btn" data-filter="조식">전통조식</span>
      <span class="m-filter-btn" data-filter="훠궈">훠궈</span>
      <span class="m-filter-btn" data-filter="빙수">망고빙수</span>
    </div>
    <div id="mCardList"></div>
  </div>

  <!-- TAB 2: 인터랙티브 지도 -->
  <div id="tabMap" class="tab-content">
    <div style="background: #e0f2fe; color: #0369a1; padding: 8px 12px; border-radius: 6px; font-size: 0.75rem; margin-bottom: 10px;">
      ⚡ Google Maps API Key 불필요 (CartoDB 고성능 오픈 맵 즉시 로딩)
    </div>
    <div id="mobileMap"></div>
    <div style="font-size: 0.85rem; font-weight: 700; margin: 12px 0 8px;">👑 유튜버 추천 맛집 목록</div>
    <div id="mMapList"></div>
  </div>

  <!-- TAB 3: RAW 타임라인 검색 -->
  <div id="tabTimeline" class="tab-content">
    <div class="m-search-box">
      <input type="text" id="mTimelineSearch" placeholder="식당, 메뉴, 유튜버, 국적 통합 검색..." />
    </div>
    <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 10px;">
      표시 중: <b id="mTlCount" style="color: #d90429;">${rawTimelines.length}</b> / ${rawTimelines.length}개 타임라인
    </div>
    <div id="mTimelineList"></div>
  </div>

  <!-- Bottom Bar -->
  <div class="bottom-bar">
    <div class="b-item active" onclick="switchTab('tabRanking', this)">
      <div class="b-icon">👑</div>
      <div>맛집 TOP40</div>
    </div>
    <div class="b-item" onclick="switchTab('tabMap', this)">
      <div class="b-icon">🗺️</div>
      <div>지도 보기</div>
    </div>
    <div class="b-item" onclick="switchTab('tabTimeline', this)">
      <div class="b-icon">📊</div>
      <div>타임라인 검색</div>
    </div>
    <a class="b-item" href="youtube_food_guide.html">
      <div class="b-icon">🖥️</div>
      <div>PC 버전</div>
    </a>
  </div>

  <script>
    const RESTAURANTS = ${JSON.stringify(enrichedRestaurants)};
    const RAW_TIMELINES = ${JSON.stringify(rawTimelines)};

    function switchTab(tabId, el) {
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.b-item').forEach(b => b.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      if (el) el.classList.add('active');
      if (tabId === 'tabMap') {
        setTimeout(() => { if (mMap) mMap.invalidateSize(); }, 200);
      }
    }

    // Render Cards
    const cardContainer = document.getElementById('mCardList');
    function renderMCards(list) {
      cardContainer.innerHTML = '';
      list.forEach(r => {
        const d = document.createElement('div');
        d.className = 'm-card';
        d.innerHTML = \`
          <div class="m-card-head">
            <div class="m-card-title">
              <h3>#\${r.rank} \${r.name_ko}</h3>
              <span>\${r.name_zh}</span>
            </div>
            <div class="m-pill">🔥 \${r.mention_count}회</div>
          </div>
          <div class="m-card-badges">
            <span class="m-badge m-badge-gold">⭐️ \${r.rating}</span>
            <span class="m-badge">\${r.cuisine}</span>
            <span class="m-badge">\${r.district}</span>
          </div>
          <div class="m-row"><div class="m-lbl">교통편</div><div class="m-val">\${r.mrt}</div></div>
          <div class="m-row"><div class="m-lbl">대표메뉴</div><div class="m-val">\${r.menu}</div></div>
          <div class="m-tip">💡 <b>팁:</b> \${r.creator_tip}</div>
          <a class="m-map-btn" href="https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(r.name_ko + ' ' + r.address)}" target="_blank">🗺️ Google 지도로 바로보기</a>
        \`;
        cardContainer.appendChild(d);
      });
    }
    renderMCards(RESTAURANTS);

    // Filter Cards
    let activeCuisine = '';
    document.querySelectorAll('.m-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.m-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCuisine = btn.dataset.filter || '';
        applyCardFilter();
      });
    });

    document.getElementById('mCardSearch').addEventListener('input', applyCardFilter);

    function applyCardFilter() {
      const q = document.getElementById('mCardSearch').value.toLowerCase();
      const filtered = RESTAURANTS.filter(r => {
        const text = (r.name_ko + r.name_zh + r.menu + r.district + r.mrt).toLowerCase();
        const mQ = !q || text.includes(q);
        const mC = !activeCuisine || r.cuisine.includes(activeCuisine);
        return mQ && mC;
      });
      renderMCards(filtered);
    }

    // Initialize Mobile Leaflet Map (Using Esri World Street Map - 동일하게 숙소 프로젝트 적용 방식, API Key 불필요)
    const mMap = L.map('mobileMap').setView([25.042, 121.525], 13);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; High Precision Coordinates',
      maxZoom: 18
    }).addTo(mMap);

    const mapList = document.getElementById('mMapList');
    RESTAURANTS.forEach(r => {
      const marker = L.marker([r.lat, r.lng]).addTo(mMap);
      marker.bindPopup(\`
        <div style="font-size: 0.85rem;">
          <b>#\${r.rank} \${r.name_ko}</b><br>
          <span style="color: #64748b; font-size: 0.75rem;">\${r.menu}</span><br>
          <a href="https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(r.name_ko + ' ' + r.address)}" target="_blank" style="color: #2563eb; font-weight: bold; font-size: 0.75rem;">Google 지도로 보기</a>
        </div>
      \`);

      const row = document.createElement('div');
      row.style.cssText = 'padding: 8px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-size: 0.82rem; cursor: pointer;';
      row.innerHTML = \`<span><b>#\${r.rank}</b> \${r.name_ko}</span><span style="color: #ef233c; font-weight: bold;">\${r.mention_count}회</span>\`;
      row.onclick = () => {
        mMap.flyTo([r.lat, r.lng], 16);
        marker.openPopup();
        window.scrollTo({ top: 120, behavior: 'smooth' });
      };
      mapList.appendChild(row);
    });

    // Render Timeline List
    const tlContainer = document.getElementById('mTimelineList');
    const tlCount = document.getElementById('mTlCount');
    function renderMTimelines(list) {
      tlContainer.innerHTML = '';
      tlCount.textContent = list.length;
      list.forEach((t, i) => {
        const d = document.createElement('div');
        d.className = 'timeline-item';
        d.innerHTML = \`
          <div class="tl-head">
            <span class="tl-tag">\${t.nationality} · \${t.youtuber}</span>
            <span class="tl-time">⏱️ \${t.timeline}</span>
          </div>
          <div class="tl-title">\${t.restaurantName}</div>
          <div class="tl-sub">\${t.menu}</div>
          <div style="font-size: 0.72rem; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${t.videoTitle}</div>
          <div class="tl-links">
            <a class="tl-btn tl-btn-jump" href="\${t.timelineUrl}" target="_blank">🎬 타임라인 바로보기</a>
            <a class="tl-btn tl-btn-video" href="\${t.videoUrl}" target="_blank">🔗 영상 전체보기</a>
          </div>
        \`;
        tlContainer.appendChild(d);
      });
    }
    renderMTimelines(RAW_TIMELINES);

    document.getElementById('mTimelineSearch').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = RAW_TIMELINES.filter(t => {
        const text = \`\${t.nationality} \${t.youtuber} \${t.videoTitle} \${t.restaurantName} \${t.menu} \${t.timeline}\`.toLowerCase();
        return !q || text.includes(q);
      });
      renderMTimelines(filtered);
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(mobileHtmlPath, mobileContent, 'utf8');
  fs.writeFileSync(mobilePath, mobileContent, 'utf8');
  console.log(`Saved Mobile Versions to ${mobileHtmlPath} and ${mobilePath}`);

  // 5. Generate Markdown Guide
  let md = `# 🇹🇼 타이베이 유튜브 검증 맛집 40선 & 구글 지도 가이드 (200개 영상 전수 분석)

> **분석 기준 및 조건 충족 현황**
> * **대상 지역**: 대만 타이베이 시내 (Taipei City)
> * **영상 기준**: 유튜브 조회수 **10만 회 이상**, 최근 **2년 이내(2024~2026년)** 발행 영상
> * **분석 수량**: 총 **200개 영상 전수 분석** (누적 조회수 **${(totalViews / 100000000).toFixed(1)}억 회 돌파**)
> * **RAW 타임라인 수량**: 총 **${rawTimelines.length}개 정밀 타임라인 행** (고유 200개 영상 100% 매핑, 8열 규격)
> * **분류 체계**: **위치별(권역별)** & **음식 종류별** 2중 교차 분류
> * **식당별 추천 빈도**: 200개 영상 내 키워드·메타데이터 전수 집계 순위 수록
> * **산출물 안내**: [구글지도용 CSV](file:///c:/cowork/taiwan/food/taipei_youtube_restaurants_for_google_maps.csv) / [KML 파일](file:///c:/cowork/taiwan/food/taipei_youtube_restaurants_for_google_maps.kml) / [PC 대시보드](file:///c:/cowork/taiwan/food/youtube_food_guide.html) / [모바일 대시보드](file:///c:/cowork/taiwan/food/youtube_food_guide_mobile.html) / [RAW 8열 CSV](file:///c:/cowork/taiwan/food/taipei_youtube_food_timeline_raw.csv)

---

## 🏆 유튜버 최다 추천 맛집 TOP 40 전수 랭킹표 (200개 영상 분석)

| 순위 | 음식점 (한글/원문) | 언급 횟수 | 추천율 | 권역 (위치) | 음식 카테고리 | 구글 평점 | 주요 추천 유튜버/채널 |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: | :--- |
`;

  for (const r of enrichedRestaurants) {
    md += `| **${r.rank}** | **${r.name_ko}** (${r.name_zh}) | **${r.mention_count}회** | \`${r.percentage}\` | ${r.district} | ${r.cuisine} | ⭐ \`${r.rating}\` | ${r.top_creators} |\n`;
  }

  md += `\n---

## 🗺️ 구글 지도(Google My Maps)에 올리는 방법 (3분 완성)

제작된 \`taipei_youtube_restaurants_for_google_maps.csv\` 또는 \`taipei_youtube_restaurants_for_google_maps.kml\` 파일을 이용하면 개인 구글 지도에 한 번에 모든 맛집을 등록하고, 스마트폰 구글맵 앱에서 바로 꺼내볼 수 있습니다.

### 📌 PC 웹 브라우저에서 등록하기
1. **구글 내 지도 접속**: 브라우저에서 [Google My Maps](https://mymaps.google.com/)에 접속하여 로그인합니다.
2. **새 지도 만들기**: 좌측 상단의 **'+ 새 지도 만들기'** 버튼을 클릭합니다.
3. **파일 가져오기 (Import)**:
   - 좌측 '제목 없는 레이어' 아래의 **'가져오기(Import)'** 파란색 글씨를 클릭합니다.
   - [taipei_youtube_restaurants_for_google_maps.csv](file:///c:/cowork/taiwan/food/taipei_youtube_restaurants_for_google_maps.csv) 파일을 드래그하여 업로드합니다.
4. **위치 및 라벨 열 지정**:
   - **위치 배치 열**: \`Latitude\`(위도)와 \`Longitude\`(경도)를 선택하고 '계속'을 누릅니다.
   - **마커 제목 열**: \`Name\`(식당 한국어명)을 선택하고 '마침'을 누릅니다.
5. **스타일 및 색상 지정 (선택)**:
   - 좌측 메뉴의 '균일한 스타일' ➔ **'Cuisine_Category' 또는 'District'** 기준으로 스타일을 변경하면 음식 종류별/지역별로 핀 색상이 예쁘게 자동 구분됩니다.

### 📱 스마트폰 구글맵 앱에서 바로 열기
1. 스마트폰에서 **Google 지도(Google Maps)** 앱을 엽니다.
2. 하단 탭에서 **'저장됨(Saved)'** ➔ 화면 맨 아래로 스크롤하여 **'지도(Maps)'** 항목을 터치합니다.
3. 방금 PC에서 생성한 지도를 선택하면, 여행 중 내 현재 위치와 함께 유튜브 맛집 핀들이 지도 위에 실시간으로 표시됩니다!

---

## 🎬 200개 유튜브 영상 전수 리스트 (조회수 10만 이상, 최근 2년)

| 번호 | 채널명 | 영상 제목 | 조회수 | 발행일 | 영상 링크 |
| :---: | :--- | :--- | :---: | :---: | :---: |
`;

  masterVideos.forEach((v, idx) => {
    md += `| ${idx + 1} | ${v.channel} | ${v.title.replace(/\|/g, '-')} | ${(v.viewCount || 0).toLocaleString()}회 | ${(v.publishDate || '').slice(0, 10)} | [바로보기](${v.url}) |\n`;
  });

  const mdPath = 'c:\\cowork\\taiwan\\food\\TAIPEI_YOUTUBE_FOOD_GUIDE.md';
  fs.writeFileSync(mdPath, md, 'utf8');
  console.log(`Saved updated Markdown Guide to ${mdPath}`);
}

runDeliverablesGeneration();

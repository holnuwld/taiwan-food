import fs from 'fs';
import path from 'path';

const MASTER_VIDEOS_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_200_videos_master.json';
const RAW_TIMELINES_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_youtube_food_timeline_raw.json';
const TOP40_ENRICHED_FILE = 'c:\\cowork\\taiwan\\food\\data\\top40_restaurants_enriched.json';

export function runDeliverablesGenerationV4() {
  const masterVideos = JSON.parse(fs.readFileSync(MASTER_VIDEOS_FILE, 'utf8'));
  const rawTimelines = JSON.parse(fs.readFileSync(RAW_TIMELINES_FILE, 'utf8'));
  const enrichedRestaurants = JSON.parse(fs.readFileSync(TOP40_ENRICHED_FILE, 'utf8'));

  const totalViews = masterVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0);

  console.log(`Loaded ${masterVideos.length} master videos (Total Views: ${totalViews.toLocaleString()})`);
  console.log(`Loaded ${rawTimelines.length} raw timeline entries (V4 with transcript time mappings).`);
  console.log(`Loaded ${enrichedRestaurants.length} enriched restaurants (with photos, 2P tips, one-line desc, creator sources).`);

  // Unique lists for Dropdowns
  const nationalities = [...new Set(rawTimelines.map(t => t.nationality).filter(Boolean))].sort();
  const youtubers = [...new Set(rawTimelines.map(t => t.youtuber).filter(Boolean))].sort();
  const restaurantNames = [...new Set(enrichedRestaurants.map(r => r.name_ko))].sort();

  // 1. Generate CSV for Google My Maps (UTF-8 with BOM)
  const csvHeaders = [
    'Rank', 'Name', 'Original_Name', 'District', 'MRT_Access', 'Cuisine_Category',
    'Google_Rating', 'Address', 'Latitude', 'Longitude', 'Featured_Menus',
    'One_Line_Desc', 'Order_Tip_2P', 'Order_Tip_Source_URL', 'YouTuber_Tip',
    'YouTuber_Creator', 'YouTuber_Video_URL', 'Image_URL', 'Image_Source_URL', 'Google_Maps_URL'
  ];

  function escapeCsv(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  const csvRows = [csvHeaders.join(',')];
  for (const r of enrichedRestaurants) {
    const gmapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name_ko + ' ' + r.address)}`;
    const row = [
      escapeCsv(r.rank),
      escapeCsv(r.name_ko),
      escapeCsv(r.name_zh),
      escapeCsv(r.district),
      escapeCsv(r.mrt),
      escapeCsv(r.cuisine),
      escapeCsv(r.rating),
      escapeCsv(r.address),
      escapeCsv(r.lat),
      escapeCsv(r.lng),
      escapeCsv(r.menu),
      escapeCsv(r.one_line_desc),
      escapeCsv(r.order_tip_2p),
      escapeCsv(r.order_tip_source_url),
      escapeCsv(r.youtuber_tip),
      escapeCsv(r.youtuber_tip_creator),
      escapeCsv(r.youtuber_tip_video_url),
      escapeCsv(r.image_url),
      escapeCsv(r.image_source_url),
      escapeCsv(gmapUrl)
    ];
    csvRows.push(row.join(','));
  }

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const googleMapsCsvPath = 'c:\\cowork\\taiwan\\food\\taipei_youtube_restaurants_for_google_maps.csv';
  fs.writeFileSync(googleMapsCsvPath, csvContent, 'utf8');
  console.log(`Saved Google Maps CSV to ${googleMapsCsvPath}`);

  // 2. Generate KML with Rich Descriptions
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>🇹🇼 타이베이 유튜브 검증 맛집 TOP 40 (사진·2인팁·원문출처 수록)</name>
    <description>200개 유튜브 영상 전수 분석 및 자막 실측 검증 맛집 40선</description>
`;

  for (const r of enrichedRestaurants) {
    const gmapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name_ko + ' ' + r.address)}`;
    kml += `    <Placemark>
      <name>#${r.rank} ${r.name_ko} (${r.name_zh})</name>
      <description><![CDATA[
        <div style="font-family: Arial, sans-serif;">
          <img src="${r.image_url}" style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 8px;" />
          <p><b>[한줄설명]</b> ${r.one_line_desc}</p>
          <p><b>[평점/분류]</b> ⭐ ${r.rating} | ${r.cuisine} | ${r.district}</p>
          <p><b>[대표메뉴]</b> ${r.menu}</p>
          <p><b>[2인 주문추천]</b> ${r.order_tip_2p}</p>
          <p><b>[유튜버 팁]</b> <i>${r.youtuber_tip}</i> (${r.youtuber_tip_creator})</p>
          <p><a href="${gmapUrl}" target="_blank">🗺️ Google 지도 앱으로 열기</a></p>
        </div>
      ]]></description>
      <Point>
        <coordinates>${r.lng},${r.lat},0</coordinates>
      </Point>
    </Placemark>
`;
  }
  kml += `  </Document>
</kml>`;

  const kmlPath = 'c:\\cowork\\taiwan\\food\\taipei_youtube_restaurants_for_google_maps.kml';
  fs.writeFileSync(kmlPath, kml, 'utf8');
  console.log(`Saved KML to ${kmlPath}`);

  // 3. Generate Desktop HTML Dashboard (4 Cards Per Row + Photos + Dual Filters: Dropdown + Text)
  const htmlPath = 'c:\\cowork\\taiwan\\food\\youtube_food_guide.html';
  const indexPath = 'c:\\cowork\\taiwan\\food\\index.html';

  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🇹🇼 타이베이 유튜브 200개 영상 맛집 전수 분석 & 스마트 가이드 (V4)</title>
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
    .btn:hover { transform: translateY(-2px); opacity: 0.95; }

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
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
    .card { background: white; border-radius: 10px; border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
    .card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
    
    .card-img-wrap { position: relative; width: 100%; height: 140px; background: #f1f5f9; overflow: hidden; }
    .card-img { width: 100%; height: 100%; object-fit: cover; }
    .card-img-source { position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.65); color: #fff; font-size: 0.68rem; padding: 2px 6px; border-radius: 4px; text-decoration: none; font-weight: 600; }
    .card-img-source:hover { background: rgba(0,0,0,0.85); text-decoration: underline; }

    .card-head { padding: 10px 14px 6px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; }
    .card-title h3 { font-size: 0.98rem; font-weight: 700; margin-bottom: 2px; line-height: 1.3; }
    .card-title span { font-size: 0.72rem; color: #64748b; }
    .pill-mention { background: #fee2e2; color: var(--primary); font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 10px; white-space: nowrap; margin-left: 4px; }
    
    .card-body { padding: 10px 14px; flex: 1; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; }
    .desc-box { background: #f8fafc; border-left: 3px solid #3b82f6; padding: 6px 8px; font-size: 0.75rem; color: #334155; line-height: 1.4; border-radius: 0 4px 4px 0; }
    
    .badge-bar { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 2px; }
    .badge { font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #475569; font-weight: 600; }
    .badge-gold { background: #fef3c7; color: #92400e; font-weight: 700; }
    
    .card-row { display: flex; font-size: 0.76rem; }
    .card-label { width: 55px; color: #94a3b8; font-weight: 600; flex-shrink: 0; }
    .card-val { color: #334155; flex: 1; }

    .tip-box-2p { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 6px 8px; font-size: 0.73rem; color: #065f46; margin-top: 2px; }
    .tip-box-2p b { color: #047857; }
    .tip-box-yt { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 6px 8px; font-size: 0.73rem; color: #92400e; margin-top: 2px; }
    .tip-box-yt b { color: #b45309; }
    .source-link { color: #2563eb; font-weight: 700; text-decoration: underline; margin-left: 4px; font-size: 0.7rem; }

    .card-footer-link { margin-top: auto; padding-top: 6px; border-top: 1px solid #f1f5f9; text-align: center; display: flex; flex-direction: column; gap: 4px; }
    .card-footer-link a { color: #2563eb; font-weight: 700; font-size: 0.76rem; text-decoration: none; }
    .btn-focus-map { padding: 5px 8px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 4px; font-weight: 700; font-size: 0.74rem; cursor: pointer; transition: all 0.15s; font-family: inherit; }
    .btn-focus-map:hover { background: #dbeafe; color: #1e40af; }
    .custom-map-pin, .custom-m-pin { display: flex !important; align-items: center; justify-content: center; background: transparent !important; border: none !important; }

    /* Spreadsheet Viewer Section */
    .spreadsheet-section { background: white; border-radius: 12px; box-shadow: var(--shadow); border: 1px solid var(--border); padding: 24px; margin-top: 30px; }
    .spreadsheet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .spreadsheet-header h2 { font-size: 1.35rem; font-weight: 800; color: var(--text); }
    
    .spreadsheet-controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .search-box-global { padding: 8px 14px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.85rem; width: 260px; outline: none; }
    .btn-reset { padding: 8px 14px; background: #f1f5f9; color: #475569; border: 1px solid var(--border); border-radius: 6px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
    .btn-reset:hover { background: #e2e8f0; }

    .table-wrapper { max-height: 600px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; }
    table.spreadsheet-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left; }
    table.spreadsheet-table th { background: #f8fafc; color: #334155; font-weight: 700; padding: 10px 12px; border-bottom: 2px solid var(--border); position: sticky; top: 0; z-index: 2; }
    table.spreadsheet-table td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
    table.spreadsheet-table tr:hover td { background: #f8fafc; }
    
    .header-filters th { top: 41px !important; background: #ffffff !important; padding: 6px 8px !important; z-index: 2 !important; border-bottom: 1px solid var(--border) !important; }
    .col-filter-box { display: flex; flex-direction: column; gap: 3px; }
    .col-filter-select { width: 100%; padding: 4px 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.72rem; outline: none; background: #f8fafc; }
    .col-filter-input { width: 100%; padding: 4px 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.72rem; outline: none; }

    .tag-timeline-official { background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; white-space: nowrap; }
    .tag-timeline-transcript { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; white-space: nowrap; }
    .tag-timeline-none { background: #f1f5f9; color: #64748b; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; white-space: nowrap; }
    .btn-timeline-jump { display: inline-flex; align-items: center; padding: 3px 8px; background: #e63946; color: white; border-radius: 4px; font-weight: 700; font-size: 0.72rem; text-decoration: none; }
    .btn-video-orig { color: #64748b; text-decoration: none; font-size: 0.72rem; }
    .badge-nationality { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; background: #f1f5f9; }

    @media (max-width: 1300px) {
      .grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 900px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
      .map-container { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <header>
    <h1>🇹🇼 타이베이 유튜브 200개 영상 맛집 전수 분석 & 가이드</h1>
    <p>조회수 10만 이상 200개 유튜브 영상 전수 분석 | 공인 챕터 및 자막 실측 타임스탬프 | 사진 & 2인 주문 꿀팁 & 원문 출처 하이퍼링크</p>
    <div class="view-mode-banner">
      <a href="youtube_food_guide_mobile.html" class="badge-view">📱 모바일 전용 뷰 열기 →</a>
      <span class="badge-view" style="background: rgba(0,0,0,0.3);">💻 PC 와이드 뷰 (현재)</span>
    </div>
  </header>

  <div class="stats-bar">
    <div class="stat-box">
      <div class="stat-num">200개</div>
      <div class="stat-label">분석 완료 유튜브 영상</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${(totalViews / 100000000).toFixed(1)}억 회</div>
      <div class="stat-label">분석 영상 누적 조회수</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">40곳</div>
      <div class="stat-label">유튜버 추천 맛집 전수</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${rawTimelines.length}건</div>
      <div class="stat-label">정밀 타임라인 (자막 실측)</div>
    </div>
  </div>

  <div class="container">

    <div class="guide-banner">
      <b>🗺️ 구글 내 지도(Google My Maps) 1초 등록 안내:</b>
      아래 버튼을 눌러 CSV 또는 KML 파일을 다운로드하신 후, <b>구글 내 지도(My Maps)</b>에 업로드하시면 스마트폰 구글맵 앱에서 바로 꺼내볼 수 있습니다.
      <div class="download-btns">
        <a href="taipei_youtube_restaurants_for_google_maps.csv" download class="btn btn-csv">📥 구글지도용 CSV 다운로드 (사진·2인팁 포함)</a>
        <a href="taipei_youtube_restaurants_for_google_maps.kml" download class="btn btn-kml">📥 KML 지도 파일 다운로드</a>
        <a href="taipei_youtube_food_timeline_raw.csv" download class="btn btn-csv" style="background: #3b82f6;">📊 8열 RAW 타임라인 CSV 다운로드</a>
      </div>
    </div>

    <!-- Map & Ranking -->
    <div class="map-container">
      <div id="map"></div>
      <div class="sidebar-ranking">
        <h3>🏆 유튜브 최다 추천 맛집 순위</h3>
        <div id="rankingList"></div>
      </div>
    </div>

    <!-- Section Heading -->
    <div style="margin: 25px 0 15px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <h2 style="font-size: 1.4rem; font-weight: 800;">🍽️ 타이베이 추천 맛집 TOP 40 (카드 4열 뷰)</h2>
        <p style="font-size: 0.85rem; color: #64748b;">메뉴 사진, 음식 한 줄 설명, 2인 주문 추천, 유튜버 실전 팁 및 원문 출처 하이퍼링크 완비</p>
      </div>
    </div>

    <!-- Filters for Top 40 Cards -->
    <div class="filters">
      <input type="text" id="searchInput" placeholder="식당명, 메뉴, 지하철역, 유튜버 검색..." onkeyup="filterRestaurants()" />
      <select id="districtFilter" onchange="filterRestaurants()">
        <option value="">모든 권역 (위치)</option>
        <option value="시먼딩">시먼딩 / 만화구</option>
        <option value="동먼">동먼 / 융캉제</option>
        <option value="타이베이 메인역">타이베이 메인역 / 중산</option>
        <option value="중정기념당">중정기념당</option>
        <option value="신이">신이 / 101타워</option>
        <option value="스린">스린 / 야시장</option>
        <option value="다퉁">다퉁 / 쌍련</option>
      </select>
      <select id="cuisineFilter" onchange="filterRestaurants()">
        <option value="">모든 음식 종류</option>
        <option value="우육면">우육면</option>
        <option value="루로우판">루로우판 / 덮밥</option>
        <option value="샤오롱바오">만두 / 샤오롱바오</option>
        <option value="대만식 조식">대만식 조식 (또우장)</option>
        <option value="디저트">디저트 / 버블티 / 빙수</option>
        <option value="훠궈">훠궈 / 샤브샤브</option>
        <option value="길거리">야시장 길거리 간식</option>
        <option value="기념품">기념품 (누가크래커)</option>
      </select>
    </div>

    <!-- 4 Cards Per Row Grid -->
    <div class="grid" id="restaurantGrid"></div>

    <!-- Spreadsheet Section -->
    <div class="spreadsheet-section">
      <div class="spreadsheet-header">
        <div>
          <h2>📊 200개 유튜브 영상 타임라인 전수 스프레드시트</h2>
          <p style="font-size: 0.82rem; color: #64748b; margin-top: 2px;">
            각 열 상단의 <b>[드롭다운 선택]</b> 또는 <b>[직접 텍스트 입력]</b>으로 다중 AND 조건 검색이 가능합니다.
          </p>
        </div>
        <div class="spreadsheet-controls">
          <input type="text" id="globalSearchInput" class="search-box-global" placeholder="🔍 통합 키워드 검색..." onkeyup="filterSpreadsheet()" />
          <button class="btn-reset" onclick="resetSpreadsheetFilters()">필터 초기화</button>
          <span id="spreadsheetCounter" style="font-size: 0.8rem; font-weight: 700; color: #0284c7;"></span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="spreadsheet-table">
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">No.</th>
              <th style="min-width: 90px; text-align: center;">유튜버 국적</th>
              <th style="min-width: 140px;">유튜버명</th>
              <th style="min-width: 240px;">영상제목</th>
              <th style="min-width: 170px;">맛집이름</th>
              <th style="min-width: 190px;">메뉴</th>
              <th style="min-width: 130px; text-align: center;">영상중 타임라인</th>
              <th style="min-width: 95px; text-align: center;">타임라인 링크</th>
              <th style="min-width: 65px; text-align: center;">영상링크</th>
            </tr>
            <!-- Dual Filter Row: Dropdown + Text Input -->
            <tr class="header-filters">
              <th style="text-align: center; color: #94a3b8; font-size: 0.72rem;">필터</th>
              <th>
                <div class="col-filter-box">
                  <select id="colSelectNationality" class="col-filter-select" onchange="filterSpreadsheet()">
                    <option value="">국적 선택 (전체)</option>
                    ${nationalities.map(n => `<option value="${n}">${n}</option>`).join('')}
                  </select>
                  <input type="text" id="colFilterNationality" class="col-filter-input" placeholder="직접입력..." onkeyup="filterSpreadsheet()" />
                </div>
              </th>
              <th>
                <div class="col-filter-box">
                  <select id="colSelectYoutuber" class="col-filter-select" onchange="filterSpreadsheet()">
                    <option value="">유튜버 선택 (전체)</option>
                    ${youtubers.slice(0, 40).map(y => `<option value="${y}">${y}</option>`).join('')}
                  </select>
                  <input type="text" id="colFilterYoutuber" class="col-filter-input" placeholder="유튜버명..." onkeyup="filterSpreadsheet()" />
                </div>
              </th>
              <th>
                <div class="col-filter-box">
                  <input type="text" id="colFilterTitle" class="col-filter-input" placeholder="제목 키워드..." onkeyup="filterSpreadsheet()" />
                </div>
              </th>
              <th>
                <div class="col-filter-box">
                  <select id="colSelectRestaurant" class="col-filter-select" onchange="filterSpreadsheet()">
                    <option value="">식당 선택 (전체)</option>
                    ${restaurantNames.map(r => `<option value="${r}">${r}</option>`).join('')}
                  </select>
                  <input type="text" id="colFilterRestaurant" class="col-filter-input" placeholder="식당명 직접입력..." onkeyup="filterSpreadsheet()" />
                </div>
              </th>
              <th>
                <div class="col-filter-box">
                  <input type="text" id="colFilterMenu" class="col-filter-input" placeholder="메뉴 키워드 (우육면, 펄)..." onkeyup="filterSpreadsheet()" />
                </div>
              </th>
              <th>
                <div class="col-filter-box">
                  <select id="colSelectTimelineType" class="col-filter-select" onchange="filterSpreadsheet()">
                    <option value="">타입 선택 (전체)</option>
                    <option value="공식 챕터">⏱️ 공식 챕터</option>
                    <option value="자막 실측">⏱️ 자막 실측</option>
                    <option value="자막 미지원">🎥 자막 미지원</option>
                  </select>
                  <input type="text" id="colFilterTimeline" class="col-filter-input" placeholder="시간 검색 (05:)..." onkeyup="filterSpreadsheet()" />
                </div>
              </th>
              <th style="text-align: center; color: #94a3b8; font-size: 0.72rem;">-</th>
              <th style="text-align: center; color: #94a3b8; font-size: 0.72rem;">-</th>
            </tr>
          </thead>
          <tbody id="spreadsheetBody"></tbody>
        </table>
      </div>
    </div>

  </div>

  <script>
    const RESTAURANTS = ${JSON.stringify(enrichedRestaurants)};
    const RAW_TIMELINES = ${JSON.stringify(rawTimelines)};

    // 1. Initialize Leaflet Map (Using Esri World Street Map - No API Key Needed)
    const map = L.map('map').setView([25.045, 121.525], 13);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; High Precision Coordinates',
      maxZoom: 18
    }).addTo(map);

    const markers = [];
    const markerGroup = L.featureGroup();

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
        <div class="rank-count">\${r.mention_count || 10}회</div>
      \`;
      item.onclick = () => {
        focusOnMap(r.rank);
      };
      rankingContainer.appendChild(item);
    });

    // Add Markers to Map with Number Badges
    RESTAURANTS.forEach((r, idx) => {
      const pinColor = idx < 3 ? '#d90429' : idx < 10 ? '#ea580c' : '#2563eb';
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: \`<div style="background:\${pinColor}; color:#ffffff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px; border:2.5px solid #ffffff; box-shadow:0 3px 8px rgba(0,0,0,0.35); text-shadow:0 1px 2px rgba(0,0,0,0.4); cursor:pointer;">\${r.rank}</div>\`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      });

      const marker = L.marker([r.lat, r.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(\`
        <div style="font-family: Pretendard, -apple-system, sans-serif; font-size: 0.84rem; max-width: 270px; line-height: 1.45;">
          <img src="\${r.image_url}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" />
          <h4 style="margin: 0 0 2px; color: #d90429; font-size: 0.96rem;">#\${r.rank} \${r.name_ko}</h4>
          <p style="margin: 0 0 4px; color: #64748b; font-size: 0.74rem;">\${r.name_zh}</p>
          <p style="margin: 0 0 4px; font-size: 0.76rem;">⭐️ <b>평점:</b> \${r.rating} | <b>분류:</b> \${r.cuisine}</p>
          <p style="margin: 0 0 4px; font-size: 0.76rem;">📍 <b>위치:</b> \${r.district}</p>
          <p style="margin: 0 0 4px; font-size: 0.76rem;">🚇 <b>교통:</b> \${r.mrt}</p>
          <p style="margin: 0 0 4px; font-size: 0.76rem;">🍲 <b>대표메뉴:</b> \${r.menu}</p>
          <p style="margin: 0 0 6px; font-size: 0.74rem; color: #065f46; background: #ecfdf5; padding: 6px 8px; border-radius: 4px; border: 1px solid #a7f3d0;">👥 <b>2인 추천:</b> \${r.order_tip_2p}</p>
          <a href="https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(r.name_ko + ' ' + r.address)}" target="_blank" style="display: block; text-align: center; background: #2563eb; color: #ffffff; padding: 6px 10px; border-radius: 4px; font-weight: 700; text-decoration: none; font-size: 0.78rem;">🗺️ Google 지도 공식 앱으로 열기 →</a>
        </div>
      \`);
      markers.push(marker);
      markerGroup.addLayer(marker);
    });

    // Auto fit bounds to enclose all 40 spots comfortably
    if (markers.length > 0) {
      map.fitBounds(markerGroup.getBounds().pad(0.08));
    }

    function focusOnMap(rank) {
      const idx = rank - 1;
      const r = RESTAURANTS[idx];
      if (r && markers[idx]) {
        map.flyTo([r.lat, r.lng], 16, { animate: true });
        markers[idx].openPopup();
        document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Render Cards (4 Cards Per Row with Photos, 2P Tip, YouTuber Tip)
    const grid = document.getElementById('restaurantGrid');
    function renderCards(list) {
      grid.innerHTML = '';
      list.forEach((r) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = \`
          <div class="card-img-wrap">
            <img src="\${r.image_url}" alt="\${r.name_ko}" class="card-img" loading="lazy" />
            <a href="\${r.image_source_url}" target="_blank" class="card-img-source" title="사진 원본 출처 확인">📷 사진출처</a>
          </div>
          <div class="card-head">
            <div class="card-title">
              <h3>#\${r.rank} \${r.name_ko}</h3>
              <span>\${r.name_zh}</span>
            </div>
            <div class="pill-mention">🔥 \${r.mention_count || 10}회</div>
          </div>
          <div class="card-body">
            <div class="desc-box">\${r.one_line_desc}</div>
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
              <div class="card-label">대표메뉴</div>
              <div class="card-val" style="font-weight: 600;">\${r.menu}</div>
            </div>
            <div class="tip-box-2p">
              <b>👥 2인 주문 추천:</b> \${r.order_tip_2p}
              <a href="\${r.order_tip_source_url}" target="_blank" class="source-link">[후기원문]</a>
            </div>
            <div class="tip-box-yt">
              <b>🎬 \${r.youtuber_tip_creator} 팁:</b> \${r.youtuber_tip}
              <a href="\${r.youtuber_tip_video_url}" target="_blank" class="source-link">[영상원문]</a>
            </div>
            <div class="card-footer-link">
              <button onclick="focusOnMap(\${r.rank})" class="btn-focus-map">📍 지도에서 위치 확인</button>
              <a href="https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(r.name_ko + ' ' + r.address)}" target="_blank">🗺️ Google 지도 보기 →</a>
            </div>
          </div>
        \`;
        grid.appendChild(card);
      });
    }
    renderCards(RESTAURANTS);

    function filterRestaurants() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const dist = document.getElementById('districtFilter').value;
      const cuis = document.getElementById('cuisineFilter').value;

      const filtered = RESTAURANTS.filter(r => {
        const text = (r.name_ko + r.name_zh + r.menu + r.mrt + r.district + r.one_line_desc + r.order_tip_2p + r.youtuber_tip).toLowerCase();
        const matchesQ = !q || text.includes(q);
        const matchesDist = !dist || r.district.includes(dist);
        const matchesCuis = !cuis || r.cuisine.includes(cuis);
        return matchesQ && matchesDist && matchesCuis;
      });

      renderCards(filtered);
    }

    // Spreadsheet Logic with Dual Filter: Dropdown OR Text Input
    const spreadsheetBody = document.getElementById('spreadsheetBody');
    const spreadsheetCounter = document.getElementById('spreadsheetCounter');

    function renderSpreadsheetRows(rows) {
      if (rows.length === 0) {
        spreadsheetBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 30px; color: #94a3b8;">일치하는 검색 결과가 없습니다. 필터 조건을 변경해보세요.</td></tr>';
        return;
      }
      const fragment = document.createDocumentFragment();
      rows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        let tagClass = 'tag-timeline-none';
        if (row.timeline.includes('공식 챕터')) tagClass = 'tag-timeline-official';
        else if (row.timeline.includes('자막 실측')) tagClass = 'tag-timeline-transcript';

        tr.innerHTML = \`
          <td style="text-align: center; color: #64748b; font-weight: 600;">\${idx + 1}</td>
          <td style="text-align: center;"><span class="badge-nationality">\${row.nationality}</span></td>
          <td><b>\${row.youtuber}</b></td>
          <td><div style="max-width: 280px; white-space: normal; word-break: keep-all;">\${row.videoTitle}</div></td>
          <td style="font-weight: 700; color: #d90429;">\${row.restaurantName}</td>
          <td><div style="max-width: 220px; white-space: normal; color: #334155;">\${row.menu}</div></td>
          <td style="text-align: center;"><span class="\${tagClass}">\${row.timeline}</span></td>
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
      
      // Dual filter: Select dropdown takes priority, fallback to text input
      const selNat = document.getElementById('colSelectNationality')?.value || '';
      const inpNat = document.getElementById('colFilterNationality')?.value || '';
      const colNat = (customCriteria?.nationality !== undefined ? customCriteria.nationality : (selNat || inpNat)).toLowerCase().trim();

      const selYoutuber = document.getElementById('colSelectYoutuber')?.value || '';
      const inpYoutuber = document.getElementById('colFilterYoutuber')?.value || '';
      const colYoutuber = (customCriteria?.youtuber !== undefined ? customCriteria.youtuber : (selYoutuber || inpYoutuber)).toLowerCase().trim();

      const colTitle = (customCriteria?.title !== undefined ? customCriteria.title : document.getElementById('colFilterTitle')?.value || '').toLowerCase().trim();

      const selRestaurant = document.getElementById('colSelectRestaurant')?.value || '';
      const inpRestaurant = document.getElementById('colFilterRestaurant')?.value || '';
      const colRestaurant = (customCriteria?.restaurant !== undefined ? customCriteria.restaurant : (selRestaurant || inpRestaurant)).toLowerCase().trim();

      const colMenu = (customCriteria?.menu !== undefined ? customCriteria.menu : document.getElementById('colFilterMenu')?.value || '').toLowerCase().trim();

      const selTlType = document.getElementById('colSelectTimelineType')?.value || '';
      const inpTl = document.getElementById('colFilterTimeline')?.value || '';
      const colTimeline = (customCriteria?.timeline !== undefined ? customCriteria.timeline : (selTlType || inpTl)).toLowerCase().trim();

      const matched = RAW_TIMELINES.filter(item => {
        if (globalQ) {
          const combined = \`\${item.nationality} \${item.youtuber} \${item.videoTitle} \${item.restaurantName} \${item.menu} \${item.timeline}\`.toLowerCase();
          if (!combined.includes(globalQ)) return false;
        }
        if (colNat && !item.nationality.toLowerCase().includes(colNat)) return false;
        if (colYoutuber && !item.youtuber.toLowerCase().includes(colYoutuber)) return false;
        if (colTitle && !item.videoTitle.toLowerCase().includes(colTitle)) return false;
        if (colRestaurant && !item.restaurantName.toLowerCase().includes(colRestaurant)) return false;
        if (colMenu && !item.menu.toLowerCase().includes(colMenu)) return false;
        if (colTimeline && !item.timeline.toLowerCase().includes(colTimeline)) return false;
        return true;
      });

      renderSpreadsheetRows(matched);
      if (spreadsheetCounter) {
        spreadsheetCounter.innerHTML = \`표시 중: <b>\${matched.length}</b> / \${RAW_TIMELINES.length}개 행\`;
      }
      return matched;
    }

    function resetSpreadsheetFilters() {
      document.getElementById('globalSearchInput').value = '';
      document.getElementById('colSelectNationality').value = '';
      document.getElementById('colFilterNationality').value = '';
      document.getElementById('colSelectYoutuber').value = '';
      document.getElementById('colFilterYoutuber').value = '';
      document.getElementById('colFilterTitle').value = '';
      document.getElementById('colSelectRestaurant').value = '';
      document.getElementById('colFilterRestaurant').value = '';
      document.getElementById('colFilterMenu').value = '';
      document.getElementById('colSelectTimelineType').value = '';
      document.getElementById('colFilterTimeline').value = '';
      filterSpreadsheet();
    }

    // Initial render
    filterSpreadsheet();
  </script>
</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  fs.writeFileSync(indexPath, htmlContent, 'utf8');
  console.log(`Saved updated HTML Dashboard to ${htmlPath} and ${indexPath}`);

  // 4. Generate Mobile HTML Dashboard
  const mobileHtmlPath = 'c:\\cowork\\taiwan\\food\\youtube_food_guide_mobile.html';
  const mobilePath = 'c:\\cowork\\taiwan\\food\\mobile.html';

  const mobileContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>🇹🇼 타이베이 유튜브 200개 영상 맛집 가이드 (모바일 V4)</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root { --primary: #e63946; --bg: #f8f9fa; --border: #e2e8f0; }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body { font-family: 'Pretendard', sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 75px; }
    
    header { background: linear-gradient(135deg, #d90429, #ef233c); color: white; padding: 18px 16px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    header h1 { font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; justify-content: space-between; }
    .badge-desktop-link { font-size: 0.72rem; background: rgba(255,255,255,0.25); padding: 4px 8px; border-radius: 12px; color: white; text-decoration: none; font-weight: 600; }
    
    .nav-tabs { display: flex; background: white; border-bottom: 1px solid var(--border); position: sticky; top: 57px; z-index: 99; }
    .nav-tab { flex: 1; text-align: center; padding: 12px 6px; font-size: 0.85rem; font-weight: 700; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer; }
    .nav-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

    .tab-content { display: none; padding: 12px; }
    .tab-content.active { display: block; }

    .m-search { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.88rem; outline: none; margin-bottom: 10px; background: white; }

    /* Mobile Cards */
    .m-card { background: white; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 12px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.03); }
    .m-card-img-wrap { position: relative; width: 100%; height: 130px; background: #e2e8f0; }
    .m-card-img { width: 100%; height: 100%; object-fit: cover; }
    .m-card-source { position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.65); color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; text-decoration: none; }
    .m-card-head { padding: 10px 12px 6px; display: flex; justify-content: space-between; align-items: flex-start; }
    .m-card-title h3 { font-size: 0.95rem; font-weight: 700; }
    .m-card-body { padding: 6px 12px 10px; font-size: 0.8rem; display: flex; flex-direction: column; gap: 5px; }
    .m-desc { background: #f8fafc; border-left: 3px solid #3b82f6; padding: 5px 8px; font-size: 0.74rem; color: #334155; }
    .m-tip-2p { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 6px 8px; font-size: 0.74rem; color: #065f46; }
    .m-tip-yt { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 6px 8px; font-size: 0.74rem; color: #92400e; }

    #mobileMap { height: 350px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 12px; }

    /* Timeline list */
    .timeline-item { background: white; border-radius: 8px; border: 1px solid var(--border); padding: 10px 12px; margin-bottom: 8px; }
    .tl-tag { font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #f1f5f9; }
    .tl-btn-jump { display: inline-block; background: #e63946; color: white; font-size: 0.74rem; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-decoration: none; margin-top: 6px; }
  </style>
</head>
<body>

  <header>
    <h1>🇹🇼 타이베이 맛집 가이드 <a href="youtube_food_guide.html" class="badge-desktop-link">💻 PC버전</a></h1>
  </header>

  <div class="nav-tabs">
    <div class="nav-tab active" onclick="switchTab(0)">🍽️ 맛집 카드</div>
    <div class="nav-tab" onclick="switchTab(1)">🗺️ 지도 보기</div>
    <div class="nav-tab" onclick="switchTab(2)">🎬 타임라인 (<span id="mTlCount">${rawTimelines.length}</span>)</div>
  </div>

  <!-- Tab 0: Cards -->
  <div class="tab-content active" id="tab0">
    <input type="text" id="mCardSearch" class="m-search" placeholder="🔍 식당명, 메뉴, 위치 검색..." />
    <div id="mCardList"></div>
  </div>

  <!-- Tab 1: Map -->
  <div class="tab-content" id="tab1">
    <div id="mobileMap"></div>
    <div id="mMapList"></div>
  </div>

  <!-- Tab 2: Timelines -->
  <div class="tab-content" id="tab2">
    <input type="text" id="mTimelineSearch" class="m-search" placeholder="🔍 유튜버, 식당명, 메뉴, 시간(05:) 검색..." />
    <div id="mTimelineList"></div>
  </div>

  <script>
    const RESTAURANTS = ${JSON.stringify(enrichedRestaurants)};
    const RAW_TIMELINES = ${JSON.stringify(rawTimelines)};

    function switchTab(idx) {
      document.querySelectorAll('.nav-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
      document.querySelectorAll('.tab-content').forEach((c, i) => c.classList.toggle('active', i === idx));
      if (idx === 1) {
        setTimeout(() => mMap.invalidateSize(), 200);
      }
    }

    // Render Cards
    const mCardList = document.getElementById('mCardList');
    function renderMCards(list) {
      mCardList.innerHTML = '';
      list.forEach(r => {
        const d = document.createElement('div');
        d.className = 'm-card';
        d.innerHTML = \`
          <div class="m-card-img-wrap">
            <img src="\${r.image_url}" alt="\${r.name_ko}" class="m-card-img" loading="lazy" />
            <a href="\${r.image_source_url}" target="_blank" class="m-card-source">📷 출처</a>
          </div>
          <div class="m-card-head">
            <div class="m-card-title">
              <h3>#\${r.rank} \${r.name_ko}</h3>
              <span style="font-size: 0.72rem; color: #64748b;">\${r.name_zh}</span>
            </div>
            <span style="color: #ef233c; font-weight: 800; font-size: 0.78rem;">\${r.mention_count || 10}회</span>
          </div>
          <div class="m-card-body">
            <div class="m-desc">\${r.one_line_desc}</div>
            <div style="font-size: 0.76rem; color: #64748b;">⭐️ \${r.rating} | \${r.cuisine} | \${r.district}</div>
            <div style="font-size: 0.76rem;"><b>대표:</b> \${r.menu}</div>
            <div class="m-tip-2p"><b>👥 2인 팁:</b> \${r.order_tip_2p} <a href="\${r.order_tip_source_url}" target="_blank" style="color:#2563eb;">[원문]</a></div>
            <div class="m-tip-yt"><b>🎬 \${r.youtuber_tip_creator}:</b> \${r.youtuber_tip} <a href="\${r.youtuber_tip_video_url}" target="_blank" style="color:#2563eb;">[영상]</a></div>
            <a href="https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(r.name_ko + ' ' + r.address)}" target="_blank" style="display:block; text-align:center; padding: 6px; background: #f1f5f9; color: #2563eb; font-weight: 700; border-radius: 4px; text-decoration: none; margin-top: 4px;">🗺️ Google 지도 앱으로 열기</a>
          </div>
        \`;
        mCardList.appendChild(d);
      });
    }
    renderMCards(RESTAURANTS);

    document.getElementById('mCardSearch').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = RESTAURANTS.filter(r => (r.name_ko + r.name_zh + r.menu + r.district + r.one_line_desc).toLowerCase().includes(q));
      renderMCards(filtered);
    });

    // Mobile Map
    const mMap = L.map('mobileMap').setView([25.045, 121.525], 13);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; High Precision Coordinates',
      maxZoom: 18
    }).addTo(mMap);

    const mMarkerGroup = L.featureGroup();
    const mMapList = document.getElementById('mMapList');
    const mMarkers = [];

    RESTAURANTS.forEach((r, idx) => {
      const pinColor = idx < 3 ? '#d90429' : idx < 10 ? '#ea580c' : '#2563eb';
      const customIcon = L.divIcon({
        className: 'custom-m-pin',
        html: \`<div style="background:\${pinColor}; color:#ffffff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:11px; border:2px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.35); text-shadow:0 1px 2px rgba(0,0,0,0.4); cursor:pointer;">\${r.rank}</div>\`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([r.lat, r.lng], { icon: customIcon }).addTo(mMap);
      marker.bindPopup(\`
        <div style="font-family: Pretendard, sans-serif; font-size: 0.8rem; max-width: 230px; line-height: 1.4;">
          <h4 style="margin: 0 0 2px; color: #d90429;">#\${r.rank} \${r.name_ko}</h4>
          <p style="margin: 0 0 3px; color: #64748b; font-size: 0.7rem;">\${r.name_zh}</p>
          <p style="margin: 0 0 3px; font-size: 0.74rem;">📍 \${r.district}</p>
          <p style="margin: 0 0 3px; font-size: 0.74rem;">🚇 \${r.mrt}</p>
          <p style="margin: 0 0 3px; font-size: 0.74rem;">🍲 \${r.menu}</p>
          <a href="https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(r.name_ko + ' ' + r.address)}" target="_blank" style="display:block; text-align:center; background:#2563eb; color:#fff; padding:5px; border-radius:4px; font-weight:bold; font-size:0.75rem; text-decoration:none; margin-top:5px;">🗺️ Google 지도 앱으로 열기</a>
        </div>
      \`);
      mMarkers.push(marker);
      mMarkerGroup.addLayer(marker);

      const row = document.createElement('div');
      row.style.cssText = 'padding: 8px 10px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; cursor: pointer;';
      row.innerHTML = \`
        <div>
          <span style="font-weight: 800; color: \${pinColor}; margin-right: 6px;">#\${r.rank}</span>
          <span style="font-weight: 700;">\${r.name_ko}</span>
          <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">\${r.district} · \${r.cuisine}</div>
        </div>
        <span style="color:#ef233c; font-weight:bold; font-size:0.78rem;">\${r.mention_count || 10}회</span>
      \`;
      row.onclick = () => {
        mMap.flyTo([r.lat, r.lng], 16);
        marker.openPopup();
        window.scrollTo({ top: 100, behavior: 'smooth' });
      };
      mMapList.appendChild(row);
    });

    if (mMarkers.length > 0) {
      mMap.fitBounds(mMarkerGroup.getBounds().pad(0.08));
    }

    // Timeline List
    const tlContainer = document.getElementById('mTimelineList');
    function renderMTimelines(list) {
      tlContainer.innerHTML = '';
      document.getElementById('mTlCount').textContent = list.length;
      list.forEach(t => {
        const d = document.createElement('div');
        d.className = 'timeline-item';
        d.innerHTML = \`
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span class="tl-tag">\${t.nationality} · \${t.youtuber}</span>
            <span style="font-size:0.75rem; font-weight:700; color:#2563eb;">\${t.timeline}</span>
          </div>
          <div style="font-size:0.88rem; font-weight:700; color:#d90429;">\${t.restaurantName}</div>
          <div style="font-size:0.76rem; color:#475569;">\${t.menu}</div>
          <div style="font-size:0.72rem; color:#94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;">\${t.videoTitle}</div>
          <a class="tl-btn-jump" href="\${t.timelineUrl}" target="_blank">🎬 해당 시점으로 바로가기</a>
        \`;
        tlContainer.appendChild(d);
      });
    }
    renderMTimelines(RAW_TIMELINES);

    document.getElementById('mTimelineSearch').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = RAW_TIMELINES.filter(t => \`\${t.nationality} \${t.youtuber} \${t.videoTitle} \${t.restaurantName} \${t.menu} \${t.timeline}\`.toLowerCase().includes(q));
      renderMTimelines(filtered);
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(mobileHtmlPath, mobileContent, 'utf8');
  fs.writeFileSync(mobilePath, mobileContent, 'utf8');
  console.log(`Saved updated Mobile Versions to ${mobileHtmlPath} and ${mobilePath}`);
}

runDeliverablesGenerationV4();

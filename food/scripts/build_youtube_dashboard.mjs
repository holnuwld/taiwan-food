import fs from 'fs';
import path from 'path';

const VIDEOS_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_50_videos_final.json';
const videos = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));

// Import RESTAURANTS from generate_google_maps_dataset.mjs or define
// Let's read RESTAURANTS via an export or reconstruct
const SCRIPT_PATH = 'c:\\cowork\\taiwan\\food\\scripts\\generate_google_maps_dataset.mjs';
const scriptCode = fs.readFileSync(SCRIPT_PATH, 'utf8');
const match = scriptCode.match(/const RESTAURANTS = (\[[\s\S]+?\]);\s*console\.log/);
if (!match) throw new Error('Could not parse RESTAURANTS');
const RESTAURANTS = eval(match[1]);

console.log(`Loaded ${RESTAURANTS.length} restaurants and ${videos.length} videos.`);

// Build HTML
const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>타이베이 유튜브 인기 맛집 50선 지도 가이드 (Google Maps 연동)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Pretendard', sans-serif; background-color: #f8fafc; }
    #map { height: 500px; z-index: 10; }
    .custom-popup .leaflet-popup-content-wrapper { border-radius: 1rem; padding: 0.5rem; }
  </style>
</head>
<body class="text-slate-800">

  <!-- Header -->
  <header class="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="bg-white/20 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">YouTube × Google Maps</span>
          <span class="bg-amber-400 text-slate-900 text-xs font-extrabold px-2.5 py-1 rounded-full">조회수 10만+ / 2년 이내</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">🇹🇼 타이베이 유튜브 검증 맛집 지도 가이드</h1>
      </div>
      <div class="flex items-center gap-2">
        <a href="taipei_youtube_restaurants_for_google_maps.csv" download class="bg-white text-rose-600 hover:bg-rose-50 text-xs md:text-sm font-bold px-3.5 py-2 rounded-xl shadow transition flex items-center gap-1.5">
          <i class="fa-solid fa-file-csv"></i> 구글 내 지도용 CSV 다운로드
        </a>
        <a href="taipei_youtube_restaurants_for_google_maps.kml" download class="bg-rose-950/40 hover:bg-rose-950/60 text-white text-xs md:text-sm font-bold px-3.5 py-2 rounded-xl shadow transition flex items-center gap-1.5">
          <i class="fa-solid fa-map-location-dot"></i> KML 지도 다운로드
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 py-6 space-y-6">

    <!-- Interactive Map Banner -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-map-pin text-rose-600 text-lg"></i>
          <span class="font-bold text-slate-800">인터랙티브 타이베이 맛집 지도</span>
          <span class="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">총 ${RESTAURANTS.length}곳 핀 마킹</span>
        </div>
        <div class="text-xs text-slate-500">
          💡 핀을 클릭하면 대표 메뉴, 유튜브 출처 및 구글 지도 다이렉트 링크가 표시됩니다.
        </div>
      </div>
      <div id="map"></div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <!-- Cuisine Filter -->
      <div>
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <i class="fa-solid fa-utensils text-rose-500"></i> 음식 종류별 필터 (Cuisine)
        </label>
        <div class="flex flex-wrap gap-1.5" id="cuisine-filters">
          <button onclick="filterCuisine('ALL')" class="cuisine-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white transition shadow-sm" data-cuisine="ALL">전체 (${RESTAURANTS.length})</button>
          <button onclick="filterCuisine('우육면')" class="cuisine-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-cuisine="우육면">우육면</button>
          <button onclick="filterCuisine('루로우판')" class="cuisine-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-cuisine="루로우판">루로우판</button>
          <button onclick="filterCuisine('만두 / 샤오롱바오')" class="cuisine-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-cuisine="만두 / 샤오롱바오">소룡포/만두</button>
          <button onclick="filterCuisine('전통 조식 / 또우장')" class="cuisine-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-cuisine="전통 조식 / 또우장">전통 조식/또우장</button>
          <button onclick="filterCuisine('러차오 (대만식 선술집)')" class="cuisine-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-cuisine="러차오 (대만식 선술집)">러차오/포차</button>
          <button onclick="filterCuisine('고기 요리 / 거위고기')" class="cuisine-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-cuisine="고기 요리 / 거위고기">거위고기/스테이크</button>
          <button onclick="filterCuisine('로컬 길거리 간식')" class="cuisine-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-cuisine="로컬 길거리 간식">길거리 간식</button>
          <button onclick="filterCuisine('야시장 명물')" class="cuisine-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-cuisine="야시장 명물">야시장 명물</button>
          <button onclick="filterCuisine('훠궈')" class="cuisine-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-cuisine="훠궈">훠궈</button>
          <button onclick="filterCuisine('디저트 / 망고빙수')" class="cuisine-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-cuisine="디저트 / 망고빙수">망고빙수/디저트</button>
        </div>
      </div>

      <!-- District Filter -->
      <div class="pt-2 border-t border-slate-100">
        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <i class="fa-solid fa-location-dot text-rose-500"></i> 위치별 필터 (Location / District)
        </label>
        <div class="flex flex-wrap gap-1.5" id="district-filters">
          <button onclick="filterDistrict('ALL')" class="dist-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white transition shadow-sm" data-district="ALL">전체 지역</button>
          <button onclick="filterDistrict('시먼딩 / 만화구')" class="dist-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-district="시먼딩 / 만화구">시먼딩 / 만화</button>
          <button onclick="filterDistrict('동먼 / 융캉제')" class="dist-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-district="동먼 / 융캉제">동먼 / 융캉제</button>
          <button onclick="filterDistrict('타이베이 메인역 / 중산')" class="dist-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-district="타이베이 메인역 / 중산">메인역 / 중산</button>
          <button onclick="filterDistrict('다안 / 중샤오푸싱')" class="dist-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-district="다안 / 중샤오푸싱">다안 / 푸싱 / 신의</button>
          <button onclick="filterDistrict('야시장')" class="dist-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition" data-district="야시장">3대 야시장</button>
        </div>
      </div>
    </div>

    <!-- Restaurant Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="restaurants-grid">
      ${RESTAURANTS.map((r, i) => `
        <div class="restaurant-card bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
             data-cuisine="${r.cuisine}"
             data-district="${r.district}">
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">#${i + 1} ${r.cuisine}</span>
                <h3 class="text-lg font-bold text-slate-900 mt-1">${r.name_ko} <span class="text-xs font-normal text-slate-500">(${r.name_zh})</span></h3>
              </div>
              <div class="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl text-xs font-bold text-amber-700">
                <i class="fa-solid fa-star text-amber-500 text-[11px]"></i> ${r.rating}
              </div>
            </div>

            <div class="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p><i class="fa-solid fa-map-location-dot text-slate-400 w-4"></i> <span class="font-semibold text-slate-700">${r.district}</span> (${r.mrt})</p>
              <p><i class="fa-solid fa-utensils text-slate-400 w-4"></i> <span class="font-semibold text-slate-700">대표 메뉴:</span> ${r.menu}</p>
            </div>

            <div class="text-xs text-slate-600 space-y-1.5">
              <p class="leading-relaxed"><strong class="text-slate-800">🥄 먹는 팁:</strong> ${r.how_to_eat}</p>
              <p class="leading-relaxed"><strong class="text-rose-600">🎥 영상 출처:</strong> ${r.youtube_source}</p>
              <p class="leading-relaxed text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-100">
                <strong>💡 유튜버 꿀팁:</strong> ${r.creator_tip}
              </p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button onclick="panToPlace(${r.lat}, ${r.lng}, '${r.name_ko}')" class="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1">
              <i class="fa-solid fa-location-crosshairs"></i> 지도 보기
            </button>
            <a href="https://www.google.com/maps?q=${r.lat},${r.lng}" target="_blank" class="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1">
              <i class="fa-brands fa-google"></i> 구글 지도에서 열기
            </a>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- 50 YouTube Videos Citations Accordion -->
    <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <i class="fa-brands fa-youtube text-red-600 text-2xl"></i>
            조회수 10만+ 분석 대상 유튜브 영상 50선 전수 목록
          </h2>
          <p class="text-xs text-slate-500 mt-1">최근 2년(2024~2026) 이내 발행, 누적 조회수 6,000만 회 이상의 타이베이 미식 콘텐츠</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th class="py-2.5 px-3 w-12 text-center">No</th>
              <th class="py-2.5 px-3 w-40">유튜브 채널</th>
              <th class="py-2.5 px-3">영상 제목</th>
              <th class="py-2.5 px-3 w-28 text-right">조회수</th>
              <th class="py-2.5 px-3 w-24 text-center">발행일</th>
              <th class="py-2.5 px-3 w-20 text-center">링크</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${videos.map((v, i) => `
              <tr class="hover:bg-rose-50/40 transition">
                <td class="py-2.5 px-3 text-center font-bold text-slate-400">${i + 1}</td>
                <td class="py-2.5 px-3 font-bold text-slate-800">${v.channel}</td>
                <td class="py-2.5 px-3 text-slate-700">${v.title}</td>
                <td class="py-2.5 px-3 text-right font-extrabold text-rose-600">${v.viewCount.toLocaleString()}회</td>
                <td class="py-2.5 px-3 text-center text-slate-500">${v.publishDate.slice(0, 10)}</td>
                <td class="py-2.5 px-3 text-center">
                  <a href="${v.url}" target="_blank" class="text-red-600 hover:text-red-700 font-bold flex items-center justify-center gap-1">
                    <i class="fa-brands fa-youtube"></i> 재생
                  </a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </main>

  <script>
    // Leaflet Map Init
    const map = L.map('map').setView([25.042, 121.525], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const places = ${JSON.stringify(RESTAURANTS)};
    const markers = [];

    places.forEach((p, idx) => {
      const marker = L.marker([p.lat, p.lng]).addTo(map);
      const popupContent = \`
        <div class="p-1 space-y-1 text-xs">
          <div class="font-bold text-sm text-slate-900">\${p.name_ko} <span class="text-xs font-normal text-slate-500">(\${p.name_zh})</span></div>
          <div class="text-rose-600 font-bold">\${p.cuisine} · ⭐ \${p.rating}</div>
          <div class="text-slate-600">\${p.menu}</div>
          <div class="pt-1">
            <a href="https://www.google.com/maps?q=\${p.lat},\${p.lng}" target="_blank" class="inline-block bg-rose-600 text-white font-bold px-2 py-1 rounded text-[11px]">구글 지도 바로가기</a>
          </div>
        </div>
      \`;
      marker.bindPopup(popupContent);
      markers.push({ id: idx, marker, cuisine: p.cuisine, district: p.district });
    });

    function panToPlace(lat, lng, name) {
      map.setView([lat, lng], 16, { animate: true });
      const target = markers.find(m => places[m.id].name_ko === name);
      if (target) target.marker.openPopup();
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }

    // Filter Logic
    let currentCuisine = 'ALL';
    let currentDistrict = 'ALL';

    function filterCuisine(cat) {
      currentCuisine = cat;
      updateFilterButtons();
      applyFilters();
    }

    function filterDistrict(dist) {
      currentDistrict = dist;
      updateFilterButtons();
      applyFilters();
    }

    function updateFilterButtons() {
      document.querySelectorAll('.cuisine-btn').forEach(btn => {
        if (btn.getAttribute('data-cuisine') === currentCuisine) {
          btn.className = "cuisine-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white transition shadow-sm";
        } else {
          btn.className = "cuisine-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition";
        }
      });

      document.querySelectorAll('.dist-btn').forEach(btn => {
        if (btn.getAttribute('data-district') === currentDistrict) {
          btn.className = "dist-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white transition shadow-sm";
        } else {
          btn.className = "dist-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition";
        }
      });
    }

    function applyFilters() {
      const cards = document.querySelectorAll('.restaurant-card');
      cards.forEach(card => {
        const c = card.getAttribute('data-cuisine');
        const d = card.getAttribute('data-district');

        let matchC = (currentCuisine === 'ALL') || (c.includes(currentCuisine));
        let matchD = (currentDistrict === 'ALL') || (d.includes(currentDistrict)) || (currentDistrict === '야시장' && (c.includes('야시장') || d.includes('야시장')));

        if (matchC && matchD) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;

fs.writeFileSync('c:\\cowork\\taiwan\\food\\youtube_food_guide.html', html, 'utf8');
fs.writeFileSync('c:\\cowork\\taiwan\\food\\index.html', html, 'utf8');
console.log('Successfully generated youtube_food_guide.html and index.html!');

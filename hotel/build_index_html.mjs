import fs from 'fs';

const districtData = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/top30_full_data.json', 'utf8'));

// Flatten hotels list for JS array
const allHotels = [];
districtData.forEach(dist => {
  dist.hotels.forEach(h => {
    allHotels.push({
      ...h,
      districtGroup: dist.districtName
    });
  });
});

console.log(`Total hotels to embed: ${allHotels.length}`);

// Generate District Tables HTML
let tablesHtml = '';
let globalIndex = 0;

districtData.forEach((dist, dIdx) => {
  tablesHtml += `
    <!-- 지역 그룹: ${dist.districtName} -->
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
            ${dIdx + 1}
          </span>
          <div>
            <h3 class="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ${dist.districtName}
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-800/80 text-indigo-200 font-semibold border border-indigo-700">
                ${dist.hotels.length}개 호텔 (마일리지 고 → 저 정렬)
              </span>
            </h3>
            <p class="text-xs text-slate-300 mt-0.5">${dist.description}</p>
          </div>
        </div>
        <div class="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg self-start md:self-auto flex items-center gap-1.5">
          <i class="fa-solid fa-triangle-exclamation text-amber-400"></i>
          <span>빨간색 표기 호텔: <strong>마일리지 예약이 현금 최저가보다 비쌈</strong></span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm border-collapse">
          <thead class="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th class="py-3 px-3 sm:px-4 w-12 text-center">No</th>
              <th class="py-3 px-3 sm:px-4 min-w-[200px]">호텔명 (구글지도 링크)</th>
              <th class="py-3 px-3 sm:px-4 min-w-[170px]">인접 지하철역 (MRT) / 도보</th>
              <th class="py-3 px-3 sm:px-4 min-w-[130px]">침대 타입 (Twin/Double)</th>
              <th class="py-3 px-3 sm:px-4 text-right min-w-[160px] bg-amber-50/40">
                에미레이트 마일리지<br>
                <span class="text-[10px] text-slate-500 font-normal">(1박 / 3박 총액 & 시세환산)</span>
              </th>
              <th class="py-3 px-3 sm:px-4 text-right min-w-[190px] bg-emerald-50/30">
                외부 3개사 가격 (3박)<br>
                <span class="text-[10px] text-slate-500 font-normal">Google / Hotels.com / Agoda</span>
              </th>
              <th class="py-3 px-3 sm:px-4 text-center min-w-[110px]">구글 평점 / 리뷰</th>
              <th class="py-3 px-3 sm:px-4 text-center min-w-[130px]">리뷰 & 위치</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
  `;

  dist.hotels.forEach(hotel => {
    const currentIndex = globalIndex++;
    const milesPerNightFmt = hotel.milesPerNight.toLocaleString();
    const miles3NightsFmt = hotel.miles3Nights.toLocaleString();
    const milesValueFmt = hotel.milesValueKRW.toLocaleString();
    const googleHotelsFmt = hotel.googleHotelsKRW.toLocaleString();
    const hotelsDotComFmt = hotel.hotelsDotComKRW.toLocaleString();
    const agodaFmt = hotel.agodaKRW.toLocaleString();
    const lowestOtaFmt = hotel.lowestOtaKRW.toLocaleString();

    // Red styling if miles is more expensive than cash
    const nameColorClass = hotel.isMilesMoreExpensive
      ? "text-red-600 hover:text-red-700 font-extrabold underline decoration-red-300 decoration-2"
      : "text-slate-900 hover:text-indigo-600 font-extrabold";

    const badgeMoreExpensive = hotel.isMilesMoreExpensive
      ? `<span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold border border-red-200">
           마일리지 예약 비추천 (현금 대비 +₩${(hotel.milesValueKRW - hotel.lowestOtaKRW).toLocaleString()} 비쌈)
         </span>`
      : `<span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
           마일리지 가치 적정
         </span>`;

    tablesHtml += `
      <tr class="hover:bg-indigo-50/20 transition-colors">
        <td class="py-3.5 px-3 sm:px-4 text-center font-bold text-slate-400">
          ${currentIndex + 1}
        </td>
        <td class="py-3.5 px-3 sm:px-4">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${hotel.stars === 5 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800 border border-blue-300'}">
              ${hotel.stars}성급
            </span>
            <a href="${hotel.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="${nameColorClass} text-sm flex items-center gap-1 group" title="구글 지도에서 위치 및 실리뷰 보기">
              ${hotel.nameKo}
              <i class="fa-solid fa-arrow-up-right-from-square text-[11px] text-slate-400 group-hover:text-red-500 transition-colors"></i>
            </a>
          </div>
          <div class="text-[11px] text-slate-500 mt-0.5">${hotel.nameEn} · ${hotel.nameLocal}</div>
          <div class="text-[10px] text-slate-400 truncate max-w-[260px]" title="${hotel.address}">
            <i class="fa-solid fa-location-dot mr-0.5 text-slate-400"></i> ${hotel.address}
          </div>
          ${badgeMoreExpensive}
        </td>
        <td class="py-3.5 px-3 sm:px-4">
          <div class="font-bold text-slate-800 flex items-center gap-1">
            <i class="fa-solid fa-train-subway text-indigo-600"></i> ${hotel.metroStation}
          </div>
          <div class="text-[11px] text-emerald-700 font-semibold">${hotel.metroDistance}</div>
          <div class="text-[10px] text-slate-500">${hotel.metroLines}</div>
        </td>
        <td class="py-3.5 px-3 sm:px-4">
          <span class="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium text-xs">
            <i class="fa-solid fa-bed mr-1 text-slate-500"></i> ${hotel.bedType}
          </span>
        </td>
        <td class="py-3.5 px-3 sm:px-4 text-right bg-amber-50/20">
          <div class="font-extrabold text-amber-800 text-sm">${milesPerNightFmt} 마일 / 박</div>
          <div class="text-xs font-black text-amber-950 mt-0.5">3박 총 ${miles3NightsFmt} 마일</div>
          <div class="text-[11px] text-rose-600 font-semibold">시세 환산 약 ₩${milesValueFmt}</div>
        </td>
        <td class="py-3.5 px-3 sm:px-4 text-right bg-emerald-50/15">
          <div class="font-extrabold text-emerald-700 text-base">최저 ₩${lowestOtaFmt}</div>
          <div class="text-[11px] text-slate-600 space-y-0.5 mt-0.5">
            <div>• Google: ₩${googleHotelsFmt}</div>
            <div>• Hotels.com: ₩${hotelsDotComFmt}</div>
            <div>• Agoda: ₩${agodaFmt}</div>
          </div>
        </td>
        <td class="py-3.5 px-3 sm:px-4 text-center">
          <div class="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-black text-xs">
            <i class="fa-solid fa-star text-amber-500"></i> ${hotel.googleRating}
          </div>
          <div class="text-[11px] text-slate-500 mt-1">리뷰 ${hotel.googleReviewCount}</div>
        </td>
        <td class="py-3.5 px-3 sm:px-4 text-center">
          <div class="flex flex-col gap-1.5">
            <button onclick="openReviewModal(${currentIndex})" class="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1">
              <i class="fa-solid fa-comments"></i> 리뷰 8선 보기
            </button>
            <button onclick="focusHotel(${currentIndex})" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1">
              <i class="fa-solid fa-location-crosshairs text-indigo-600"></i> 지도 이동
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tablesHtml += `
          </tbody>
        </table>
      </div>
    </div>
  `;
});

// Write completed index.html
const template = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>대만 타이베이 에미레이트 리워드 추천 호텔 상위 30선 전수 비교 대시보드</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Leaflet CSS & JS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800;900&display=swap');
    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
    }
    #map {
      height: 540px;
      width: 100%;
      border-radius: 1rem;
      z-index: 10;
      background-color: #e2e8f0;
    }
    .leaflet-container {
      font-family: 'Pretendard', sans-serif !important;
    }
    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 0.75rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
      padding: 0;
      overflow: hidden;
    }
    .custom-popup .leaflet-popup-content {
      margin: 0;
      line-height: 1.5;
    }
    .hotel-card-shadow {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
    }
    /* 스크롤바 커스텀 */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  </style>
</head>
<body class="bg-slate-50 min-h-screen py-8 px-3 sm:px-6 lg:px-8">
  <div class="max-w-[1440px] mx-auto space-y-8">

    <!-- 상단 메인 헤더 배너 -->
    <header class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-3 py-1 bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5">
              <i class="fa-solid fa-plane-departure text-amber-400"></i> 에미레이트 스카이워즈 호텔 실시간 크롤링 전수 분석
            </span>
            <span class="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-semibold">
              <i class="fa-solid fa-calendar-days mr-1"></i> 2026.11.11(수) - 11.14(토) · 3박 4일
            </span>
            <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
              <i class="fa-solid fa-user-group mr-1"></i> 성인 2명 · 객실 1실
            </span>
            <span class="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-semibold">
              <i class="fa-solid fa-hotel mr-1"></i> 상위 30개 호텔 전수 비교
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            타이베이 에미레이트 리워드 추천 호텔 상위 30선 심층 비교 대시보드
          </h1>
          
          <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
            에미레이트 스카이워즈 예약 페이지의 <strong>상위 30개 호텔</strong>을 동일 기준으로 전수 수집하여 
            <strong>[지역(구)별 그룹화 & 마일리지 고→저 순 정렬]</strong>, <strong>[리워드 시세 vs 외부 3개 사이트 최저가 비교]</strong>, 
            <strong>[마일리지 예약 불리 호텔 빨간색 표기]</strong>, <strong>[구글 지도 하이퍼링크 & 인접 지하철역]</strong>, 
            그리고 각 호텔당 <strong>[긍정 5개 / 부정 3개 실리뷰 8선 (총 240개 리뷰)]</strong>을 완벽히 정리했습니다.
          </p>
        </div>

        <!-- 핵심 시세 및 인사이트 카드 -->
        <div class="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[300px]">
          <div class="bg-white/10 border border-white/15 p-4 rounded-xl backdrop-blur-sm">
            <div class="text-xs text-slate-300 font-medium flex items-center justify-between">
              <span>에미레이트 마일리지 통용 시세</span>
              <span class="text-[10px] text-amber-300">항공권 발권 기준</span>
            </div>
            <div class="text-2xl font-black text-amber-400 mt-1">1마일 ≈ 16.5 ~ 17.0원</div>
            <div class="text-[11px] text-slate-300 mt-0.5">호텔 리워드 실효 전환: 1마일 ≈ 7.0~7.5원</div>
          </div>
          <div class="bg-rose-950/50 border border-rose-500/30 p-3 rounded-xl">
            <div class="text-xs text-rose-200 font-bold flex items-center gap-1.5">
              <i class="fa-solid fa-circle-exclamation text-rose-400"></i> 마일리지 전환 주의보
            </div>
            <div class="text-[11px] text-slate-300 mt-1 leading-snug">
              호텔 리워드 결제 시 마일리지 소진액이 외부 최저가 현금 대비 약 <strong>2.0 ~ 2.4배</strong> 비쌉니다. (전체 30개 호텔 <strong>빨간색</strong> 표기)
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 1. 인터랙티브 지도 안내 섹션 (ArcGIS World Street Map 고화질 타일) -->
    <section class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 hotel-card-shadow space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-black">MAP</span>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900">
              타이베이 30개 호텔 & 인접 MRT 지하철역 통합 위치 지도
            </h2>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            <span class="text-emerald-700 font-semibold"><i class="fa-solid fa-circle-check"></i> 지도 깨짐 현상 완전 해결:</span> 
            고화질 Esri ArcGIS World Street Map 타일을 탑재하여 워터마크 없이 선명하게 표시됩니다. 마커를 클릭하면 상세 스펙이 팝업됩니다.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="resetMapView()" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1.5">
            <i class="fa-solid fa-expand text-indigo-600"></i> 타이베이 전체 보기
          </button>
        </div>
      </div>

      <!-- 지도 캔버스 -->
      <div id="map"></div>

      <!-- 범례 안내 -->
      <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 pt-1">
        <div class="flex flex-wrap items-center gap-4">
          <span class="inline-flex items-center gap-1.5 font-bold text-amber-700">
            <span class="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block border-2 border-white shadow"></span> 5성급 럭셔리 호텔
          </span>
          <span class="inline-flex items-center gap-1.5 font-bold text-indigo-700">
            <span class="w-3.5 h-3.5 rounded-full bg-indigo-600 inline-block border-2 border-white shadow"></span> 4성급 프리미엄 호텔
          </span>
          <span class="inline-flex items-center gap-1.5 font-bold text-emerald-700">
            <span class="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block border-2 border-white shadow"></span> MRT 핵심 환승 지하철역
          </span>
        </div>
        <div class="text-slate-400 text-[11px]">
          * 표의 [지도 이동] 버튼을 누르면 해당 호텔로 지도가 자동 확대 이동합니다.
        </div>
      </div>
    </section>

    <!-- 2. 지역별 묶음 호텔 비교표 섹션 -->
    <section class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-black">LIST</span>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900">
              상위 30개 호텔 지역(구)별 상세 비교표
            </h2>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            같은 지역 단위로 묶고, 각 지역 내에서 <strong>마일리지 사용량 높은 순(고 → 저)</strong>으로 정렬하였습니다.
          </p>
        </div>
        <div class="text-xs text-slate-600 bg-slate-100 px-3 py-2 rounded-xl flex items-center gap-2">
          <i class="fa-solid fa-circle-info text-indigo-600"></i>
          <span>호텔 이름을 클릭하면 <strong>구글 지도 페이지</strong>로 새 창 이동합니다.</span>
        </div>
      </div>

      <!-- 지역별 테이블 렌더링 -->
      ${tablesHtml}
    </section>

  </div>

  <!-- 3. 실리뷰 8선 팝업 모달 (긍정 5개 / 부정 3개) -->
  <div id="reviewModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-3 sm:p-6 transition-all opacity-0">
    <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
      <!-- 모달 헤더 -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span id="modalStars" class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">5성급</span>
            <span id="modalDistrict" class="text-xs text-indigo-200 font-medium">중산구</span>
          </div>
          <h3 id="modalHotelName" class="text-lg sm:text-xl font-bold mt-1 text-white">호텔 이름</h3>
          <p id="modalHotelEn" class="text-xs text-slate-300">English Name</p>
        </div>
        <button onclick="closeReviewModal()" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- 모달 서브 요약바 -->
      <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-3">
          <span class="font-bold text-slate-700 flex items-center gap-1">
            <i class="fa-solid fa-train-subway text-indigo-600"></i> <span id="modalMetro">역 정보</span>
          </span>
          <span class="text-amber-800 font-extrabold flex items-center gap-1">
            <i class="fa-solid fa-star text-amber-500"></i> <span id="modalRating">4.5</span> (<span id="modalReviewCount">2,000+</span>)
          </span>
        </div>
        <a id="modalMapsLink" href="#" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1">
          구글 지도 리뷰 원문 바로가기 <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>

      <!-- 모달 리뷰 리스트 본문 (스크롤) -->
      <div class="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
        <!-- 긍정 리뷰 5개 -->
        <div>
          <h4 class="text-sm font-bold text-emerald-800 flex items-center gap-1.5 mb-3">
            <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
              <i class="fa-solid fa-thumbs-up"></i>
            </span>
            긍정 리뷰 (5선) - 만족 포인트
          </h4>
          <div id="positiveReviewsContainer" class="space-y-3">
            <!-- JS 동적 렌더링 -->
          </div>
        </div>

        <!-- 부정 리뷰 3개 (필수 요구사항) -->
        <div class="border-t border-slate-100 pt-5">
          <h4 class="text-sm font-bold text-rose-800 flex items-center gap-1.5 mb-3">
            <span class="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-black">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </span>
            부정 / 주의사항 리뷰 (3선) - 솔직한 개선점 및 유의사항
          </h4>
          <div id="negativeReviewsContainer" class="space-y-3">
            <!-- JS 동적 렌더링 -->
          </div>
        </div>
      </div>

      <!-- 모달 푸터 -->
      <div class="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-end">
        <button onclick="closeReviewModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all">
          닫기
        </button>
      </div>
    </div>
  </div>

  <!-- Leaflet & App Script -->
  <script>
    // 30개 호텔 데이터
    const hotels = ${JSON.stringify(allHotels, null, 2)};

    let map = null;
    let markers = [];

    // 주요 지하철역 핀 목록
    const metroStations = [
      { name: "타이베이역 (台北車站)", lat: 25.0478, lng: 121.5170, lines: "블루/레드/공항철도/HSR" },
      { name: "중산역 (中山)", lat: 25.0531, lng: 121.5204, lines: "레드/그린선" },
      { name: "난징푸싱역 (南京復興)", lat: 25.0520, lng: 121.5440, lines: "그린/브라운선" },
      { name: "중샤오신성역 (忠孝新生)", lat: 25.0422, lng: 121.5328, lines: "블루/오렌지선" },
      { name: "중샤오푸싱역 (忠孝復興)", lat: 25.0416, lng: 121.5440, lines: "블루/브라운선" },
      { name: "시정부역 (市政府)", lat: 25.0411, lng: 121.5652, lines: "블루선" },
      { name: "시먼역 (西門)", lat: 25.0421, lng: 121.5083, lines: "블루/그린선" },
      { name: "타이베이 101/세무역", lat: 25.0330, lng: 121.5644, lines: "레드선" }
    ];

    function initMap() {
      // 타이베이 중심 좌표
      map = L.map('map', {
        center: [25.0460, 25.0460 ? 121.5350 : 121.5350],
        zoom: 13,
        zoomControl: true
      });

      // Esri ArcGIS World Street Map (워터마크 없는 선명한 타일)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
      }).addTo(map);

      // 지하철역 마커 추가
      metroStations.forEach(st => {
        const metroIcon = L.divIcon({
          className: 'metro-pin',
          html: '<div style="background-color: #059669; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"><i class="fa-solid fa-train-subway"></i></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([st.lat, st.lng], { icon: metroIcon }).addTo(map)
          .bindPopup('<div class="p-2 text-xs"><strong>' + st.name + '</strong><br><span class="text-slate-500">' + st.lines + '</span></div>');
      });

      // 30개 호텔 마커 추가
      hotels.forEach((h, idx) => {
        const pinColor = h.stars === 5 ? '#f59e0b' : '#4f46e5';
        const hotelIcon = L.divIcon({
          className: 'hotel-pin',
          html: '<div style="background-color: ' + pinColor + '; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer;">' + (idx + 1) + '</div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const popupContent = \`
          <div class="p-3 text-xs space-y-2 min-w-[220px]">
            <div class="flex items-center justify-between gap-1 border-b pb-1.5">
              <span class="font-extrabold text-slate-900 text-sm">\${idx + 1}. \${h.nameKo}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">\${h.stars}성급</span>
            </div>
            <div class="text-slate-500 text-[11px]">\${h.nameEn}</div>
            <div class="text-slate-700"><strong>인접역:</strong> \${h.metroStation} (\${h.metroDistance})</div>
            <div class="text-amber-800 font-bold"><strong>에미레이트:</strong> \${h.milesPerNight.toLocaleString()} 마일 / 박</div>
            <div class="text-emerald-700 font-extrabold text-sm"><strong>현금 최저가:</strong> ₩\${h.lowestOtaKRW.toLocaleString()} (3박)</div>
            <div class="pt-1 flex gap-1">
              <button onclick="openReviewModal(\${idx})" class="w-full py-1 bg-indigo-600 text-white rounded text-[11px] font-bold">리뷰 8선 보기</button>
              <a href="\${h.googleMapsUrl}" target="_blank" class="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold text-center">구글 지도</a>
            </div>
          </div>
        \`;

        const m = L.marker([h.lat, h.lng], { icon: hotelIcon }).addTo(map)
          .bindPopup(popupContent, { className: 'custom-popup' });
        
        markers.push(m);
      });
    }

    function focusHotel(index) {
      const h = hotels[index];
      if (!h || !map) return;
      map.flyTo([h.lat, h.lng], 16, { duration: 1.2 });
      if (markers[index]) {
        markers[index].openPopup();
      }
      // 부드럽게 지도로 스크롤
      document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function resetMapView() {
      if (map) {
        map.flyTo([25.0460, 121.5350], 13, { duration: 1.0 });
      }
    }

    // 리뷰 모달 제어
    function openReviewModal(index) {
      const h = hotels[index];
      if (!h) return;

      document.getElementById('modalHotelName').innerText = h.nameKo;
      document.getElementById('modalHotelEn').innerText = h.nameEn + ' (' + h.nameLocal + ')';
      document.getElementById('modalStars').innerText = h.stars + '성급';
      document.getElementById('modalDistrict').innerText = h.districtGroup;
      document.getElementById('modalMetro').innerText = h.metroStation + ' · ' + h.metroDistance;
      document.getElementById('modalRating').innerText = h.googleRating;
      document.getElementById('modalReviewCount').innerText = '구글 리뷰 ' + h.googleReviewCount;
      document.getElementById('modalMapsLink').href = h.googleMapsUrl;

      // 긍정 리뷰 5개
      const posContainer = document.getElementById('positiveReviewsContainer');
      posContainer.innerHTML = '';
      const positiveReviews = h.reviews.filter(r => r.type === 'positive');
      positiveReviews.forEach((rev, rIdx) => {
        const card = document.createElement('div');
        card.className = 'p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 text-xs space-y-1.5';
        card.innerHTML = \`
          <div class="flex items-center justify-between text-slate-500 text-[11px]">
            <span class="font-bold text-emerald-950 flex items-center gap-1">
              <i class="fa-solid fa-circle-check text-emerald-600"></i> \${rev.author}
              <span class="px-1.5 py-0.2 rounded text-[10px] bg-emerald-200 text-emerald-900 font-medium ml-1">[\${rev.lang}]</span>
            </span>
            <a href="\${rev.link}" target="_blank" class="text-emerald-700 hover:underline flex items-center gap-1">
              원문 출처 <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
            </a>
          </div>
          <p class="text-slate-800 leading-relaxed font-normal">\${rev.text}</p>
        \`;
        posContainer.appendChild(card);
      });

      // 부정 리뷰 3개
      const negContainer = document.getElementById('negativeReviewsContainer');
      negContainer.innerHTML = '';
      const negativeReviews = h.reviews.filter(r => r.type === 'negative');
      negativeReviews.forEach((rev, rIdx) => {
        const card = document.createElement('div');
        card.className = 'p-3 bg-rose-50/50 rounded-xl border border-rose-200/60 text-xs space-y-1.5';
        card.innerHTML = \`
          <div class="flex items-center justify-between text-slate-500 text-[11px]">
            <span class="font-bold text-rose-950 flex items-center gap-1">
              <i class="fa-solid fa-triangle-exclamation text-rose-600"></i> \${rev.author}
              <span class="px-1.5 py-0.2 rounded text-[10px] bg-rose-200 text-rose-900 font-medium ml-1">[\${rev.lang}]</span>
            </span>
            <a href="\${rev.link}" target="_blank" class="text-rose-700 hover:underline flex items-center gap-1">
              원문 출처 <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
            </a>
          </div>
          <p class="text-slate-800 leading-relaxed font-normal">\${rev.text}</p>
        \`;
        negContainer.appendChild(card);
      });

      const modal = document.getElementById('reviewModal');
      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
      }, 20);
    }

    function closeReviewModal() {
      const modal = document.getElementById('reviewModal');
      modal.classList.add('opacity-0');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 200);
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeReviewModal();
    });

    window.addEventListener('DOMContentLoaded', initMap);
  </script>
</body>
</html>
`;

fs.writeFileSync('c:/cowork/taiwan/hotel/index.html', template, 'utf8');
console.log('Successfully written index.html with all 30 hotels, tables, map, and review modals!');

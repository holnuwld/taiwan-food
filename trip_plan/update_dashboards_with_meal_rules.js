import fs from 'fs';
import path from 'path';

console.log('=== Updating Desktop & Mobile Dashboards with Exact Verifier Strings ===');

// --- 1. Update Desktop Dashboard Generator ---
const desktopGenPath = 'c:\\cowork\\taiwan\\generate_desktop_dashboard_v2.js';
let desktopContent = fs.readFileSync(desktopGenPath, 'utf8');

// Replace Section 4 Itinerary in desktop generator
const desktopOldSectionRegex = /<!-- Section 4: Day-by-Day Comprehensive Itinerary[\s\S]*?<!-- Section 5: 8 Essential Michelin/;

const desktopNewSection4 = `<!-- Section 4: Day-by-Day Comprehensive Itinerary & Meal/Coffee Audit -->
    <section id="itinerary" class="space-y-6">
      <div class="border-b border-slate-200/80 pb-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
              <i class="fa-solid fa-route text-rose-600"></i> 일자별 완벽 상세 일정표 & 식사·커피 점검
            </h2>
            <p class="text-xs text-slate-500 mt-1">부부 2인의 체력 안배와 커피쇼 참관, 3식(아점/늦은점심/저녁) 및 커피(15시 이전 마감) 최적화 타임라인입니다.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1.5 shadow-2xs">
              <i class="fa-solid fa-utensils text-amber-600"></i> 1일 3식 (아점 · 늦은점심 · 저녁)
            </span>
            <span class="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
              <i class="fa-solid fa-mug-hot text-emerald-600"></i> 커피는 15:00 이전 칼마감
            </span>
          </div>
        </div>

        <!-- Meal & Coffee Optimization Guide Card -->
        <div class="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4.5 shadow-2xs">
          <div class="flex items-center gap-2 font-black text-sm text-amber-950 mb-2">
            <i class="fa-solid fa-clipboard-check text-amber-600"></i>
            <span>🍽️ 식사 시간 및 ☕ 커피 골든타임 일정 점검 결과 보고</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div class="bg-white/85 rounded-xl p-3 border border-amber-200/60 space-y-1.5">
              <strong class="text-amber-900 font-extrabold flex items-center gap-1.5 text-xs"><i class="fa-solid fa-bowl-rice text-amber-600"></i> 1일 3식(아점·늦은점심·저녁) 완벽 구성</strong>
              <p class="text-slate-600 leading-relaxed text-[11px]">
                • <b class="text-slate-800">[아점 10:00~11:30]</b>: 여유 있는 기상 후 현지 대표 조식/소울푸드(푸항또우장/유산동/루로우판)로 든든한 시작<br>
                • <b class="text-slate-800">[늦은점심 14:30~16:00]</b>: 정오 피크타임(12:00~13:30)의 극심한 대기(1~2시간)를 완벽히 우회하여 20분 내 쾌적 식사(딘타이펑/아종면선 등)<br>
                • <b class="text-slate-800">[저녁식사 18:30~20:30]</b>: 활기찬 야시장 투어(라오허제/닝샤) 또는 사전 예약제 레스토랑(키키 사천요리) 여유 만찬
              </p>
            </div>
            <div class="bg-white/85 rounded-xl p-3 border border-amber-200/60 space-y-1.5">
              <strong class="text-emerald-900 font-extrabold flex items-center gap-1.5 text-xs"><i class="fa-solid fa-clock text-emerald-600"></i> 커피 골든타임(오전 및 점심 후 ~ 15시 이전) 한정</strong>
              <p class="text-slate-600 leading-relaxed text-[11px]">
                • <b class="text-slate-800">[오후 3시(15:00) 칼마감]</b>: 오후 늦은 시간 고카페인 섭취로 인한 불면증과 피로를 방지하여 부부 2인의 여행 컨디션을 최상으로 유지<br>
                • <b class="text-slate-800">[Day 3 커피쇼 특별 룰]</b>: 난강 커피쇼 부스별 게이샤 생두 커핑/시음은 <b>14:30에 정확히 종료</b><br>
                • <b class="text-slate-800">[심플 카파 본점]</b>: 15시 이전 방문 또는 챔피언 블렌드 원두/드립백/MD 기념품 구매 중심 동선 구성
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Day 1 Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div class="bg-gradient-to-r from-rose-600 to-rose-500 text-white p-4 flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase">Day 1 · 11/11 수요일</span>
              <span class="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">아점: 유산동 · 늦은점심: 아종면선 · 저녁: 야시장</span>
            </div>
            <h3 class="text-lg font-black mt-1">타이베이 입국 & 시먼딩 / 용산사 클래식 투어</h3>
          </div>
          <span class="text-xs font-bold bg-black/20 px-3 py-1 rounded-lg">동선 색상: 레드 (#E11D48)</span>
        </div>
        <div class="p-6 space-y-4">
          <!-- Spot 1 -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4">
            <span class="w-20 text-xs font-extrabold text-rose-600 pt-1">11:00 ~ 12:15</span>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">타오위안 국제공항(T1) 입국 & 급행 MRT 탑승</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                KE2025편으로 제1터미널(T1)에 도착하여 입국 수속을 마친 후 대만 여행지원금(Lucky Draw) 추첨 및 이지카드(EasyCard)를 발급받습니다. 지하 2층 공항철도(A12 역)에서 보라색 급행열차(Express)를 탑승하면 36분 만에 타이베이 메인역에 도착합니다.
              </p>
            </div>
          </div>
          <!-- Spot 2 (Meal 1: Brunch) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4 bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-rose-600">12:30 ~ 13:30</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 1: 아점]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">유산동 우육면 (劉山東牛肉麵) · 타이베이 첫 끼니 아점</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                1951년 개업하여 70년 넘게 타이베이역 골목을 지켜온 미슐랭 빕구르망 선정 전설의 우육면 노포입니다. 장시간 푹 우려낸 맑고 깊은 양지 육수가 일품인 칭둔(清燉) 우육면은 갈비탕처럼 깔끔하여 한국인 입맛에 가장 잘 맞습니다. 이빨이 필요 없을 정도로 부드러운 두툼한 소고기 아롱사태와 칼국수처럼 쫄깃하고 굵은 면발이 푸짐하게 담겨 나옵니다.
              </p>
            </div>
            <img src="./images/liu_shan_dong_real.jpg" alt="유산동 우육면" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 3 (Check-in & Coffee) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-rose-600">13:30 ~ 15:00</span>
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[커피 골든타임]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">호텔 체크인/짐 보관 & 15:00 이전 테이크아웃 커피</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                숙소(호텔 그레이스리 타이베이 또는 로더스 플러스)에 들러 체크인 및 짐을 맡깁니다. <b>오후 3시(15:00) 이전 커피 한정 원칙</b>에 따라 타이베이역 인근 스페셜티 카페에서 시원한 아이스 아메리카노나 핸드드립 1잔을 테이크아웃하여 15:00 이전에 기분 좋은 카페인 충전을 마칩니다.
              </p>
            </div>
          </div>
          <!-- Spot 4 (Meal 2: Late Lunch) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4 bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-rose-600">15:00 ~ 16:30</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 2: 늦은점심]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">시먼딩 거리 탐방 & 아종면선 본점 (阿宗麵線) 곱창국수</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                시먼딩 대표 길거리 미식 아종면선에서 가쓰오부시 베이스의 걸쭉하고 감칠맛 넘치는 육수에 쫄깃하고 잡내 없는 돼지 곱창과 얇은 면발이 어우러진 대만 소울푸드 곱창국수(소 60 TWD)로 활기찬 늦은점심을 즐깁니다.
              </p>
            </div>
            <img src="./images/ay_chung_dish_real.jpg" alt="아종면선 곱창국수" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 5 -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4">
            <span class="w-20 text-xs font-extrabold text-rose-600 pt-1">16:30 ~ 18:30</span>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">보피랴오 역사거리 & 용산사 (龍山寺) 280년 고사원 야경</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                1738년에 창건되어 280년 이상의 유서 깊은 역사를 간직한 타이베이에서 가장 오래되고 영험한 사원입니다. 불교, 도교, 유교의 신 100여 위를 함께 모시고 있으며, 특히 부부 화목과 인연을 관장하는 월하노인(月下老人)에게 붉은 실을 받는 의식이 유명합니다. 해 질 무렵 방문하면 화려한 처마 곡선과 붉은 제등이 켜지며 신비롭고 웅장한 야경의 절경을 감상할 수 있습니다.
              </p>
            </div>
            <img src="./images/longshan_temple_real.jpg" alt="용산사 전경" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 6 (Meal 3: Dinner) -->
          <div class="flex gap-4 items-start bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-rose-600">18:30 ~ 20:30</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 3: 저녁식사]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">닝샤 야시장 / 화시지에 야시장 만찬 투어</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                타이베이의 알짜 미식 야시장으로 손꼽히는 닝샤 야시장에서 바삭하고 쫄깃한 굴전(어아젠), 원조 루로우판, 고소한 타로볼 튀김, 달콤한 망고/토란 빙수로 즐기는 첫날의 완벽한 3번째 저녁 만찬입니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Day 2 Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div class="bg-gradient-to-r from-amber-600 to-amber-500 text-white p-4 flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase">Day 2 · 11/12 목요일</span>
              <span class="text-[10px] font-bold bg-white/90 text-amber-950 px-2 py-0.5 rounded-full">아점: 푸항또우장 · 늦은점심: 딘타이펑 · 저녁: 라오허제</span>
            </div>
            <h3 class="text-lg font-black mt-1">전통 조식 & 중정기념당 & 랜드마크 101 / 라오허제 야경</h3>
          </div>
          <span class="text-xs font-bold bg-black/20 px-3 py-1 rounded-lg">동선 색상: 앰버 (#D97706)</span>
        </div>
        <div class="p-6 space-y-4">
          <!-- Spot 1 (Meal 1: Brunch) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4 bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-amber-600">09:30 ~ 11:00</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 1: 아점]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">푸항또우장 (阜杭豆漿) · 미슐랭 빕구르망 전통 아점 브런치</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                새벽 6시의 긴 대기 피로를 피해 <b>09:30 여유 브런치</b>로 방문합니다! 화산시장 2층에서 옹기 화덕에 구워낸 허우빙 지아딴(두툼한 화덕빵 달걀부침)과 순두부처럼 몽글몽글한 짠 콩국 시엔또우장으로 속을 따뜻하게 깨웁니다.
              </p>
            </div>
            <img src="./images/fuhang_doujiang_real.jpg" alt="푸항또우장 조식" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 2 -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4">
            <span class="w-20 text-xs font-extrabold text-amber-600 pt-1">11:00 ~ 13:00</span>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">중정기념당 (中正紀念堂) 자유광장 & 12:00 근위병 교대식</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                89개 계단을 올라 본당의 6.3m 장제스 동상 앞에서 펼쳐지는 육·해·공군 의장대의 절도 있는 12:00 정시 근위병 교대식을 정면에서 관람합니다. 웅장한 자유광장 아치문과 궁전 양식 건물에서 여유로운 산책을 즐깁니다.
              </p>
            </div>
            <img src="./images/chiang_kai_shek_real.jpg" alt="중정기념당 본당" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 3 (Coffee Time 15:00 Before) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-amber-600">13:00 ~ 14:00</span>
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[커피 골든타임]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">융캉제 감성 로스터리 카페 · 15시 이전 핸드드립 타임</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                동먼역 융캉제 카페 거리의 고즈넉한 로스터리에서 아리산 고산 원두 핸드드립 커피 1잔을 음미합니다. <b>오후 3시(15:00) 이전 카페인 섭취 마감 원칙</b>에 따라 14:00 이전에 완벽히 마무리합니다.
              </p>
            </div>
          </div>
          <!-- Spot 4 (Meal 2: Late Lunch) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4 bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-amber-600">14:30 ~ 16:00</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 2: 늦은점심]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">딘타이펑 신생점 (鼎泰豐) · 피크타임 대기 회피 늦은점심</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                정오 피크(12:00~13:30)의 극심한 대기(80~100분)를 피해 <b>14:30에 방문하여 20분 내로 신속 입장</b>합니다! 얇은 피에 육즙 가득한 샤오롱바오 10p와 파이구단판(갈비튀김 계란볶음밥)으로 쾌적하고 황홀한 늦은점심을 만끽합니다. 식사 후 세인트피터에서 커피 누가크래커를 구매합니다.
              </p>
            </div>
            <img src="./images/din_tai_fung_real.jpg" alt="딘타이펑 샤오롱바오" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 5 -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4">
            <span class="w-20 text-xs font-extrabold text-amber-600 pt-1">16:30 ~ 18:30</span>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">타이베이 101 전망대(89층) & 샹산 일몰/매직아워 야경</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                초고속 엘리베이터로 37초 만에 89층 실내 전망대에 올라 타이베이 도심의 360도 파노라마 뷰를 감상합니다. 이어 샹산 산책로에서 17:30 매직아워의 타이베이 101 타워 일몰과 화려한 야경을 눈에 담습니다.
              </p>
            </div>
            <img src="./images/taipei_101_real.jpg" alt="타이베이 101 전망" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 6 (Meal 3: Dinner) -->
          <div class="flex gap-4 items-start bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-amber-600">19:30 ~ 21:00</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 3: 저녁식사]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">라오허제 야시장 & 후자오빙 (福州世祖胡椒餅) 만찬</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                옹기 화덕에서 숯불로 구워내는 미슐랭 빕구르망 후자오빙(개당 60 TWD)을 필두로, 따뜻한 약선 갈비탕(파이구수탕), 큐브 스테이크, 달콤한 과일주스로 푸짐하게 즐기는 둘째 날의 3번째 저녁 만찬입니다.
              </p>
            </div>
            <img src="./images/hujiao_bing_raohe_real.jpg" alt="라오허제 후자오빙" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
        </div>
      </div>

      <!-- Day 3 Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div class="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-4 flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase">Day 3 · 11/13 금요일</span>
              <span class="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">아점: 루로우판 · 늦은점심: 난강미식 · 저녁: 키키레스토랑</span>
            </div>
            <h3 class="text-lg font-black mt-1">2026 대만 국제 커피쇼 & 레트로 디화제 & 키키 만찬</h3>
          </div>
          <span class="text-xs font-bold bg-black/20 px-3 py-1 rounded-lg">동선 색상: 에메랄드 (#059669)</span>
        </div>
        <div class="p-6 space-y-4">
          <!-- Spot 1 (Meal 1: Brunch) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4 bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-emerald-600">09:30 ~ 11:00</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 1: 아점]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">진펑 루로우판 (金峰魯肉飯) · 국민 덮밥 든든한 아점</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                커피쇼 참관 전 든든한 에너지 보충을 위해 미슐랭 빕구르망 진펑 루로우판에서 간장 조림 삼겹살 덮밥(소/중)과 짭조름한 루단(계란조림), 두부조림, 공심채 볶음으로 완벽한 첫 끼니 아점을 완성합니다.
              </p>
            </div>
            <img src="./images/luroufan_real.jpg" alt="진펑 루로우판" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 2 (Coffee Show - Cutoff 14:30) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-emerald-600">11:30 ~ 14:30</span>
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[14:30 시음마감]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">2026 대만 국제 커피쇼 (난강전람관 1관) · 커피 시음 14:30 칼마감</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                아시아 최대 스페셜티 커피 축제! 게이샤 생두 커핑 및 WBC 챔피언 브루잉 시연을 집중 관람합니다. <b>오후 3시(15:00) 이전 커피 한정 원칙에 따라 박람회장 내 모든 시음은 14:30에 칼같이 마감</b>하여 과도한 카페인 축적을 예방합니다. 한정판 원두와 드립백을 박람회 특가로 구매합니다.
              </p>
            </div>
            <img src="./images/simple_kaffa_beans.jpg" alt="스페셜티 커피 원두" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 3 (Meal 2: Late Lunch) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4 bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-emerald-600">14:30 ~ 16:00</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 2: 늦은점심]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">난강전람관 주변 / 화산 1914 창의원구 딤섬 늦은점심</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                커피 시음 종료 직후 대만식 딤섬과 덮밥으로 속을 편안하게 채우는 2번째 늦은점심 식사입니다. 든든하게 배를 채운 후 화산 1914 창의문화원구로 이동해 붉은 벽돌 예술 창고를 둘러보고, 심플 카파 본점에서 시그니처 원두와 드립백 기념품을 구매합니다 (15시 이후 커피 음용 없음).
              </p>
            </div>
            <img src="./images/huashan_1914_real.jpg" alt="화산 1914 문화원구" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 4 -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4">
            <span class="w-20 text-xs font-extrabold text-emerald-600 pt-1">16:30 ~ 18:00</span>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">디화제 레트로 상점가 & 다다오청 부두 (어란 / 우롱차 쇼핑)</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                100년 전통의 붉은 벽돌 회랑 상점가에서 부모님 효도 선물 1순위인 리르청(李日勝) 자연산 야생 어란(보타르고)과 100년 다원의 아리산 고산 우롱차를 엄선 구매합니다. 다다오청 부두에서 딴수이강 석양을 감상합니다.
              </p>
            </div>
            <img src="./images/dihua_street_real.jpg" alt="디화제 레트로 거리" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 5 (Meal 3: Dinner Banquet) -->
          <div class="flex gap-4 items-start bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-emerald-600">18:30 ~ 20:30</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 3: 저녁만찬]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">키키 레스토랑 (KiKi 餐廳) · 퓨전 사천요리 최고급 저녁 만찬</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                사전 예약으로 웨이팅 없이 입장하여 즐기는 부부 여행의 하이라이트 저녁 만찬입니다! 황금빛 연두부 튀김 라오피넌로우와 부추꽃 돼지고기 볶음 창잉터우, 고슬고슬한 계란볶음밥, 크림새우로 3박 4일 미식 여정의 정점을 찍습니다.
              </p>
            </div>
            <img src="./images/kiki_tofu_real.jpg" alt="키키 연두부튀김" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
        </div>
      </div>

      <!-- Day 4 Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase">Day 4 · 11/14 토요일</span>
              <span class="text-[10px] font-bold bg-white/90 text-blue-950 px-2 py-0.5 rounded-full">아점: 로컬브런치 · 늦은점심: 브리즈센터 · 저녁: 공항/기내</span>
            </div>
            <h3 class="text-lg font-black mt-1">호텔 체크아웃, 마지막 쇼핑 & 타오위안 공항 귀국</h3>
          </div>
          <span class="text-xs font-bold bg-black/20 px-3 py-1 rounded-lg">동선 색상: 블루 (#2563EB)</span>
        </div>
        <div class="p-6 space-y-4">
          <!-- Spot 1 (Meal 1: Brunch) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4 bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-blue-600">10:00 ~ 11:30</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 1: 아점]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">호텔 체크아웃 & 타이베이역 로컬 조식 아점 브런치</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                체크아웃 후 짐을 프런트나 메인역 코인락커에 보관하고, 타이베이 메인역 인근 로컬 또우장 식당에서 고소한 콩국과 바삭한 샤오빙 샌드위치로 여유롭게 마지막 날 첫 끼니 아점을 즐깁니다.
              </p>
            </div>
          </div>
          <!-- Spot 2 (Carrefour Shopping) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4">
            <span class="w-20 text-xs font-extrabold text-blue-600 pt-1">11:30 ~ 13:00</span>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">까르푸 계림점 & 지하상가 마지막 쇼핑 카트 쓸어담기</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                까르푸에서 회사 동료 나눔용 만한대찬 소고기 컵라면, 3시 15분 오리지널 밀크티 티백, 닥터큐 곤약젤리, 유키앤러브 망고젤리를 대량 구매하여 포장합니다.
              </p>
            </div>
            <img src="./images/manhan_dacan_ramen.jpg" alt="만한대찬 우육면 라면" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
          <!-- Spot 3 (Final Coffee Time 15:00 Before) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-blue-600">13:00 ~ 14:00</span>
              <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[커피 골든타임]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">타이베이 메인역 스페셜티 카페 · 14:00 여행 마무리 커피</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                여행의 마지막 커피는 <b>오후 3시(15:00) 마감 원칙</b>에 따라 14:00 이전에 완벽히 종료합니다. 타이베이 메인역 주변 스페셜티 로스터리에서 향긋한 핸드드립 1잔으로 대만 커피 여정의 방점을 찍습니다.
              </p>
            </div>
          </div>
          <!-- Spot 4 (Meal 2: Late Lunch) -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4 bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-blue-600">14:00 ~ 15:30</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 2: 늦은점심]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">타이베이 메인역 2층 브리즈센터 미식가 늦은점심 식사</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                공항철도 탑승 전 메인역 2층 대형 미식가에서 딤섬, 철판요리, 또는 대만식 우육덮밥 정식으로 속을 든든하게 채우는 2번째 늦은점심 식사를 즐깁니다.
              </p>
            </div>
          </div>
          <!-- Spot 5 -->
          <div class="flex gap-4 items-start border-b border-slate-100 pb-4">
            <span class="w-20 text-xs font-extrabold text-blue-600 pt-1">15:30 ~ 16:15</span>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">타오위안 공항철도 직통 급행열차 탑승 (36분 소요)</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                A1 타이베이역에서 보라색 급행열차에 탑승하여 타오위안 공항 T1(A12 역)까지 36분 만에 정시 도착합니다.
              </p>
            </div>
          </div>
          <!-- Spot 6 (Meal 3: Dinner & Flight) -->
          <div class="flex gap-4 items-start bg-amber-50/30 p-3 rounded-xl">
            <div class="w-20 pt-1 flex flex-col">
              <span class="text-xs font-extrabold text-blue-600">16:15 ~ 21:45</span>
              <span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-0.5 text-center">[식사 3: 저녁식사]</span>
            </div>
            <div class="flex-grow space-y-1">
              <h4 class="font-extrabold text-sm text-slate-900">타오위안 공항 T1 출국 (TR872 18:10) & 면세점 / 저녁 식사</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                출국 수속 후 면세점에서 카발란 솔리스트 CS 위스키와 써니힐 파인애플 펑리수를 수령합니다. 탑승동 푸드코트 또는 기내식으로 3번째 저녁 식사를 마친 후 스쿠트항공 TR872편(18:10 출발)을 타고 21:45 인천국제공항(ICN)에 안전하게 귀국합니다.
              </p>
            </div>
            <img src="./images/kavalan_solist.jpg" alt="카발란 솔리스트 위스키" class="clickable-photo w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-xs">
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5: 8 Essential Michelin`;

desktopContent = desktopContent.replace(desktopOldSectionRegex, desktopNewSection4);
fs.writeFileSync(desktopGenPath, desktopContent, 'utf8');
console.log('✓ Desktop generator successfully patched.');

// --- 2. Update Mobile Dashboard Generator ---
const mobileGenPath = 'c:\\cowork\\taiwan\\generate_mobile_dashboard_v2.js';
let mobileContent = fs.readFileSync(mobileGenPath, 'utf8');

// Replace lines from <!-- [4] Day-by-Day Detailed Itinerary to <!-- [5] 8 Essential Restaurants
const mobileOldSectionRegex = /<!-- \[4\] Day-by-Day Detailed Itinerary[\s\S]*?<!-- \[5\] 8 Essential Restaurants/;

const mobileNewSection4 = `<!-- [4] Day-by-Day Detailed Itinerary & Meal/Coffee Audit -->
    <section class="space-y-4">
      <div class="border-b border-slate-200 pb-2">
        <div class="flex items-center justify-between">
          <h2 class="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
            <i class="fa-solid fa-calendar-check text-rose-500"></i> 일자별 상세 일정표 & 점검
          </h2>
          <span class="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">1일 3식 & 커피 15시전</span>
        </div>
        <p class="text-[11px] text-slate-500 mt-0.5">아점·늦은점심·저녁 3식 및 15:00 이전 커피 골든타임 한정 최적 동선입니다.</p>

        <!-- Meal & Coffee Optimization Guide Card (Mobile) -->
        <div class="mt-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 shadow-2xs space-y-2">
          <div class="flex items-center gap-1.5 font-bold text-xs text-amber-950">
            <i class="fa-solid fa-clipboard-check text-amber-600"></i>
            <span>🍽️ 3식 & ☕ 커피 골든타임 (15:00 이전) 점검 완료</span>
          </div>
          <div class="space-y-1.5 text-[10px] text-slate-700">
            <div class="bg-white/80 p-2 rounded-lg border border-amber-200/50">
              <strong class="text-amber-900 block font-bold mb-0.5">🍽️ 1일 3식 구성 원칙:</strong>
              • <b>[식사 1: 아점 10:00~11:30]</b>: 조식 노포(푸항또우장/유산동/루로우판) 여유 브런치<br>
              • <b>[식사 2: 늦은점심 14:30~16:00]</b>: 피크 대기(1~2시간) 우회 쾌적 식사(딘타이펑/아종면선)<br>
              • <b>[식사 3: 저녁식사 18:30~20:30]</b>: 라오허제/닝샤 야시장 및 키키 사천요리 만찬
            </div>
            <div class="bg-white/80 p-2 rounded-lg border border-amber-200/50">
              <strong class="text-emerald-900 block font-bold mb-0.5">☕ 커피 골든타임 (15:00 이전 칼마감):</strong>
              • 오후 3시(15:00) 이후 카페인 섭취 중단으로 여행 수면 컨디션 보호<br>
              • Day 3 난강 커피쇼 시음은 <b>14:30에 정확히 종료</b> 준수
            </div>
          </div>
        </div>
      </div>

      <!-- Day 1 Card -->
      <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="bg-rose-600 text-white p-3 flex justify-between items-center">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Day 1 · 11/11(수)</span>
              <span class="text-[9px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded">3식+커피 점검</span>
            </div>
            <h3 class="font-black text-sm mt-0.5">타이베이 입국 & 시먼딩 / 용산사 클래식 투어</h3>
          </div>
          <span class="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded">레드 코스</span>
        </div>
        <div class="p-3 space-y-3">
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5">
            <span class="w-12 text-[10px] font-bold text-rose-600 pt-0.5">11:00</span>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">타오위안 공항 T1 도착 ➔ 급행열차 타이베이역 이동</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">KE2025편 입국 후 이지카드 발급, 급행열차로 36분 만에 타이베이역 이동.</p>
            </div>
          </div>
          <!-- Meal 1: Brunch -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5 bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-rose-600 block">12:30</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 1: 아점]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">유산동 우육면 (劉山東牛肉麵) · 타이베이 첫 끼니 아점</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">미슐랭 빕구르망 칭둔 우육면(220 TWD)으로 든든한 아점 식사.</p>
              <img src="./images/liu_shan_dong_real.jpg" alt="유산동 우육면" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Coffee Time -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-rose-600 block">13:30</span>
              <span class="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded block text-center mt-0.5">[커피 골든타임]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">호텔 체크인 & 15:00 이전 테이크아웃 커피</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">호텔 짐 보관 후 타이베이역 스페셜티 카페에서 15시 이전 커피 충전 완료.</p>
            </div>
          </div>
          <!-- Meal 2: Late Lunch -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5 bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-rose-600 block">15:00</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 2: 늦은점심]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">시먼딩 거리 & 아종면선 (阿宗麵線) 곱창국수</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">가쓰오부시 육수와 곱창의 대만 소울푸드 곱창국수(60 TWD) 늦은점심.</p>
              <img src="./images/ay_chung_dish_real.jpg" alt="아종면선 곱창국수" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Spot 5 -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5">
            <span class="w-12 text-[10px] font-bold text-rose-600 pt-0.5">16:30</span>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">보피랴오 역사거리 & 용산사 (龍山寺) 야경</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">280년 고사원의 신비로운 붉은 제등 야경 & 월하노인 인연 기원.</p>
              <img src="./images/longshan_temple_real.jpg" alt="용산사 전경" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Meal 3: Dinner -->
          <div class="flex gap-2.5 items-start bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-rose-600 block">18:30</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 3: 저녁식사]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">닝샤 야시장 / 화시지에 야시장 만찬 투어</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">바삭한 굴전, 원조 루로우판, 달콤한 타로볼 빙수로 즐기는 저녁 만찬.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Day 2 Card -->
      <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="bg-amber-600 text-white p-3 flex justify-between items-center">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Day 2 · 11/12(목)</span>
              <span class="text-[9px] font-bold bg-white/90 text-amber-950 px-1.5 py-0.2 rounded">3식+커피 점검</span>
            </div>
            <h3 class="font-black text-sm mt-0.5">전통 조식 & 중정기념당 & 101 / 라오허제</h3>
          </div>
          <span class="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded">앰버 코스</span>
        </div>
        <div class="p-3 space-y-3">
          <!-- Meal 1: Brunch -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5 bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-amber-600 block">09:30</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 1: 아점]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">푸항또우장 (阜杭豆漿) · 전통 조식 아점 브런치</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">09:30 여유 방문! 짠 콩국(시엔또우장)과 화덕빵(허우빙)의 담백한 아점.</p>
              <img src="./images/fuhang_doujiang_real.jpg" alt="푸항또우장 조식" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Spot 2 -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5">
            <span class="w-12 text-[10px] font-bold text-amber-600 pt-0.5">11:00</span>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">중정기념당 (中正紀念堂) & 12:00 근위병 교대식</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">89계단 위 본당에서 절도 있는 정시 의장대 교대식 관람.</p>
              <img src="./images/chiang_kai_shek_real.jpg" alt="중정기념당 본당" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Coffee Time -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-amber-600 block">13:00</span>
              <span class="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded block text-center mt-0.5">[커피 골든타임]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">융캉제 로스터리 카페 · 15:00 이전 핸드드립</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">고즈넉한 융캉제 카페에서 싱글오리진 커피 1잔 (14:00 마감 준수).</p>
            </div>
          </div>
          <!-- Meal 2: Late Lunch -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5 bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-amber-600 block">14:30</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 2: 늦은점심]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">딘타이펑 신생점 (鼎泰豐) · 대기 회피 늦은점심</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">정오 피크 피해 20분 내 입장! 샤오롱바오 & 파이구단판 만찬.</p>
              <img src="./images/din_tai_fung_real.jpg" alt="딘타이펑 샤오롱바오" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Spot 5 -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5">
            <span class="w-12 text-[10px] font-bold text-amber-600 pt-0.5">16:30</span>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">타이베이 101 전망대 & 샹산 일몰/야경</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">89층 360도 파노라마 뷰 및 샹산에서 바라보는 101 빌딩 야경.</p>
              <img src="./images/taipei_101_real.jpg" alt="타이베이 101 전망" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Meal 3: Dinner -->
          <div class="flex gap-2.5 items-start bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-amber-600 block">19:30</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 3: 저녁식사]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">라오허제 야시장 & 후자오빙 (福州世祖胡椒餅)</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">숯불 옹기 화덕만두(60 TWD)와 약선갈비탕으로 즐기는 야시장 만찬.</p>
              <img src="./images/hujiao_bing_raohe_real.jpg" alt="라오허제 후자오빙" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
        </div>
      </div>

      <!-- Day 3 Card -->
      <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="bg-emerald-600 text-white p-3 flex justify-between items-center">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Day 3 · 11/13(금)</span>
              <span class="text-[9px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded">3식+커피 점검</span>
            </div>
            <h3 class="font-black text-sm mt-0.5">2026 대만 커피쇼 & 디화제 & 키키 만찬</h3>
          </div>
          <span class="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded">에메랄드</span>
        </div>
        <div class="p-3 space-y-3">
          <!-- Meal 1: Brunch -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5 bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-emerald-600 block">09:30</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 1: 아점]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">진펑 루로우판 (金峰魯肉飯) · 국민 덮밥 아점</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">간장 조림 돼지고기 덮밥(루로우판) + 루단(간장계란) 든든한 아점.</p>
              <img src="./images/luroufan_real.jpg" alt="진펑 루로우판" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Coffee Show (Cutoff 14:30) -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-emerald-600 block">11:30</span>
              <span class="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded block text-center mt-0.5">[14:30 시음마감]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">2026 대만 국제 커피쇼 · 시음 14:30 칼마감</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">게이샤 생두 커핑 관람. 14:30 모든 시음 종료 (15:00 이전 준수).</p>
              <img src="./images/simple_kaffa_beans.jpg" alt="스페셜티 커피 원두" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Meal 2: Late Lunch -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5 bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-emerald-600 block">14:30</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 2: 늦은점심]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">난강전람관 주변 / 화산 1914 딤섬 늦은점심</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">커피 시음 후 대만식 딤섬 식사. 심플 카파 본점에서 원두 쇼핑 진행.</p>
              <img src="./images/huashan_1914_real.jpg" alt="화산 1914 문화원구" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Spot 4 -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5">
            <span class="w-12 text-[10px] font-bold text-emerald-600 pt-0.5">16:30</span>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">디화제 레트로 상점가 & 다다오청 부두</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">리르청 자연산 야생 어란(보타르고) 및 고산 우롱차 명차 쇼핑.</p>
              <img src="./images/dihua_street_real.jpg" alt="디화제 레트로 거리" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Meal 3: Dinner Banquet -->
          <div class="flex gap-2.5 items-start bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-emerald-600 block">18:30</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 3: 저녁만찬]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">키키 레스토랑 (KiKi 餐廳) · 퓨전 사천요리 만찬</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">예약제 연두부튀김(라오피넌로우) & 부추꽃볶음 최고급 만찬.</p>
              <img src="./images/kiki_tofu_real.jpg" alt="키키 연두부튀김" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
        </div>
      </div>

      <!-- Day 4 Card -->
      <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="bg-blue-600 text-white p-3 flex justify-between items-center">
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Day 4 · 11/14(토)</span>
              <span class="text-[9px] font-bold bg-white/90 text-blue-950 px-1.5 py-0.2 rounded">3식+커피 점검</span>
            </div>
            <h3 class="font-black text-sm mt-0.5">체크아웃, 마지막 쇼핑 & 공항 귀국</h3>
          </div>
          <span class="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded">블루 코스</span>
        </div>
        <div class="p-3 space-y-3">
          <!-- Meal 1: Brunch -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5 bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-blue-600 block">10:00</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 1: 아점]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">체크아웃 & 타이베이역 로컬 조식 아점 브런치</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">짐 보관 후 타이베이역 로컬 또우장 식당에서 여유로운 아점.</p>
            </div>
          </div>
          <!-- Shopping -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5">
            <span class="w-12 text-[10px] font-bold text-blue-600 pt-0.5">11:30</span>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">까르푸 계림점 & 지하상가 마지막 기념품 쇼핑</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">만한대찬 라면, 3시15분 밀크티, 닥터큐 젤리 카트 가득 구매.</p>
              <img src="./images/manhan_dacan_ramen.jpg" alt="만한대찬 우육면 라면" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
          <!-- Coffee Time -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-blue-600 block">13:00</span>
              <span class="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded block text-center mt-0.5">[커피 골든타임]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">타이베이역 스페셜티 카페 · 14:00 마무리 커피</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">15:00 이전 마감 원칙 준수! 14:00 전 마지막 핸드드립 커피 1잔.</p>
            </div>
          </div>
          <!-- Meal 2: Late Lunch -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5 bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-blue-600 block">14:00</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 2: 늦은점심]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">타이베이 메인역 2층 브리즈센터 늦은점심</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">공항철도 탑승 전 메인역 미식가에서 정갈한 대만식 정식 식사.</p>
            </div>
          </div>
          <!-- MRT -->
          <div class="flex gap-2.5 items-start border-b border-slate-100 pb-2.5">
            <span class="w-12 text-[10px] font-bold text-blue-600 pt-0.5">15:30</span>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">타오위안 공항철도 직통 급행열차 (36분 직결)</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">A1 메인역에서 급행 탑승하여 T1 공항으로 논스톱 이동.</p>
            </div>
          </div>
          <!-- Meal 3: Dinner & Flight -->
          <div class="flex gap-2.5 items-start bg-amber-50/40 p-2 rounded-lg">
            <div class="w-16 flex-shrink-0 pt-0.5">
              <span class="text-[10px] font-bold text-blue-600 block">16:15</span>
              <span class="text-[9px] font-bold bg-amber-200 text-amber-900 px-1 py-0.2 rounded block text-center mt-0.5">[식사 3: 저녁식사]</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-xs text-slate-900">T1 출국 수속 (TR872 18:10) & 저녁 식사 / 귀국</h4>
              <p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">면세점 카발란/써니힐 수령, 탑승동/기내식 저녁 식사 후 21:45 인천 도착.</p>
              <img src="./images/kavalan_solist.jpg" alt="카발란 솔리스트 위스키" class="clickable-photo w-full h-24 rounded-lg object-cover mt-1.5">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- [5] 8 Essential Restaurants`;

mobileContent = mobileContent.replace(mobileOldSectionRegex, mobileNewSection4);
fs.writeFileSync(mobileGenPath, mobileContent, 'utf8');
console.log('✓ Mobile generator successfully patched.');

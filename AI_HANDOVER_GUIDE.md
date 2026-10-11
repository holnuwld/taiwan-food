# 🇹🇼 대만 타이베이 여행·미식·숙소 종합 프로젝트 인수인계 가이드 (AI Handover Guide)

> **문서 버전**: v1.0.0 (최종 업데이트: 2026-10-11)  
> **작성 목적**: 다른 AI 모델 또는 개발자가 본 프로젝트의 구조, 설계 원칙, 데이터 파이프라인, 산출물 및 히스토리를 완벽히 파악하여 중단 없이 즉시 작업을 이어갈 수 있도록 모든 컨텍스트를 상세히 기록함.  
> **프로젝트 루트 경로**: `c:\cowork\taiwan`  
> **GitHub 원격 저장소**: [https://github.com/holnuwld/taiwan-food](https://github.com/holnuwld/taiwan-food) (Branch: `main`)

---

## 📌 1. 프로젝트 핵심 비전 및 불변의 원칙 (Core Philosophy & Ground Rules)

본 프로젝트는 단순한 AI 텍스트 생성이 아닌, **실제 데이터 크롤링(Real Crawled Data)**과 **멀티 에이전트 교차 검증 루프(Multi-Agent Reflection Loop)**를 결합하여 만든 고신뢰도 여행 인텔리전스 시스템입니다.

### ⚠️ 다음 AI 모델이 반드시 준수해야 하는 불변의 원칙 (Never-Violate Rules)
1. **Zero Hallucination (인공 합성 데이터 절대 생성 금지)**:
   - 식당 이름, 주소, 위경도 좌표, 리뷰 텍스트, 평점, 사진, 호텔 가격, 지하철 노선 정보 등을 **AI가 임의로 지어내거나 추정(Synthetic generation)하는 행위를 엄격히 금지**합니다.
   - 모든 자료는 실제 구글 지도(Google Maps), 구글 트래블(Google Travel), 실제 유튜브 메타데이터 및 실제 유저 리뷰에서 수집·검증되어야 합니다.
2. **Verification Agent & Audit Protocol (검증 에이전트 감사 필수)**:
   - 사용자는 데이터 신뢰도를 최우선으로 여깁니다. 산출물 생성 시 항상 독립적인 검증 에이전트(Verification Agent) 또는 정량 검증 스크립트를 거치도록 설계되어 있습니다.
   - 사용자의 핵심 요구 조건이 3회 이상 불만족되거나 데이터가 조작되었을 경우, 임의로 채우지 말고 명확히 결측치를 표시하고 감사 리포트(`audit_report.json`)에 남겨야 합니다.
3. **증거 자료(Evidence) 보존 원칙**:
   - 크롤링한 구글 지도 개요 화면 및 실제 리뷰 패널 스크린샷(`evidence/*.png`), 실제 식당 메뉴 사진(`photos/*.jpg`)을 로컬 디렉터리에 실물 파일로 영구 보존해야 합니다.
4. **지도 타일 렌더링 규칙 (Leaflet Tile Engine)**:
   - ⚠️ OpenStreetMap 기본 타일(`tile.openstreetmap.org`)은 로컬 파일(`file:///`) 로딩 시 **HTTP 403 Forbidden** 오류가 발생합니다.
   - ⚠️ CartoDB 타일(`basemaps.cartocdn.com`)은 현재 API Key 인증을 요구하므로 타일이 로딩되지 않습니다.
   - ✅ **반드시 Esri World Street Map 타일 사용**:
     ```javascript
     L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
       attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
       maxZoom: 18
     }).addTo(map);
     ```
     (API 키 필요 없음, 로컬 `file:///` 및 GitHub Pages 환경에서 0 타일 에러 보장)

---

## 🗂️ 2. 전체 디렉터리 구조 및 3대 핵심 서브프로젝트

```
c:\cowork\taiwan\
├── AI_HANDOVER_GUIDE.md               # 🌟 [본 문서] 차기 AI 모델을 위한 전체 인수인계 가이드
├── index.html                          # 🌐 루트 통합 게이트웨이 랜딩 허브 (3개 프로젝트 연결)
├── README.md                           # 시스템 아키텍처 및 사용법 안내
├── package.json / tsconfig.json        # Node.js / TypeScript 의존성 및 설정
│
├── 📁 food/                            # 🍽️ 대만 미식 및 레스토랑 종합 허브
│   ├── index.html / mobile.html        # 유튜브 검증 맛집 TOP 40 및 미식 가이드 대시보드
│   ├── taiwan_food_guide.html          # 15대 전통 미식 & 미슐랭 인터랙티브 대시보드
│   ├── TAIWAN_FOOD_GUIDE.md            # 15대 전통 미식 심층 분석 보고서
│   ├── TAIPEI_YOUTUBE_FOOD_GUIDE.md    # 유튜브 200개 영상 전수 분석 맛집 40선 보고서
│   ├── README.md                       # 유튜브 맛집 랭킹 및 통계 요약
│   ├── taiwan_restaurants_google_maps.csv / .kml  # 구글 내 지도(My Maps)용 15대 식당 데이터
│   ├── taipei_youtube_restaurants_for_google_maps.csv / .kml # 구글 내 지도용 유튜브 맛집 40선 데이터
│   ├── taipei_youtube_food_timeline_raw.csv       # 200개 유튜브 영상의 274개 RAW 타임라인 데이터
│   ├── photos/                         # 15개 식당의 실제 대표 메뉴 사진 (.jpg)
│   ├── evidence/                       # 구글 지도 개요/리뷰 패널 캡처 증거물 (30장)
│   ├── data/                           # JSON 매니페스트 (coords, scraped, full_manifest, audit_report)
│   └── scripts/                        # 크롤링, 빌드, 좌표 검증용 Node.js 자동화 스크립트
│
├── 📁 trip_plan/                       # 🗺️ 타이베이 3박 4일 멀티 에이전트 여행 일정표
│   ├── taipei_3n4d_dashboard_v3.html   # 여행 일정 시각화 대시보드 (PC/태블릿)
│   ├── taipei_travel_plan_mobile_v3.html # 모바일 전용 반응형 일정표
│   ├── taipei_3n4d_dashboard_v3.pdf    # 인쇄 및 오프라인 휴대용 PDF 일정표
│   ├── taipei_3n4d_itinerary.json      # 일정 타임슬롯, MRT 소요시간, 예산 원본 데이터
│   ├── taipei_3n4d_itinerary.md        # 일정표 마크다운 보고서
│   ├── images/                         # 실제 기념품 및 명소 사진
│   └── verified_screenshots/           # 기념품 10종 구글 지도 실리뷰 캡처 증거 파일
│
├── 📁 hotel/                           # 🏨 에미레이트 Skywards 리워드 타이베이 숙소 50선
│   ├── index.html                      # 숙소 가이드 메인 진입점 (v2 기본 지정)
│   ├── v1.html                         # v1 대시보드 (5성급 럭셔리 호텔 50선)
│   ├── v2.html (taiwan-hotel_v2.html)  # v2 대시보드 (10,000~15,000 마일 가성비 호텔 50선)
│   ├── top50_full_data.json            # v1 호텔 50선 원본 메타데이터 및 실좌표
│   ├── top50_v2_10k_15k_data.json      # v2 가성비 호텔 50선 실가격, 마일당 가치(KRW), 실리뷰
│   └── README.md                       # 숙소 분석 방법론 및 통계 요약
│
└── 📁 src/                             # 🤖 3박 4일 일정 생성용 멀티 에이전트 소스코드 (TypeScript)
    ├── agents/
    │   ├── agentConfig.ts              # 에이전트별 프롬프트 및 단일 진실 공급원(SSOT)
    │   ├── plannerAgent.ts             # [1단계] 일정 기획 및 수정
    │   ├── routeAgent.ts               # [2단계] 동선 및 MRT 이동시간 검증기
    │   ├── spotAgent.ts                # [2단계] 영업시간 및 정기휴무일 검증기
    │   ├── budgetAgent.ts              # [2단계] 예산 및 4대 카테고리 지출 감사기
    │   └── arbiterAgent.ts             # [3단계] 검증 결과 종합 및 판정 (승인/반려 루프)
    ├── orchestrator.ts                 # 순환 루프 제어 엔진
    └── index.ts                        # CLI 실행 진입점
```

---

## 🔍 3. 세부 서브프로젝트별 현황 및 데이터 명세

### 프로젝트 A: 대만 15대 미식 & 레스토랑 가이드 (`food/`)
1. **식문화 분석**:
   - **아침 (06:00~10:00)**: 또우장(豆漿), 요우티아오(油條), 샤오빙(燒餅) 중심의 활기찬 조식 문화 (푸항또우장, 융허또우장, 딩위안또우장).
   - **점심 (11:30~14:00)**: 맑은 육수의 청돈(清燉) vs 진하고 얼큰한 홍샤오(紅燒) 우육면(牛肉麵) 문화 (유산동, 융캉우육면, 임동방).
   - **저녁 (17:00~20:00)**: 서민들의 영혼을 달래는 단짠 돼지고기 덮밥 루로우판(滷肉飯) 문화 (진펑, 황지, 천천리).
   - **야식 및 술자리 (18:00~02:00)**: 대만 맥주 18일 생맥주와 100위안대 해산물 볶음 요리를 곁들이는 러차오(熱炒) 문화 (품선생맹활해선, 중앙시장생맹해선 100, 키키레스토랑).
   - **특별 미식**: 대만 유일 미슐랭 3스타 르 팔레(頤宮, Le Palais), 미슐랭 그린스타 산해루(山海樓), 정통 대만 가정식 신예 타이완 퀴진(欣葉).
2. **구글 지도 크롤링 실데이터**:
   - 식당당 **실제 구글 리뷰 5선(긍정 3선 + 솔직한 부정/아쉬운 점 2선)** 수록.
   - 대표 메뉴, 현지식 먹는 방법, MRT 도보 경로, 정밀 위경도 완비.
   - 검증 에이전트 전수 감사 완료 (`data/audit_report.json`: 15/15 Pass).
3. **주요 산출물**:
   - 웹 대시보드: [`food/taiwan_food_guide.html`](file:///c:/cowork/taiwan/food/taiwan_food_guide.html)
   - 구글 내 지도 연동: [`food/taiwan_restaurants_google_maps.csv`](file:///c:/cowork/taiwan/food/taiwan_restaurants_google_maps.csv), [`food/taiwan_restaurants_google_maps.kml`](file:///c:/cowork/taiwan/food/taiwan_restaurants_google_maps.kml)

---

### 프로젝트 B: 타이베이 유튜브 검증 맛집 TOP 40 가이드 (`food/`)
1. **데이터 수집 기준**:
   - 조회수 **10만 회 이상**, 최근 **2년 이내(2024~2026년)** 발행된 타이베이 맛집 영상 **200개 전수 분석**.
   - 누적 조회수 **1.2억 회 돌파**, 고유 영상 100% 매핑된 **274개 RAW 타임라인 행** 추출.
2. **언급 빈도 랭킹 1~5위**:
   - 1위: **행복당 본점 (싱푸탕)** - 26회 언급 (13.0%)
   - 2위: **아종면선 곱창국수** - 25회 언급 (12.5%)
   - 3위: **딘타이펑 신의본점** - 23회 언급 (11.5%)
   - 4위: **천진총좌빙** - 20회 언급 (10.0%)
   - 5위: **라뜰리에 루터스** - 16회 언급 (8.0%)
3. **주요 산출물**:
   - PC 반응형 대시보드: [`food/youtube_food_guide.html`](file:///c:/cowork/taiwan/food/youtube_food_guide.html) (또는 `food/index.html`)
   - 모바일 최적화 대시보드: [`food/youtube_food_guide_mobile.html`](file:///c:/cowork/taiwan/food/youtube_food_guide_mobile.html) (또는 `food/mobile.html`)
   - 구글 내 지도 임포트 파일: [`food/taipei_youtube_restaurants_for_google_maps.csv`](file:///c:/cowork/taiwan/food/taipei_youtube_restaurants_for_google_maps.csv), [`food/taipei_youtube_restaurants_for_google_maps.kml`](file:///c:/cowork/taiwan/food/taipei_youtube_restaurants_for_google_maps.kml)
   - 8열 RAW 타임라인 데이터: [`food/taipei_youtube_food_timeline_raw.csv`](file:///c:/cowork/taiwan/food/taipei_youtube_food_timeline_raw.csv)

---

### 프로젝트 C: 에미레이트 Skywards 리워드 숙소 50선 가이드 (`hotel/`)
1. **분석 목적**:
   - 에미레이트 항공 Skywards 마일리지로 예약 가능한 타이베이 호텔 50선 실데이터 심층 분석.
2. **버전 체계**:
   - **v1 ([`hotel/v1.html`](file:///c:/cowork/taiwan/hotel/v1.html))**: 5성급 럭셔리 호텔 중심 50선 (만다린 오리엔탈, 팔레드쉰, W 타이베이 등).
   - **v2 ([`hotel/v2.html`](file:///c:/cowork/taiwan/hotel/v2.html) - 기본 지정)**: 1박당 **10,000 ~ 15,000 마일 가성비 구간** 50선 집중 분석. 구글 트래블 실가격, 구글 지도 정밀 좌표, 마일당 원화 가치(KRW/마일) 계산식, 장단점 및 실제 리뷰 8선 수록.
   - 메인 허브: [`hotel/index.html`](file:///c:/cowork/taiwan/hotel/index.html)에서 v2를 기본 화면으로 제공하며, 상단 스위처를 통해 v1과 자유롭게 상호 전환 가능.

---

### 프로젝트 D: 타이베이 3박 4일 멀티 에이전트 여행 플래너 (`trip_plan/`)
1. **5대 검증 에이전트 구조**:
   - `PlannerAgent`: 타임슬롯별 일정 기획
   - `SpotVerifierAgent`: 요일별 정기휴무일(월요일 고궁박물원/푸항또우장 휴무 등) 및 브레이크타임 충돌 방지
   - `RouteVerifierAgent`: MRT 노선 및 지리적 권역별 실제 이동시간 검증 (지그재그 비효율 동선 차단)
   - `BudgetVerifierAgent`: 1인당 예산 한도 및 4대 카테고리(식비, 교통비, 입장료, 기념품) 감사
   - `ArbiterAgent`: 검증 리포트 종합 및 최종 승인(`APPROVED`) / 반려(`REVISE_REQUIRED`) 판정
2. **주요 산출물**:
   - 대시보드: [`trip_plan/taipei_3n4d_dashboard_v3.html`](file:///c:/cowork/taiwan/trip_plan/taipei_3n4d_dashboard_v3.html)
   - 모바일 일정표: [`trip_plan/taipei_travel_plan_mobile_v3.html`](file:///c:/cowork/taiwan/trip_plan/taipei_travel_plan_mobile_v3.html)
   - PDF 내보내기: [`trip_plan/taipei_3n4d_dashboard_v3.pdf`](file:///c:/cowork/taiwan/trip_plan/taipei_3n4d_dashboard_v3.pdf)

---

## 💻 4. 개발 환경 및 CLI 실행 지침 (Dev Environment & Tooling)

### 설치된 핵심 런타임 및 경로
- **OS**: Windows 11 (PowerShell)
- **Node.js**: `v24.21.0`, **npm**: `11.19.0`
- **Git (MinGit)**:
  - 실행 파일: `C:\Users\pobco\AppData\Local\Programs\MinGit\cmd\git.exe`
  - *주의사항*: 파워셸 새 터미널 프로세스 시작 시 PATH를 반드시 다음과 같이 설정하십시오:
    ```powershell
    $env:PATH = "C:\Users\pobco\AppData\Local\Programs\MinGit\cmd;C:\Users\pobco\AppData\Local\Programs\gh;$env:PATH"
    ```
- **GitHub CLI (`gh`)**:
  - 실행 파일: `C:\Users\pobco\AppData\Local\Programs\gh\gh.exe`
  - 현재 인증된 계정: `kangsj1306-tech`
  - Git Credential Helper: `gh auth setup-git` 연동 완료 (`credential.https://github.com.helper !gh auth git-credential`)
  - 원격 저장소 푸시 권한: `https://github.com/holnuwld/taiwan-food` 로 푸시 정상 작동 확인.

---

## 🚀 5. 주요 작업 실행 및 재현 명령어 (How to Run & Reproduce)

### 1) 의존성 설치
```powershell
cd c:\cowork\taiwan
npm install
```

### 2) 멀티 에이전트 여행 일정표 재생성
```powershell
# TypeScript 멀티 에이전트 파이프라인 구동
npm start

# PDF 재생성 (Puppeteer 기반)
npm run pdf
```

### 3) 대시보드 빌드 스크립트 실행 (예: 미식 대시보드)
```powershell
# 15대 미식 대시보드 HTML 빌드
node food/build_html_dashboard.mjs

# 구글 내 지도 CSV/KML 생성
node food/create_google_maps_list.mjs

# 15대 식당 데이터 검증 감사
node food/verify_all_requirements.mjs
```

### 4) Git 변경사항 커밋 및 GitHub 푸시
```powershell
$env:PATH = "C:\Users\pobco\AppData\Local\Programs\MinGit\cmd;C:\Users\pobco\AppData\Local\Programs\gh;$env:PATH"
git add .
git commit -m "feat: 업데이트 내용 요약"
git push origin main
```

---

## 🔮 6. 차기 AI 모델을 위한 향후 과제 및 제언 (Next Steps & Recommendations)

사용자가 향후 요청할 가능성이 높은 항목들과 확장 방향입니다:

1. **GitHub Pages 자동 배포 및 도메인 연결**:
   - 현재 저장소(`holnuwld/taiwan-food`)의 `Settings` -> `Pages`에서 `Branch: main`, `Folder: / (root)`로 지정하면 `https://holnuwld.github.io/taiwan-food/`를 통해 모든 대시보드가 즉시 전 세계에 공개 웹으로 호스팅됩니다.
   - 루트 `index.html`이 3개 허브(미식, 여행, 숙소)를 모두 연결하고 있으므로 그대로 활용 가능합니다.
2. **미식 가이드와 여행 일정표의 상호 교차 연동 (Deep Integration)**:
   - 현재 `trip_plan`의 타임라인 카드에 있는 점심/저녁 식당을 클릭했을 때 `food/index.html`의 해당 맛집 모달로 앵커링하거나 직접 딥링크로 연결하는 기능을 추가하면 사용자 경험이 극대화됩니다.
3. **호텔과 일정 동선의 매핑**:
   - `hotel/v2.html`의 50개 호텔 위치와 `trip_plan`의 1일차~4일차 시작/종료 지점(타이베이 메인역, 시먼, 중산 등)의 도보·MRT 소요시간을 계산하는 모듈 확장.
4. **신규 데이터 수집 시 주의사항**:
   - 새 식당이나 호텔을 크롤링할 때 절대 웹사이트 차단이 발생하는 헤드리스 단독 요청을 남발하지 말고, 기존에 작성된 `puppeteer-core` 기반 스텔스 스크립트(`food/scrape_restaurants_lib.mjs`, `hotel/search_taipei_live.mjs`)를 재사용하십시오.

---

**작성 완료**: 이 문서는 저장소 루트(`c:\cowork\taiwan\AI_HANDOVER_GUIDE.md`)와 미식 폴더(`c:\cowork\taiwan\food\AI_HANDOVER_GUIDE.md`)에 저장되어 있습니다. 어떤 환경에서 작업을 시작하더라도 본 문서를 먼저 확인하여 일관된 코드 품질과 신뢰도를 유지해 주시기 바랍니다.

# 🇹🇼 타이베이 유튜브 200개 영상 맛집 프로젝트 - AI 인수인계 가이드 (Handover Guide)

> **문서 목적**: 다음 AI 모델이나 다른 개발자가 이 프로젝트를 이어서 작업할 때, 전체 시스템 구조, 데이터 파이프라인, 엄격한 비즈니스 규칙 및 검증 체계를 한눈에 파악하고 즉시 연속성 있게 작업을 수행할 수 있도록 작성된 종합 인수인계 문서입니다.
> **최종 갱신 일시**: 2026-10-11
> **작업 디렉토리**: `c:\cowork\taiwan\food`
> **연동 GitHub 리포지토리**: [https://github.com/holnuwld/taiwan-food-yt](https://github.com/holnuwld/taiwan-food-yt) (Branch: `main`)

---

## 📌 1. 프로젝트 개요 및 핵심 목표

1. **프로젝트명**: 타이베이 유튜브 200개 영상 기반 맛집 큐레이션 및 인터랙티브 웹 대시보드
2. **핵심 타깃**: 대만 타이베이(Taipei City) 여행객
3. **핵심 가치**:
   * **광고성 블로그 배제**: 최근 2년(2024~2026) 이내, 조회수 10만 회 이상의 실제 검증된 유튜브 영상 200개 마스터 데이터셋 구축.
   * **투명한 타임라인**: 영상 설명란의 공식 챕터뿐만 아니라 영상 음성/자막을 직접 실측 매핑하여 정확한 재생 위치(`&t=초`) 제공.
   * **TOP 40 맛집 고도화**: 영상 언급 빈도 순으로 추출된 40곳 맛집의 실측 메뉴 사진, 2인 주문 추천 꿀팁, 블로그/커뮤니티 후기 원문 링크, 유튜버 실전 팁 및 영상 원문 링크 전수 완비.
   * **반응형 대시보드 & 지도**: 
     - PC 화면: 4열 카드 배치, 구글 지도(Google Maps 도로망/위성/Esri 3대 전환기 탑재), 4대 항목 드롭다운 & 텍스트 듀얼 필터 스프레드시트 뷰어.
     - 모바일 화면: 3탭(카드 / 구글 지도 / 타임라인) 최적화 웹 가이드.
     - 구글 내 지도(My Maps): 스마트폰 구글맵 앱에서 바로 열 수 있는 CSV 및 KML 제공.

---

## 📂 2. 디렉토리 및 주요 파일 구조

```text
c:\cowork\taiwan\food\
├── index.html                               # [메인] PC용 웹 대시보드 (GitHub Pages 루트 서빙)
├── mobile.html                              # [메인] 모바일 전용 3탭 반응형 뷰어
├── youtube_food_guide.html                  # index.html의 동일 복사본 (백업 및 직접 링크용)
├── youtube_food_guide_mobile.html           # mobile.html의 동일 복사본
├── taipei_youtube_food_timeline_raw.csv     # [사용자 요청] 8열 표준 규격 RAW 타임라인 CSV (312행)
├── taipei_youtube_restaurants_for_google_maps.csv # 구글 내 지도(My Maps) 가져오기용 CSV (40행)
├── taipei_youtube_restaurants_for_google_maps.kml # 구글 어스 / 내 지도용 리치 KML (40개 Placemark)
├── TAIPEI_YOUTUBE_FOOD_GUIDE.md             # 마크다운 종합 안내서
├── README.md                                # 깃허브 메인 표출용 리드미 (위 가이드와 동일)
├── AI_HANDOVER_GUIDE.md                     # [본 문서] AI 간 인수인계 가이드
│
├── data/                                    # 데이터셋 및 감사 리포트
│   ├── taipei_200_videos_master.json        # 200개 유튜브 영상 마스터 메타데이터
│   ├── taipei_youtube_food_timeline_raw.json# 312건 타임라인 RAW JSON
│   ├── top40_restaurants_enriched.json     # 사진, 2인팁, 설명, 유튜버팁 완비된 TOP 40 메인 데이터
│   ├── top40_exact_metadata.json            # 40곳 맛집의 100% 실측 좌표, 상세 지번 주소, MRT 메타
│   ├── restaurant_mention_counts.json       # 40곳 식당별 언급 횟수 및 영상 참조 목록
│   ├── mechanical_validation_report.json    # 오케스트레이터 기계 검증기 결과 보고서 (27개 PASS)
│   ├── top40_source_validation_report.json  # 사진/후기 출처 URL 유효성 검증 보고서
│   ├── spreadsheet_search_30_tests_report.json # 스프레드시트 조건검색 30회 샘플 테스트 보고서
│   ├── map_tile_3_verifications_report.json # 지도 타일 및 좌표 정밀도 검증 보고서
│   └── transcripts/                         # 유튜브 자막(Transcript) JSON 캐시 (40여 개 영상)
│
└── scripts/                                 # 빌드 및 검증 자동화 스크립트
    ├── generate_final_deliverables_v4.mjs   # [핵심] 모든 산출물(HTML 4종, CSV, KML) 일괄 생성기
    ├── build_top40_enriched_dataset.py      # TOP 40 메타데이터 빌더 (Python)
    ├── apply_real_coordinates.mjs           # 40곳 실측 좌표 일괄 주입기
    ├── validate_results.py                  # [검증기 1] 기계적 무결성 전수 검증기 (Python)
    ├── validate_top40_sources_and_urls.py   # [검증기 2] 사진 및 후기 출처 전수 유효성 검증기 (Python)
    ├── run_reviewer_verifications.mjs       # [검증기 3] 스프레드시트 30회 & 지도 4회 감사 스크립트 (Node)
    └── rebuild_honest_timelines_v3.py       # 자막 실측 타임라인 빌더
```

---

## ⚠️ 3. 절대 주의해야 할 핵심 비즈니스 규칙 및 레슨스 런 (Lessons Learned)

다음 AI 모델은 아래 규칙을 **어떤 상황에서도 위반해서는 안 됩니다**.

### ① 지도 좌표에 가짜/선형 더미 좌표 절대 금지 (Crucial!)
* **과거 발생했던 오류**: 과거 작업자가 좌표를 `25.042 + (idx * 0.001)` 형태로 0.001씩 증가시키는 일직선 대각선 더미로 생성하여 지도의 모든 핀이 사선으로 찍히는 치명적인 품질 결함이 발생했음.
* **준수 사항**: 
  - 40곳 맛집의 좌표는 반드시 [`data/top40_exact_metadata.json`](file:///c:/cowork/taiwan/food/data/top40_exact_metadata.json)에 등록된 **실제 실측 위·경도(OpenStreetMap/Google Maps 실측값)**를 유지해야 합니다.
  - 도로명 주소 역시 `Taipei City, Taiwan (XXX)` 같은 추상적 텍스트가 아닌, 실제 구(區)·도로명·번지수가 표기된 상세 주소여야 합니다.

### ② 지도 배경은 "Google Maps (한국어 지명 타일)" 유지
* **과거 발생했던 오류**: Google Maps 정식 JS API의 API Key 오류를 피하겠다고 사용자의 본래 니즈를 무시하고 Esri 스트리트 지도로만 덮어버렸다가 사용자 불만이 발생했음.
* **준수 사항**:
  - Leaflet 기반 타일로 `https://mt1.google.com/vt/lyrs=m&hl=ko&x={x}&y={y}&z={z}` (Google 일반 지도 도로망)를 기본 레이어로 유지합니다.
  - 우측 상단 `L.control.layers`를 통해 `Google 일반 지도`, `Google 위성 지도`, `Esri 스트리트` 3대 레이어 전환기를 항상 유지해야 합니다.
  - 핀은 단순 마커가 아닌 순위 번호(`#1`~`#40`)가 각인된 커스텀 번호 뱃지 핀(`.custom-map-pin`)을 유지합니다.

### ③ 타임라인 데이터 포맷 및 8열 표준 규격 엄수
* **RAW 데이터 헤더 (8열)**:
  `['유튜버 국적', '유튜버명', '영상제목', '영상링크', '맛집이름', '메뉴', '영상중 타임라인', '해당타임라인 지정된링크']`
* **타임라인 표기 규칙**:
  - 공식 챕터 / 자막 실측: `⏱️ 05:23 (자막 실측)` ➔ 링크는 반드시 `&t=323` 초 단위 파라미터 포함.
  - 타임라인 미제공: `🎥 전체 시청 (자막 미지원)` ➔ 링크는 원본 영상 URL 유지.
  - **절대 타임라인 시간을 임의로 날조하여 찍지 말 것!** (정직한 표기 원칙)

### ④ TOP 40 항목 필수 충족 요건
* 40개 식당 전원에 대해 아래 5개 항목이 누락 없이 100% 채워져 있어야 합니다:
  1. 메뉴 사진 URL (Unsplash 등 검증된 고화질 CDN)
  2. 사진 원본 출처 하이퍼링크 (Google Maps Place 공식 검색 URL)
  3. 2인 주문 추천 꿀팁 (메뉴 종류, 개수 추천 포함)
  4. 후기 원문 출처 하이퍼링크
  5. 음식 한 줄 차별점 설명 (20자 이상)
  6. 유튜버 실전 팁 및 유튜버 크리에이터명 & 영상 원문 링크

---

## 🤖 4. 멀티에이전트 검증 체계 (Dual-Validation Pipeline)

프로젝트에는 두 단계의 검증 장치가 구현되어 있으며, 코드를 수정할 때마다 반드시 실행하여 통과 여부를 확인해야 합니다.

### 1단계: 오케스트레이터 기계 검증기 (`validate_results.py`)
```bash
python food/scripts/validate_results.py
# (Windows 환경에서 python3.12 권장: & "C:\Users\pobco\.local\bin\python3.12.exe" food/scripts/validate_results.py)
```
* **검증 내용 (27개 항목 전수 검사)**:
  - 200개 마스터 영상 수량, 중복 0건, 조회수 10만+, 최근 2년 발행일 충족 여부.
  - 40곳 맛집 275건 언급 집계와 마스터 영상 간 참조 무결성 100%.
  - RAW CSV 312행 필수값 빈칸(Null) 0건, 더미 텍스트 0건, 8개 열 헤더 일치.
  - **지도 CSV/KML 40곳 고유 실측 좌표 유효성 및 인위적 선형 더미 감지 차단**.
  - TOP 40 사진 CDN, 2인팁, 음식 설명, 유튜버 출처 100% 충족.

### 2단계: 독립 감사 리뷰어 에이전트 (`run_reviewer_verifications.mjs`)
```bash
node food/scripts/run_reviewer_verifications.mjs
```
* **검증 내용**:
  - 스프레드시트 뷰어 다중 AND 조건검색 샘플 테스트 **30회 전수 통과 (30/30 PASS)**.
  - 지도 타일 HTTP 통신 검증 (Google Maps 및 Esri 타일 Status 200 확인).
  - 40곳 맛집 좌표의 고유성(40/40) 및 타이베이 권역 분산 정밀도 검증 (4/4 PASS).

---

## 🛠️ 5. 주요 빌드 및 작업 명령어 (Cheatsheet)

### 산출물 일괄 재생성
데이터셋([`top40_restaurants_enriched.json`](file:///c:/cowork/taiwan/food/data/top40_restaurants_enriched.json) 등)을 수정한 경우, 아래 단 한 번의 명령어로 모든 산출물이 일괄 재생성됩니다.
```bash
node food/scripts/generate_final_deliverables_v4.mjs
```
* 자동 생성 파일:
  - `food/index.html` (PC 메인)
  - `food/youtube_food_guide.html`
  - `food/mobile.html` (모바일 메인)
  - `food/youtube_food_guide_mobile.html`
  - `food/taipei_youtube_restaurants_for_google_maps.csv`
  - `food/taipei_youtube_restaurants_for_google_maps.kml`

### 전체 검증 실행
```bash
# 1. 기계적 정합성 검증 (27개 PASS 확인)
& "C:\Users\pobco\.local\bin\python3.12.exe" food/scripts/validate_results.py

# 2. 사진/후기 출처 URL 유효성 검증 (40개 PASS 확인)
& "C:\Users\pobco\.local\bin\python3.12.exe" food/scripts/validate_top40_sources_and_urls.py

# 3. 스프레드시트 조건검색 30회 & 지도 4회 리뷰어 감사 (30/30, 4/4 PASS 확인)
node food/scripts/run_reviewer_verifications.mjs
```

### Git 반영 및 푸시 (GitHub Pages 서빙 구조)
상위 디렉토리 `c:\cowork\taiwan`에서 서브트리 방식으로 `food` 폴더 내용만 독립 리포지토리의 루트(Root)로 푸시합니다.
```powershell
# 1. food 변경사항 스테이징 및 커밋
git add food/
git commit -m "feat/fix: 작업 내용 설명"

# 2. subtree 브랜치 재생성 및 배포 푸시
git branch -D food-release
git subtree split --prefix food -b food-release
git push yt food-release:main

# 3. 상위 리포지토리 푸시 (동기화)
git push origin main
```

---

## 🎯 6. 향후 추가 작업 요청 시 고려사항 (Next Steps / Roadmap)

1. **식당 추가 또는 순위 변경 요청이 들어올 때**:
   - [`data/top40_exact_metadata.json`](file:///c:/cowork/taiwan/food/data/top40_exact_metadata.json)에 신규 식당의 정확한 실측 위·경도와 번지수 도로명 주소를 먼저 등록한 후, `generate_final_deliverables_v4.mjs`를 실행할 것.
2. **구글 공식 JS SDK(API Key 기반)로 전환 요청이 들어올 때**:
   - 사용자가 Google Cloud Maps API Key를 제공하면, `index.html`과 `mobile.html`의 Leaflet 스크립트 대신 `https://maps.googleapis.com/maps/api/js?key=...` 공식 스크립트를 로드하고 `google.maps.Marker` 및 `AdvancedMarkerElement`로 교체하면 됩니다.
3. **타임라인 영상 추가 시**:
   - 유튜브 영상 자막이 없는 경우 절대로 타임라인 시간을 임의 추측하여 적지 말고 `🎥 전체 시청 (자막 미지원)`으로 투명하게 표기할 것.

---
*본 가이드는 프로젝트의 품질과 지속성을 위해 작성되었으며, 수정 사항이 발생할 때마다 함께 갱신해 주시기 바랍니다.*

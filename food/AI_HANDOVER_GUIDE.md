# 🍽️ 대만 미식 & 레스토랑 프로젝트 인수인계 가이드 (AI Handover Guide)

> **전체 통합 가이드 안내**: 본 프로젝트를 포함하여 여행 일정(`trip_plan/`) 및 숙소 분석(`hotel/`)까지 포함한 마스터 인수인계 문서는 루트 경로의 [`../AI_HANDOVER_GUIDE.md`](file:///c:/cowork/taiwan/AI_HANDOVER_GUIDE.md)에 상세히 기록되어 있습니다.

---

## 📌 1. food/ 디렉터리 주요 산출물 및 데이터 현황

1. **대만 15대 전통 미식 & 미슐랭 가이드**:
   - [`TAIWAN_FOOD_GUIDE.md`](file:///c:/cowork/taiwan/food/TAIWAN_FOOD_GUIDE.md): 시간대별(조식/중식/석식/야식·술자리) 식문화 분석 및 12개 전통 맛집 + 3개 미슐랭 맛집 3사 비교 매트릭스.
   - [`taiwan_food_guide.html`](file:///c:/cowork/taiwan/food/taiwan_food_guide.html): Leaflet & Esri World Street Map 기반 인터랙티브 지도 대시보드 (실제 구글 리뷰 5선, 추천 메뉴, 먹는 법, 지하철 접근법 완비).
   - [`taiwan_restaurants_google_maps.csv`](file:///c:/cowork/taiwan/food/taiwan_restaurants_google_maps.csv) / [`.kml`](file:///c:/cowork/taiwan/food/taiwan_restaurants_google_maps.kml): 구글 내 지도(My Maps) 가져오기용 데이터.
   - `photos/`: 15개 식당의 실제 대표 메뉴 사진 (`photos/*.jpg`).
   - `evidence/`: 15개 식당의 구글 지도 개요 및 실제 리뷰 탭 캡처 스크린샷 30장 (`evidence/*.png`).
   - `data/audit_report.json`: 검증 에이전트 전수 감사 통과 기록 (15/15 Pass).

2. **타이베이 유튜브 검증 맛집 TOP 40 가이드 (200개 영상 전수 분석)**:
   - [`TAIPEI_YOUTUBE_FOOD_GUIDE.md`](file:///c:/cowork/taiwan/food/TAIPEI_YOUTUBE_FOOD_GUIDE.md) & [`README.md`](file:///c:/cowork/taiwan/food/README.md): 10만 뷰 이상 유튜브 영상 200개에서 추출한 40선 랭킹 리포트.
   - [`index.html`](file:///c:/cowork/taiwan/food/index.html) (또는 [`youtube_food_guide.html`](file:///c:/cowork/taiwan/food/youtube_food_guide.html)): PC 반응형 대시보드.
   - [`mobile.html`](file:///c:/cowork/taiwan/food/mobile.html) (또는 [`youtube_food_guide_mobile.html`](file:///c:/cowork/taiwan/food/youtube_food_guide_mobile.html)): 모바일 전용 반응형 대시보드.
   - [`taipei_youtube_restaurants_for_google_maps.csv`](file:///c:/cowork/taiwan/food/taipei_youtube_restaurants_for_google_maps.csv) / [`.kml`](file:///c:/cowork/taiwan/food/taipei_youtube_restaurants_for_google_maps.kml): 구글 내 지도용 40선 데이터.
   - [`taipei_youtube_food_timeline_raw.csv`](file:///c:/cowork/taiwan/food/taipei_youtube_food_timeline_raw.csv): 200개 영상의 274개 RAW 타임라인 데이터.

---

## ⚠️ 2. 핵심 개발 및 렌더링 주의사항

1. **Zero Hallucination 원칙**:
   - 가짜 식당, 임의 좌표, AI 합성 리뷰 작성 금지.
2. **지도 타일 403 차단 방지**:
   - Leaflet 지도 구현 시 반드시 **Esri World Street Map 타일**(`https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}`)을 사용하십시오. OSM 기본 서버는 로컬 `file:///` 접속 시 HTTP 403을 반환합니다.
3. **Git 연동**:
   - 원격 저장소: `https://github.com/holnuwld/taiwan-food`
   - Git CLI: `C:\Users\pobco\AppData\Local\Programs\MinGit\cmd\git.exe`
   - GitHub CLI: `C:\Users\pobco\AppData\Local\Programs\gh\gh.exe`

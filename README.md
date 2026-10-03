# 🇹🇼 멀티 에이전트 여행 플래너 (Multi-Agent Travel Planner)
> **대만 타이베이 3박 4일 일정 교차 검증 시스템**  
> 일정(Planner), 동선(Route), 영업시간/휴무일(Spot), 예산(Budget) 에이전트 간의 **반복적 교차 검증 루프(Reflection Loop)** 기반 여행 계획 생성 파이프라인

---

## 📌 1. 시스템 핵심 아키텍처

본 프로젝트는 단일 LLM 프롬프트의 한계(동선 꼬임, 정기휴무 무시, 예산 초과)를 해결하기 위해 **5개의 전담 에이전트**가 협업하고 상호 비평하는 구조로 구현되었습니다.

```
       [사용자 여행 요구사항 (기간, 도시, 취향, 예산)]
                             │
                             ▼
                 ┌───────────────────────┐
                 │  1. Planner Agent     │ ◄─── 수정 지침 (Change Request)
                 │  (일정 기획 및 초안)  │
                 └───────────┬───────────┘
                             │ 일정 초안 (Draft)
                             ▼
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ 2. Route      │   │ 3. Spot         │   │ 4. Budget       │
│    Verifier   │   │    Verifier     │   │    Verifier     │
│ (동선/이동시간)│   │ (영업시간/휴무일) │   │ (비용/예산 감사) │
└───────┬───────┘   └────────┬────────┘   └────────┬────────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             │ 검증 리포트 (Issues & Evidence)
                             ▼
                 ┌───────────────────────┐
                 │  5. Arbiter / Critic  │
                 │  (비평 및 종합 판정) │
                 └───────────┬───────────┘
                             │
               ┌─────────────┴─────────────┐
               ▼                           ▼
          [통과 (Pass)]              [반려 (Revise)]
               │                           │
               ▼                           └─► Planner에게 루프 피드백
    [최종 일정표 확정 및 출력]                 (최대 Iteration까지)
```

---

## 🤖 2. 에이전트별 전담 역할 및 책임 정의

각 에이전트의 역할 명세와 책임은 [`src/agents/agentConfig.ts`](file:///c:/cowork/taiwan/src/agents/agentConfig.ts)에서 단일 진실 공급원(Single Source of Truth)으로 중앙 관리됩니다.

| 에이전트 | 클래스명 | 역할 및 핵심 책임 | 검증 및 조치 기준 |
| :--- | :--- | :--- | :--- |
| **Planner** | `PlannerAgent` | **여행 테마 및 선호도를 반영한 타임슬롯별 일정 생성 및 수정** | 체류 시간 균형 배정, 필수 방문지(Must-visit) 포함, 반려 시 대체지 선정 |
| **SpotVerifier** | `SpotVerifierAgent` | **요일별 정기휴무일(월요 휴관 등), 영업시간, 식당 브레이크타임 대조** | 휴무일 충돌 시 `BLOCKER`, 브레이크타임 침범 시 `BLOCKER`, 마감 시간 초과 차단 |
| **RouteVerifier** | `RouteVerifierAgent` | **MRT 노선 및 지리적 권역(서부/동부/북부/외곽)별 실제 이동시간과 스케줄 간격 검증** | 이동 여유 시간 < 소요시간 시 `BLOCKER`, 지그재그 비효율 동선 시 `WARNING` |
| **BudgetVerifier** | `BudgetVerifierAgent` | **교통비, 식비, 입장료 산출 및 1인당 예산 한도 감사** | 총 경비 > 예산 시 `BLOCKER`, 특정일 과다 지출 시 `WARNING`, 4대 카테고리별 정산 |
| **Arbiter** | `ArbiterAgent` | **검증 리포트 종합, 차단(Blocker) 이슈 선별, 플래너에게 구체적인 수정 지침 하달** | `BLOCKER` 0건 시 `APPROVED` 판정, 잔존 시 우선순위 기반 실행 지침 하달 |
| **Orchestrator** | `TravelPlannerOrchestrator` | **전체 순환 사이클 제어 및 다중 포맷(HTML/MD/JSON) 내보내기** | 최대 반복 횟수(Max Iterations) 안전 제어, HTML 대시보드/MD/JSON 3종 내보내기 |

---

## 🛠 3. 실제 교차 검증 시나리오 (Taiwan Taipei 3N4D)

1. **Iteration 1 (초안 단계)**:
   - 플래너의 초기 초안에서 **월요일(Day 2)**에 *국립고궁박물원*과 *푸항또우장*을 배정.
   - 오후 15:30에 *키키 레스토랑* 방문 배정.
2. **검증 에이전트 감지**:
   - `SpotVerifier`가 **"국립고궁박물원과 푸항또우장은 월요일 정기 휴관/휴무"** 및 **"키키 레스토랑 브레이크타임(15:00~17:15) 충돌"**을 감지하여 `BLOCKER` 발행.
   - `RouteVerifier`가 Shilin에서 단수이 이동 시간 촉박 이슈 감지.
3. **Arbiter 종합**:
   - 승인 거절(`REVISE_REQUIRED`) 판정 및 플래너에게 수정 지침 전달.
4. **Iteration 2 (수정 단계)**:
   - 플래너가 월요일 일정을 연중무휴인 *중정기념당*, *딘타이펑*, *단수이 일몰 코스*로 대체.
   - 국립고궁박물원과 푸항또우장을 화요일(Day 3, 정상영업)로 이전.
   - 키키 레스토랑을 저녁 오픈 시간인 17:30으로 재배치.
5. **최종 승인 (`APPROVED`)**:
   - 모든 제약 조건을 완벽히 충족하여 최종 일정 확정 및 3종 파일 내보내기 완료.

---

## 🚀 4. 실행 방법

### 요구 사항
- Node.js >= 20 (Node v24 권장)
- npm

### 설치 및 실행
```bash
# 1. 의존성 설치 (최초 1회)
npm install

# 2. 멀티 에이전트 여행 플래너 실행
npm start
```

### 환경 변수 설정 (`.env`)
기본 상태에서는 내장된 정밀 규칙 엔진과 대만 타이베이 데이터베이스(`taipeiData.ts`)로 즉시 구동되며, Google Gemini API를 연동하려면 `.env` 파일을 생성하고 키를 입력하면 됩니다:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
MAX_ITERATIONS=3
```

---

## 📁 5. 프로젝트 구조

```
c:\cowork\taiwan\
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── src/
│   ├── types.ts                 # 공통 상태 객체 및 Pydantic 스타일 인터페이스
│   ├── config.ts                # 환경 설정 및 기본값
│   ├── knowledge/
│   │   └── taipeiData.ts        # 타이베이 명소/맛집/운영시간/MRT 이동 행렬 데이터
│   ├── agents/
│   │   ├── agentConfig.ts       # 0단계: 에이전트 전담 역할 정의 및 단일 진실 공급원(SSOT)
│   │   ├── baseAgent.ts         # Gemini API 호출 및 기본 클래스
│   │   ├── plannerAgent.ts      # 1단계: 일정 기획 및 수정 에이전트
│   │   ├── routeAgent.ts        # 2단계: 동선 & MRT 이동시간 검증기
│   │   ├── spotAgent.ts         # 2단계: 영업시간 & 정기휴무일 검증기
│   │   ├── budgetAgent.ts       # 2단계: 예산 & 일일 지출 감사기
│   │   └── arbiterAgent.ts      # 3단계: 피드백 종합 및 판정 에이전트
│   ├── ui/
│   │   └── terminalFormatter.ts # 컬러 터미널 UI 포매터
│   ├── orchestrator.ts          # 순환 피드백 루프 총괄 및 내보내기 엔진
│   └── index.ts                 # 실행 진입점 (대만 3박 4일 설정)
└── output/
    ├── taipei_3n4d_itinerary.json     # 파싱 및 연동용 순수 JSON 데이터
    ├── taipei_3n4d_itinerary.md       # 마크다운 보고서
    └── taipei_3n4d_dashboard.html     # 브라우저용 반응형 시각 대시보드
```

---

## 📊 6. 생성된 최종 산출물 미리보기

실행 후 `output/` 폴더에 3가지 형식의 파일이 자동 생성됩니다:
- [HTML 대시보드 (taipei_3n4d_dashboard.html)](trip_plan/taipei_3n4d_dashboard_v3.html): 웹 브라우저로 열면 타임라인 카드와 에이전트 검증 마크를 시각적으로 확인 가능
- [마크다운 일정표 (taipei_3n4d_itinerary.md)](trip_plan/taipei_3n4d_itinerary.md): 일정표, 이력, 비용 분석 정리 문서
- [JSON 데이터 (taipei_3n4d_itinerary.json)](trip_plan/taipei_3n4d_itinerary.json): API 연동 및 모바일 앱 확장 가능한 원본 데이터

---

## 🍽️ 7. 대만 15대 미식 & 레스토랑 지도 가이드 (`food/`)

구글 지도 실제 크롤링 및 검증 에이전트 감사(15개 식당 전수 통과)를 거친 대만 전통 미식 및 미슐랭 레스토랑 인터랙티브 가이드입니다.

- **[웹 인터랙티브 가이드 (food/index.html)](food/index.html)**: Leaflet & Esri World Street Map 기반 실시간 핀포인트 지도, 식사 시간대별 필터(아침/점심/저녁/야식/미슐랭), 실제 구글 리뷰 5선(부정 2선 포함), 추천 메뉴 및 지하철 경로 완비.
- **[종합 상세 리포트 (food/TAIWAN_FOOD_GUIDE.md)](food/TAIWAN_FOOD_GUIDE.md)**: 대만 현지 식문화, 식당군별 3대 맛집 비교 매트릭스, 감사 리포트.
- **구글 지도 연동 데이터**:
  - `food/taiwan_restaurants_google_maps.csv`: 구글 내 지도(My Maps) 가져오기용 CSV
  - `food/taiwan_restaurants_google_maps.kml`: 구글 어스 및 내 지도용 KML


import { AgentName, AgentRoleDefinition } from '../types.js';

export const AGENT_REGISTRY: Record<string, AgentRoleDefinition> = {
  Planner: {
    name: 'Planner',
    className: 'PlannerAgent',
    roleTitle: '일정 기획 및 최적화 에이전트',
    coreResponsibilities: [
      '사용자의 여행 테마(미식, 랜드마크, 문화, 일몰 등) 및 선호도 반영',
      '일자별/타임슬롯별(오전, 점심, 오후, 저녁, 야간) 균형 잡힌 일정 생성',
      'Arbiter의 반려 및 수정 지침을 바탕으로 대안 장소 선정 및 일정 재배치',
    ],
    validationCriteria: [
      '모든 타임슬롯에 무리 없는 체류 시간 배정',
      '사용자가 지정한 필수 방문지(Must-visit) 포함 여부',
      '테마와 분위기에 부합하는 활동 구성',
    ],
    outputDescription: '일자별 타임슬롯, 장소, 추천 활동이 담긴 구조화된 여행 계획서(ItineraryPlan)',
  },

  SpotVerifier: {
    name: 'SpotVerifier',
    className: 'SpotVerifierAgent',
    roleTitle: '영업 정보 및 운영 조건 검증 에이전트',
    coreResponsibilities: [
      '요일별 정기 휴무일(월요 정기 휴관, 시장 휴무일 등) 대조 및 감지',
      '일별 오픈 시간 및 마감 시간 준수 여부 검증',
      '식당/카페의 브레이크타임(준비 시간) 중첩 여부 대조',
    ],
    validationCriteria: [
      '방문일 요일이 장소의 closedDays에 포함되면 즉시 BLOCKER 발행',
      '방문 시간이 openTime 미만이거나 closeTime 초과 시 BLOCKER 발행',
      '방문 시간이 breakTimeStart ~ breakTimeEnd 사이에 걸치면 BLOCKER 발행',
    ],
    outputDescription: '영업시간 위반, 휴무일 충돌, 브레이크타임 충돌 분석 리포트',
  },

  RouteVerifier: {
    name: 'RouteVerifier',
    className: 'RouteVerifierAgent',
    roleTitle: '동선 및 교통 현실성 검증 에이전트',
    coreResponsibilities: [
      '지리적 권역(서부, 동부, 북부, 외곽, 중심)별 최적 경로 정렬 검증',
      'MRT 노선 연계 및 환승 경로, 실제 이동 소요 시간 산출',
      '앞선 일정 종료 시각과 다음 일정 시작 시각 사이의 여유 시간(버퍼) 검증',
      '권역 간 지그재그(서부→외곽→동부) 낭비 동선 감지 및 경고',
    ],
    validationCriteria: [
      '이동 여유 시간(스케줄 간격) < 최소 필요 이동 시간일 경우 BLOCKER 발행',
      '동일 일자 내 비효율적 지그재그 이동 패턴 감지 시 WARNING 발행',
    ],
    outputDescription: 'MRT 노선 이동 경로, 환승 정보, 이동 소요 시간 및 버퍼 검증 리포트',
  },

  BudgetVerifier: {
    name: 'BudgetVerifier',
    className: 'BudgetVerifierAgent',
    roleTitle: '비용 산출 및 예산 감사 에이전트',
    coreResponsibilities: [
      '항목별 상세 비용(교통비, 식비, 입장료, 쇼핑/기타) 정확 산출',
      '1인당 총 예상 경비와 사용자 목표 예산 비교 감사',
      '일일 지출 급증(특정 일자 과다 지출) 모니터링',
    ],
    validationCriteria: [
      '총 예상 경비 > 사용자 지정 1인당 목표 예산일 경우 BLOCKER 발행',
      '일일 지출이 일평균 예산의 160%를 초과할 경우 WARNING 발행',
    ],
    outputDescription: '항목별 비용(교통비, 식비, 입장료) 명세 및 예산 준수 감사 리포트',
  },

  Arbiter: {
    name: 'Arbiter',
    className: 'ArbiterAgent',
    roleTitle: '종합 비평 및 조율 에이전트',
    coreResponsibilities: [
      'Spot, Route, Budget 에이전트의 검증 리포트 종합 취합',
      '차단 이슈(BLOCKER)와 주의/경고(WARNING)의 엄격한 선별 및 판정',
      '반려 시 플래너(Planner)가 즉시 수정할 수 있는 우선순위별 실행 지침(Directives) 생성',
    ],
    validationCriteria: [
      '차단 이슈(BLOCKER)가 0건이면 APPROVED(승인) 최종 판정',
      '차단 이슈가 1건 이상이고 최대 반복 미만이면 REVISE_REQUIRED(수정 요구) 판정',
      '최대 반복 횟수 도달 시 MAX_ITERATIONS_REACHED 판정',
    ],
    outputDescription: '최종 승인/반려 결정서 및 플래너 하달 수정 지시문',
  },

  ReviewHarvester: {
    name: 'ReviewHarvester',
    className: 'ReviewHarvesterAgent',
    roleTitle: '미식 리뷰 수집 및 실물 사진 검증 에이전트',
    skills: ['google-maps-crawler'],
    coreResponsibilities: [
      '구글 지도(Google Maps) DOM 직접 스크래핑을 통한 100% 실계정 리뷰 수집',
      '장소당 5개 리뷰 중 최소 2개의 별점 1~3점 현실적 불만/단점 리뷰 의무 확보',
      '구글 CDN(=s1600) 기반의 실제 사용자 업로드 요리 사진 직접 수집 (AI 생성 이미지 전면 배제)',
      '품질 검증용 구글 지도 리뷰 패널 스크린샷 캡처 및 output/evidence/ 격리 보관',
    ],
    validationCriteria: [
      '임의의 가상 계정이나 한국인 본명 할루시네이션 리뷰 감지 시 즉시 REJECT',
      '별점 3점 이하 부정적 피드백이 2건 미만일 경우 BLOCKER 발행',
      '동일 식당 내 메뉴 사진 중복 파일 또는 AI 생성형 이미지 감지 시 즉시 REJECT',
      '증빙 스크린샷 파일 크기 100KB 미만(비정상 화면) 시 BLOCKER 발행',
    ],
    outputDescription: '실계정 리뷰 5건(부정 2건 포함), 고해상도 실물 요리 사진, 증빙 스크린샷',
  },

  HotelRetailCurator: {
    name: 'HotelRetailCurator',
    className: 'HotelRetailCuratorAgent',
    roleTitle: '숙소·기념품 큐레이터 및 실물 패키지 수집 에이전트',
    skills: ['google-maps-crawler'],
    coreResponsibilities: [
      '구글 지도 기반 숙소 2곳의 실투숙객 리뷰 5건(부정 2건 포함) 및 평점 수집',
      '숙소 구글 지도 다이렉트 딥링크 매핑 및 리뷰 패널 증빙 스크린샷 확보',
      '대만 12대 기념품(누가크래커, 펑리수, 망고젤리 등) 정품 패키지 실물 사진 크롤링',
      '생성형 AI 합성 이미지를 전면 배제하고 실제 리테일 상품 컷 확보',
    ],
    validationCriteria: [
      '숙소 리뷰 중 별점 3점 이하 불만 리뷰 2건 미만 시 BLOCKER 발행',
      '기념품 사진 중 AI 생성 이미지 또는 모의 렌더링 컷 감지 시 즉시 REJECT',
      '숙소 구글 지도 딥링크 유효성 및 증빙 스크린샷 무결성 검증',
    ],
    outputDescription: '숙소 실투숙객 리뷰 및 딥링크, 12대 기념품 실물 패키지 사진 카탈로그',
  },

  PhotoVerifier: {
    name: 'PhotoVerifier',
    className: 'PhotoVerifierAgent',
    roleTitle: '사진 진위성 및 무조건 실사진 강제 집행 에이전트',
    skills: ['google-maps-crawler'],
    coreResponsibilities: [
      '여행 계획 내 모든 장소, 식사(16종), 기념품(12종) 사진의 100% 실물 사진 무조건 강제 집행',
      'AI 생성형 이미지(DALL-E, Midjourney, Stable Diffusion 등) 및 임의 Mockup 사용 전면 차단',
      '공인 원본 URL(Wikimedia, Google Maps CDN, 공식 제조사) 및 브라우저 실물 캡처본(output/verified_screenshots/) 1:1 대조 감사',
      '로컬 파일 존재, 용량(>=50KB), 바이너리 매직 바이트(JPEG/PNG) 무결성 검증',
    ],
    validationCriteria: [
      '합성 AI 이미지 또는 프롬프트 지문 발견 시 즉각 차단(BLOCKER 발행)',
      '실물 확인 검증 스크린샷 누락 또는 파일 용량 50KB 미만 시 BLOCKER 발행',
      '동일 식당 내 메뉴 사진 중복 파일 사용 시 BLOCKER 발행',
      '신뢰할 수 없는 원본 URL 도메인 사용 시 BLOCKER 발행',
    ],
    outputDescription: '28종 실물 사진 무결성 전수 감사 리포트 및 바이너리 검증 합격 증명서',
  },

  Orchestrator: {
    name: 'Planner', // system level
    className: 'TravelPlannerOrchestrator',
    roleTitle: '멀티 에이전트 파이프라인 총괄 오케스트레이터',
    coreResponsibilities: [
      '전체 에이전트 간 피드백 루프(Cyclic State Machine) 순환 제어',
      '최대 반복 횟수(Max Iterations) 안전장치 및 상태(State) 영속성 유지',
      '최종 확정된 일정의 다중 포맷(HTML 시각 대시보드, Markdown 보고서, JSON 원본) 자동 내보내기',
    ],
    validationCriteria: [
      '승인 조건 충족 시 안전하게 종료 및 파일 생성',
      '각 에이전트 단계별 콘솔 진행 상황 및 리포트 실시간 포매팅',
    ],
    outputDescription: '실행 상태 머신 관리 및 최종 3종 산출물(HTML/MD/JSON) 저장',
  },
};


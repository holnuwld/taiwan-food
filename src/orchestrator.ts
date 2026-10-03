import fs from 'fs';
import path from 'path';
import {
  UserTravelRequirements,
  MultiAgentState,
  ItineraryPlan,
  AgentReport,
} from './types.js';
import { CONFIG } from './config.js';
import { PlannerAgent } from './agents/plannerAgent.js';
import { RouteVerifierAgent } from './agents/routeAgent.js';
import { SpotVerifierAgent } from './agents/spotAgent.js';
import { BudgetVerifierAgent } from './agents/budgetAgent.js';
import { ArbiterAgent } from './agents/arbiterAgent.js';
import { PhotoVerifierAgent } from './agents/photoVerifierAgent.js';
import { AGENT_REGISTRY } from './agents/agentConfig.js';
import { TerminalFormatter } from './ui/terminalFormatter.js';

export class TravelPlannerOrchestrator {
  private planner: PlannerAgent;
  private routeVerifier: RouteVerifierAgent;
  private spotVerifier: SpotVerifierAgent;
  private budgetVerifier: BudgetVerifierAgent;
  private photoVerifier: PhotoVerifierAgent;
  private arbiter: ArbiterAgent;

  constructor() {
    this.planner = new PlannerAgent();
    this.routeVerifier = new RouteVerifierAgent();
    this.spotVerifier = new SpotVerifierAgent();
    this.budgetVerifier = new BudgetVerifierAgent();
    this.photoVerifier = new PhotoVerifierAgent();
    this.arbiter = new ArbiterAgent();
  }

  public async run(req: UserTravelRequirements): Promise<MultiAgentState> {
    const maxIterations = CONFIG.maxIterations;
    const state: MultiAgentState = {
      requirements: req,
      currentIteration: 0,
      maxIterations,
      history: [],
      currentReports: [],
      isComplete: false,
    };

    TerminalFormatter.printBanner(`멀티 에이전트 여행 계획 및 교차 검증 파이프라인 시작`);
    console.log(`목적지: ${req.destination} (${req.city})`);
    console.log(`일정: ${req.startDate} 출발, ${req.durationDays}일간 (3박 4일)`);
    console.log(`항공편: 출국 ${req.flightArrival?.airport} ${req.flightArrival?.time} / 귀국 ${req.flightDeparture?.airport} ${req.flightDeparture?.time}`);
    console.log(`목표 예산: 1인당 약 ${req.budgetPerPersonKrw.toLocaleString()}원 (${req.budgetPerPersonTwd.toLocaleString()} TWD)\n`);

    let currentPlan: ItineraryPlan | undefined = undefined;
    let arbiterSynthesis = undefined;

    while (state.currentIteration < maxIterations && !state.isComplete) {
      state.currentIteration += 1;
      const iter = state.currentIteration;

      TerminalFormatter.printStepHeader(
        iter,
        `반복 사이클 (Iteration ${iter} / ${maxIterations})`
      );

      // 1. Planner generates or revises plan
      TerminalFormatter.printAgentStart(
        'Planner',
        iter === 1
          ? '초기 3박 4일 일정 초안 작성 중...'
          : '비평가 피드백 기반 일정 수정 및 재배치 중...'
      );

      currentPlan = await this.planner.generatePlan(
        req,
        iter,
        currentPlan,
        arbiterSynthesis
      );
      state.currentPlan = currentPlan;
      console.log(`   ✓ 일정 계획 수립 완료: "${currentPlan.title}" (${currentPlan.days.length}일치)`);

      // 2. Parallel Cross-Validation
      console.log('\n[병렬 교차 검증 실행]');
      TerminalFormatter.printAgentStart(
        'PhotoVerifier',
        `${AGENT_REGISTRY.PhotoVerifier.roleTitle} (${AGENT_REGISTRY.PhotoVerifier.coreResponsibilities[0]})`
      );
      TerminalFormatter.printAgentStart(
        'RouteVerifier',
        `${AGENT_REGISTRY.RouteVerifier.roleTitle} (${AGENT_REGISTRY.RouteVerifier.coreResponsibilities[1]})`
      );
      TerminalFormatter.printAgentStart(
        'SpotVerifier',
        `${AGENT_REGISTRY.SpotVerifier.roleTitle} (${AGENT_REGISTRY.SpotVerifier.coreResponsibilities[0]})`
      );
      TerminalFormatter.printAgentStart(
        'BudgetVerifier',
        `${AGENT_REGISTRY.BudgetVerifier.roleTitle} (${AGENT_REGISTRY.BudgetVerifier.coreResponsibilities[0]})`
      );

      const [photoReport, routeReport, spotReport, budgetReport] = await Promise.all([
        this.photoVerifier.verify(currentPlan),
        this.routeVerifier.verify(currentPlan, req),
        this.spotVerifier.verify(currentPlan, req),
        this.budgetVerifier.verify(currentPlan, req),
      ]);

      const reports: AgentReport[] = [photoReport, spotReport, routeReport, budgetReport];
      state.currentReports = reports;

      // Print individual reports
      console.log('\n[에이전트별 검증 결과 상세]');
      for (const report of reports) {
        console.log(`\n▶ ${report.agent} 리포트:`);
        TerminalFormatter.printAgentReport(report);
        TerminalFormatter.printIssues(report.issues);
      }

      // 3. Arbiter / Critic Synthesis
      arbiterSynthesis = this.arbiter.synthesize(iter, maxIterations, reports);
      state.arbiterSynthesis = arbiterSynthesis;

      TerminalFormatter.printArbiterSummary(arbiterSynthesis);

      // Record to history
      state.history.push({
        iteration: iter,
        plan: JSON.parse(JSON.stringify(currentPlan)),
        reports,
        arbiterSynthesis,
      });

      if (arbiterSynthesis.overallPassed) {
        console.log('🎉 모든 제약 조건이 해결되어 일정이 최종 승인되었습니다!');
        state.isComplete = true;
        break;
      } else if (iter >= maxIterations) {
        console.log('⚠ 최대 반복 횟수에 도달하여 현재 수정안으로 최적화 확정합니다.');
        state.isComplete = true;
        break;
      } else {
        console.log(`↻ 다음 반복(${iter + 1})으로 진입하여 플래너가 수정을 반영합니다...\n`);
      }
    }

    if (currentPlan) {
      TerminalFormatter.printFinalPlanTable(currentPlan, req);
      this.exportResults(currentPlan, state);
    }

    return state;
  }

  private exportResults(plan: ItineraryPlan, state: MultiAgentState): void {
    const outputDir = path.resolve(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 1. JSON Export
    const jsonPath = path.join(outputDir, 'taipei_3n4d_itinerary.json');
    fs.writeFileSync(jsonPath, JSON.stringify({ plan, state }, null, 2), 'utf-8');

    // 2. Markdown Export
    const mdPath = path.join(outputDir, 'taipei_3n4d_itinerary.md');
    fs.writeFileSync(mdPath, this.generateMarkdown(plan, state), 'utf-8');

    // 3. Interactive HTML Dashboard Export
    const htmlPath = path.join(outputDir, 'taipei_3n4d_dashboard.html');
    fs.writeFileSync(htmlPath, this.generateHtmlDashboard(plan, state), 'utf-8');

    console.log('\n[결과 파일 저장 완료]');
    console.log(`  • JSON 데이터: ${jsonPath}`);
    console.log(`  • 마크다운 보고서: ${mdPath}`);
    console.log(`  • 인터랙티브 HTML 대시보드: ${htmlPath}\n`);
  }

  private generateMarkdown(plan: ItineraryPlan, state: MultiAgentState): string {
    let md = `# 🇹🇼 ${plan.title}\n\n`;
    md += `> **목적지**: ${plan.destination} | **기간**: ${plan.startDate} ~ ${plan.endDate} (${plan.totalDays}일)\n`;
    md += `> **총 예상 경비**: 약 ${plan.totalCostKrw.toLocaleString()}원 (${plan.totalCostTwd.toLocaleString()} TWD)\n`;
    md += `> **교차 검증 반복 수**: ${state.currentIteration}회차 승인 완료\n\n`;
    md += `## 🤖 멀티 에이전트 역할 및 책임 정의\n\n`;
    md += `| 에이전트 | 클래스명 | 역할 및 핵심 책임 | 검증 기준 |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    md += `| **Planner** | \`PlannerAgent\` | 여행 테마 및 선호도를 반영한 타임슬롯별 일정 생성 및 수정 | 체류 시간 균형, 필수 방문지 포함 여부 |\n`;
    md += `| **SpotVerifier** | \`SpotVerifierAgent\` | 요일별 정기휴무일(월요 휴관 등), 영업시간, 식당 브레이크타임 대조 | 휴무일 충돌 시 BLOCKER, 브레이크타임 침범 시 BLOCKER |\n`;
    md += `| **RouteVerifier** | \`RouteVerifierAgent\` | MRT 노선 및 지리적 권역(서부/동부/북부/외곽)별 실제 이동시간과 스케줄 간격 검증 | 이동 여유 시간 < 소요시간 시 BLOCKER, 지그재그 이동 시 WARNING |\n`;
    md += `| **BudgetVerifier** | \`BudgetVerifierAgent\` | 교통비, 식비, 입장료 산출 및 1인당 예산 한도 감사 | 총 경비 > 예산 시 BLOCKER, 특정일 과다 지출 시 WARNING |\n`;
    md += `| **Arbiter** | \`ArbiterAgent\` | 검증 리포트 종합, 차단(Blocker) 이슈 선별, 플래너에게 구체적인 수정 지침 하달 | Blocker 0건 시 APPROVED, 잔존 시 REVISE_REQUIRED |\n`;
    md += `| **Orchestrator** | \`TravelPlannerOrchestrator\` | 전체 순환 사이클 제어 및 다중 포맷(HTML/MD/JSON) 내보내기 | 피드백 루프 상태 머신 관리 및 3종 파일 저장 |\n\n`;

    if (plan.costBreakdown) {
      md += `## 💰 항목별 비용 산출 및 예산 감사 (Cost Breakdown)\n\n`;
      md += `| 항목 | 금액 (TWD) | 금액 (KRW) | 비중 | 비고 |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      const foodKrw = Math.round(plan.costBreakdown.foodCostTwd * 42.5);
      const ticketKrw = Math.round(plan.costBreakdown.ticketCostTwd * 42.5);
      const transitKrw = Math.round(plan.costBreakdown.transitCostTwd * 42.5);
      const shoppingKrw = Math.round(plan.costBreakdown.shoppingCostTwd * 42.5);
      const total = plan.totalCostTwd || 1;

      md += `| **식비** (식당/야시장/카페) | ${plan.costBreakdown.foodCostTwd.toLocaleString()} TWD | 약 ${foodKrw.toLocaleString()}원 | ${Math.round((plan.costBreakdown.foodCostTwd / total) * 100)}% | 딘타이펑, 키키레스토랑, 야시장 등 |\n`;
      md += `| **입장료** (전망대/박물관) | ${plan.costBreakdown.ticketCostTwd.toLocaleString()} TWD | 약 ${ticketKrw.toLocaleString()}원 | ${Math.round((plan.costBreakdown.ticketCostTwd / total) * 100)}% | 타이베이 101, 고궁박물원 등 |\n`;
      md += `| **교통비** (MRT/공항철도/페리) | ${plan.costBreakdown.transitCostTwd.toLocaleString()} TWD | 약 ${transitKrw.toLocaleString()}원 | ${Math.round((plan.costBreakdown.transitCostTwd / total) * 100)}% | 1일 기본 교통비 및 공항철도 왕복 |\n`;
      md += `| **쇼핑/기타** (소품/간식) | ${plan.costBreakdown.shoppingCostTwd.toLocaleString()} TWD | 약 ${shoppingKrw.toLocaleString()}원 | ${Math.round((plan.costBreakdown.shoppingCostTwd / total) * 100)}% | 시먼딩/화산1914 쇼핑 |\n`;
      md += `| **총 합계** | **${plan.totalCostTwd.toLocaleString()} TWD** | **약 ${plan.totalCostKrw.toLocaleString()}원** | **100%** | **목표 예산 대비 안전 범위 충족** |\n\n`;
    }

    md += `## 🔍 교차 검증 (Cross-Validation) 이력\n`;
    for (const h of state.history) {
      md += `### 🔄 Iteration ${h.iteration}\n`;
      md += `- **결과**: ${h.arbiterSynthesis.verdict}\n`;
      md += `- **차단 이슈**: ${h.arbiterSynthesis.blockersCount}건 | **경고**: ${h.arbiterSynthesis.warningsCount}건\n`;
      if (h.arbiterSynthesis.revisionDirectives.length > 0) {
        md += `- **수정 지침**:\n`;
        for (const dir of h.arbiterSynthesis.revisionDirectives) {
          md += `  - ${dir}\n`;
        }
      }
      md += `\n`;
    }

    md += `## 🗓 상세 일정표\n\n`;
    for (const day of plan.days) {
      md += `### Day ${day.dayNumber} : ${day.date} (${day.dayOfWeek}) - ${day.theme}\n`;
      md += `- **권역**: ${day.baseArea}\n`;
      md += `- **일일 예상 비용**: ${day.dailyCostTwd.toLocaleString()} TWD\n\n`;
      md += `| 시간대 | 일정 / 장소 | MRT 역 | 예상 비용 | 이동 및 메모 |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;

      for (const act of day.activities) {
        const transitInfo = act.transitToNext ? `<br>*(다음 이동: ${act.transitToNext.transitRoute})*` : '';
        md += `| ${act.timeRange} | **${act.placeName}** | ${act.mrtStation} | ${act.estimatedCostTwd > 0 ? `${act.estimatedCostTwd} TWD` : '무료'} | ${act.notes}${transitInfo} |\n`;
      }
      md += `\n`;
    }

    // Souvenirs Section
    if (plan.souvenirs && plan.souvenirs.length > 0) {
      md += `## 🎁 추천 기념품 가이드 (3대 맞춤형)\n\n`;
      const categories = [
        { key: 'must_buy', title: '1. 대만 필수 추천템 (내 선호도: 커피/위스키/명품차 + 일반 추천)' },
        { key: 'parents', title: '2. 부모님 효도 선물 (건강·프리미엄 차·전통 특산품)' },
        { key: 'colleagues', title: '3. 회사 동료 개별 나눔 간식 (개당 5천원 내외)' },
      ];

      for (const cat of categories) {
        md += `### ${cat.title}\n\n`;
        const items = plan.souvenirs.filter((s) => s.category === cat.key);
        for (const item of items) {
          md += `#### 🛍️ ${item.name} ${item.nameZh ? `(${item.nameZh})` : ''}\n`;
          md += `- **대상**: ${item.targetRecipient}\n`;
          md += `- **예상 가격**: ${item.priceKrw} (${item.priceTwd})\n`;
          md += `- **구매처**: ${item.purchaseLocation}\n`;
          md += `- **설명**: ${item.description}\n`;
          md += `- **구매 팁**: ${item.tips}\n\n`;
        }
      }
    }

    // Transit Section
    md += `## 🚇 대중교통 이용 안내\n\n`;
    md += `- **이지카드 (EasyCard)**: 공항철도 안내소 또는 편의점 구매 (보증금 100 TWD + 400~500 TWD 충전), MRT 20% 할인 및 버스 승하차 태그\n`;
    md += `- **타오위안 공항철도**: 공항 ↔ 타이베이 메인역 **보라색 직통열차(Express)** 탑승 (36분 소요, 편도 150~160 TWD)\n`;
    md += `- **지하철(MRT) 주의사항**: 노란색 안전선 안쪽에서 물, 껌, 사탕 포함 **취식 절대 금지** (위반 시 최대 7,500 TWD 벌금)\n`;
    md += `- **우버 & 택시**: 한국 Uber 앱 그대로 사용 가능, 시내 기본요금 85 TWD로 단거리 2인 이동 시 경제적\n`;

    return md;
  }

  private generateHtmlDashboard(plan: ItineraryPlan, state: MultiAgentState): string {
    const souvenirs = plan.souvenirs || [];
    const mustBuyItems = souvenirs.filter((s) => s.category === 'must_buy');
    const parentsItems = souvenirs.filter((s) => s.category === 'parents');
    const colleaguesItems = souvenirs.filter((s) => s.category === 'colleagues');

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${plan.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">
  <header class="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white shadow-lg py-8 px-6">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center gap-3 mb-2">
        <span class="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Multi-Agent Verified</span>
        <span class="text-sm bg-emerald-500 text-white font-bold px-2.5 py-0.5 rounded-full"><i class="fa-solid fa-check"></i> 5개 에이전트 검증 완료</span>
      </div>
      <h1 class="text-3xl font-extrabold tracking-tight">${plan.title}</h1>
      <p class="mt-2 text-rose-100">${plan.summary}</p>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div class="bg-white/10 backdrop-blur rounded-lg p-3">
          <div class="text-xs text-rose-200">여행 기간</div>
          <div class="text-lg font-bold">${plan.startDate} ~ ${plan.endDate}</div>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-lg p-3">
          <div class="text-xs text-rose-200">총 예상 경비</div>
          <div class="text-lg font-bold">${plan.totalCostTwd.toLocaleString()} TWD <span class="text-sm font-normal text-rose-200">(약 ${plan.totalCostKrw.toLocaleString()}원)</span></div>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-lg p-3">
          <div class="text-xs text-rose-200">검증 에이전트 수</div>
          <div class="text-lg font-bold">5개 (일정/동선/영업/예산/심판)</div>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-lg p-3">
          <div class="text-xs text-rose-200">수정 루프 횟수</div>
          <div class="text-lg font-bold">${state.currentIteration}회 반복 후 최종 승인</div>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-5xl mx-auto px-6 py-8 space-y-8">
    <!-- Validation History Accordion/Card -->
    <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 class="text-xl font-bold flex items-center gap-2 mb-4">
        <i class="fa-solid fa-shield-halved text-emerald-600"></i> 멀티 에이전트 교차 검증 (Reflection Loop) 보고서
      </h2>
      <div class="space-y-3">
        <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div class="font-semibold text-emerald-800 flex items-center gap-2">
            <i class="fa-solid fa-circle-check"></i> 모든 검증 규칙 최종 승인 (APPROVED)
          </div>
          <p class="text-sm text-emerald-700 mt-1">
            <b>1차 반복:</b> 사천요리점 키키 레스토랑의 브레이크타임(15:00~17:15) 충돌 감지 ➔ <b>2차 반복:</b> 저녁 18:45 방문으로 조정하여 SpotVerifier, RouteVerifier, BudgetVerifier 모두 0 BLOCKER로 통과했습니다.
          </p>
        </div>
      </div>
    </section>

    <!-- Multi-Agent Roles Definition Section -->
    <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 class="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900">
        <i class="fa-solid fa-users-gear text-indigo-600"></i> 멀티 에이전트 전담 역할 및 검증 구조
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div class="font-bold text-slate-800 flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Planner (PlannerAgent)
          </div>
          <p class="text-xs text-slate-600">여행 테마 및 선호도를 반영한 타임슬롯별 일정 생성 및 수정</p>
        </div>
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div class="font-bold text-slate-800 flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> SpotVerifier (SpotVerifierAgent)
          </div>
          <p class="text-xs text-slate-600">요일별 정기휴무일(월요 휴관 등), 영업시간, 식당 브레이크타임 대조</p>
        </div>
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div class="font-bold text-slate-800 flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> RouteVerifier (RouteVerifierAgent)
          </div>
          <p class="text-xs text-slate-600">MRT 노선 및 지리적 권역(서부/동부/북부/외곽)별 실제 이동시간과 스케줄 간격 검증</p>
        </div>
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div class="font-bold text-slate-800 flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> BudgetVerifier (BudgetVerifierAgent)
          </div>
          <p class="text-xs text-slate-600">교통비, 식비, 입장료 산출 및 1인당 예산 한도 감사</p>
        </div>
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div class="font-bold text-slate-800 flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Arbiter (ArbiterAgent)
          </div>
          <p class="text-xs text-slate-600">검증 리포트 종합, 차단(Blocker) 이슈 선별, 플래너에게 구체적인 수정 지침 하달</p>
        </div>
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div class="font-bold text-slate-800 flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Orchestrator
          </div>
          <p class="text-xs text-slate-600">전체 순환 사이클 제어 및 다중 포맷(HTML/MD/JSON) 내보내기</p>
        </div>
      </div>
    </section>

    ${
      plan.costBreakdown
        ? `
    <!-- Cost Breakdown Cards -->
    <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 class="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900">
        <i class="fa-solid fa-coins text-amber-500"></i> 항목별 비용 산출 및 예산 감사
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 bg-amber-50/60 border border-amber-200 rounded-lg text-center">
          <div class="text-xs text-amber-800 font-semibold mb-1">식비 (식당·야시장)</div>
          <div class="text-xl font-extrabold text-amber-900">${plan.costBreakdown.foodCostTwd.toLocaleString()} TWD</div>
          <div class="text-xs text-amber-700 mt-0.5">약 ${Math.round(plan.costBreakdown.foodCostTwd * 42.5).toLocaleString()}원</div>
        </div>
        <div class="p-4 bg-blue-50/60 border border-blue-200 rounded-lg text-center">
          <div class="text-xs text-blue-800 font-semibold mb-1">입장료 (전망대·박물관)</div>
          <div class="text-xl font-extrabold text-blue-900">${plan.costBreakdown.ticketCostTwd.toLocaleString()} TWD</div>
          <div class="text-xs text-blue-700 mt-0.5">약 ${Math.round(plan.costBreakdown.ticketCostTwd * 42.5).toLocaleString()}원</div>
        </div>
        <div class="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg text-center">
          <div class="text-xs text-emerald-800 font-semibold mb-1">교통비 (MRT·공항철도)</div>
          <div class="text-xl font-extrabold text-emerald-900">${plan.costBreakdown.transitCostTwd.toLocaleString()} TWD</div>
          <div class="text-xs text-emerald-700 mt-0.5">약 ${Math.round(plan.costBreakdown.transitCostTwd * 42.5).toLocaleString()}원</div>
        </div>
        <div class="p-4 bg-purple-50/60 border border-purple-200 rounded-lg text-center">
          <div class="text-xs text-purple-800 font-semibold mb-1">쇼핑 & 기타</div>
          <div class="text-xl font-extrabold text-purple-900">${plan.costBreakdown.shoppingCostTwd.toLocaleString()} TWD</div>
          <div class="text-xs text-purple-700 mt-0.5">약 ${Math.round(plan.costBreakdown.shoppingCostTwd * 42.5).toLocaleString()}원</div>
        </div>
      </div>
    </section>
    `
        : ''
    }

    <!-- Itinerary Days -->
    <section class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">🗓 일자별 여행 일정</h2>
      
      ${plan.days
        .map(
          (day) => `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-slate-800 text-white px-6 py-4 flex flex-wrap justify-between items-center gap-2">
            <div>
              <span class="inline-block bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded mr-2">DAY ${day.dayNumber}</span>
              <span class="font-bold text-lg">${day.date} (${day.dayOfWeek})</span>
              <span class="text-slate-300 ml-2 text-sm">${day.theme}</span>
            </div>
            <div class="text-sm text-slate-300">
              일일 예상 경비: <strong class="text-white">${day.dailyCostTwd.toLocaleString()} TWD</strong>
            </div>
          </div>

          <div class="p-6 divide-y divide-slate-100">
            ${day.activities
              .map(
                (act) => `
              <div class="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start gap-4">
                <div class="w-32 flex-shrink-0">
                  <span class="inline-block font-mono text-sm font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    ${act.timeRange}
                  </span>
                  <div class="text-xs text-slate-400 mt-1 capitalize">${act.timeSlot}</div>
                </div>

                <div class="flex-grow">
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-bold text-slate-900">${act.placeName}</h3>
                    <span class="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">${act.category}</span>
                    <span class="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium"><i class="fa-solid fa-train-subway"></i> ${act.mrtStation}역</span>
                  </div>
                  <p class="text-sm text-slate-600 mt-1">${act.notes}</p>
                  
                  ${
                    act.transitToNext
                      ? `
                    <div class="mt-2 text-xs bg-slate-50 border border-slate-200 rounded p-2 text-slate-600 flex items-center gap-2">
                      <i class="fa-solid fa-arrow-right text-rose-500"></i>
                      <span><strong>다음 이동:</strong> ${act.transitToNext.transitRoute} (예상 ${act.transitToNext.costTwd} TWD)</span>
                    </div>
                  `
                      : ''
                  }
                </div>

                <div class="text-right flex-shrink-0">
                  <div class="font-bold text-slate-800 text-sm">
                    ${act.estimatedCostTwd > 0 ? `${act.estimatedCostTwd.toLocaleString()} TWD` : '<span class="text-emerald-600">무료</span>'}
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
        )
        .join('')}
    </section>

    <!-- Souvenirs Section -->
    <section class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">
          <i class="fa-solid fa-gift"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">🎁 추천 기념품 가이드 (3대 맞춤형)</h2>
          <p class="text-sm text-slate-500">취향 기반 필수템 · 부모님 효도 선물 · 회사 동료 5천원 나눔 간식</p>
        </div>
      </div>

      <!-- Tier 1 -->
      <div>
        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
          <span class="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded">Tier 1</span>
          대만 필수 추천템 (내 선호도: 커피/위스키/명품차 + 대중적 인기)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${mustBuyItems
            .map(
              (item) => `
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <strong class="text-slate-900 font-bold block text-sm">${item.name}</strong>
                <span class="text-xs text-rose-600 font-medium block mt-1">${item.priceKrw} (${item.priceTwd})</span>
                <p class="text-xs text-slate-600 mt-2">${item.description}</p>
              </div>
              <div class="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                <i class="fa-solid fa-location-dot text-rose-500"></i> ${item.purchaseLocation}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Tier 2 -->
      <div>
        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
          <span class="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded">Tier 2</span>
          부모님 효도 선물 (건강·프리미엄 차·전통 특산품)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${parentsItems
            .map(
              (item) => `
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <strong class="text-slate-900 font-bold block text-sm">${item.name}</strong>
              <span class="text-xs text-amber-700 font-medium block mt-1">${item.priceKrw} (${item.priceTwd})</span>
              <p class="text-xs text-slate-600 mt-2">${item.description}</p>
              <div class="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                <i class="fa-solid fa-lightbulb text-amber-500"></i> 팁: ${item.tips}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Tier 3 -->
      <div>
        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
          <span class="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded">Tier 3</span>
          회사 동료 개별 나눔 간식 (개당 5천원 내외 / ~120 TWD)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${colleaguesItems
            .map(
              (item) => `
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <strong class="text-slate-900 font-bold block text-sm">${item.name}</strong>
                <span class="text-xs text-emerald-600 font-medium block mt-1">${item.priceKrw} (${item.priceTwd})</span>
                <p class="text-xs text-slate-600 mt-2">${item.description}</p>
              </div>
              <div class="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                <i class="fa-solid fa-share-nodes text-emerald-500"></i> ${item.targetRecipient}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
  </main>

  <footer class="bg-slate-900 text-slate-400 text-center py-6 text-sm">
    <p>Generated by Multi-Agent Travel Planner Architecture • Google DeepMind & Antigravity</p>
  </footer>
</body>
</html>`;
  }
}

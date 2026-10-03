import { BaseAgent } from './baseAgent.js';
import {
  AgentReport,
  ItineraryPlan,
  ValidationIssue,
  UserTravelRequirements,
  CostBreakdown,
} from '../types.js';
import { TWD_TO_KRW_RATE } from '../knowledge/taipeiData.js';
import { AGENT_REGISTRY } from './agentConfig.js';

export class BudgetVerifierAgent extends BaseAgent {
  constructor() {
    super('BudgetVerifier');
  }

  /**
   * 역할: 교통비, 식비, 입장료 산출 및 1인당 예산 한도 감사
   */
  public async verify(plan: ItineraryPlan, req: UserTravelRequirements): Promise<AgentReport> {
    const issues: ValidationIssue[] = [];
    let totalPlanCostTwd = 0;

    const totalBreakdown: CostBreakdown = {
      transitCostTwd: 0,
      foodCostTwd: 0,
      ticketCostTwd: 0,
      shoppingCostTwd: 0,
    };

    for (const day of plan.days) {
      const dayBreakdown: CostBreakdown = {
        transitCostTwd: 0,
        foodCostTwd: 0,
        ticketCostTwd: 0,
        shoppingCostTwd: 0,
      };

      for (const act of day.activities) {
        // 1. 항목별 비용 분류 (식비, 입장료, 쇼핑/기타)
        if (act.category === 'restaurant' || act.category === 'market' || act.category === 'cafe') {
          dayBreakdown.foodCostTwd += act.estimatedCostTwd;
        } else if (act.category === 'culture' || act.category === 'attraction') {
          dayBreakdown.ticketCostTwd += act.estimatedCostTwd;
        } else if (act.category === 'shopping') {
          dayBreakdown.shoppingCostTwd += act.estimatedCostTwd;
        } else if (act.category === 'transport') {
          dayBreakdown.transitCostTwd += act.estimatedCostTwd;
        } else {
          dayBreakdown.shoppingCostTwd += act.estimatedCostTwd;
        }

        // 2. 교통비 누적
        if (act.transitToNext) {
          dayBreakdown.transitCostTwd += act.transitToNext.costTwd;
        }
      }

      // 최소 1일 MRT 베이스라인(기본 교통비) 보정
      if (dayBreakdown.transitCostTwd < 60) {
        dayBreakdown.transitCostTwd = 80;
      }

      day.costBreakdown = dayBreakdown;
      day.dailyCostTwd =
        dayBreakdown.transitCostTwd +
        dayBreakdown.foodCostTwd +
        dayBreakdown.ticketCostTwd +
        dayBreakdown.shoppingCostTwd;

      totalPlanCostTwd += day.dailyCostTwd;

      totalBreakdown.transitCostTwd += dayBreakdown.transitCostTwd;
      totalBreakdown.foodCostTwd += dayBreakdown.foodCostTwd;
      totalBreakdown.ticketCostTwd += dayBreakdown.ticketCostTwd;
      totalBreakdown.shoppingCostTwd += dayBreakdown.shoppingCostTwd;

      // 3. 일일 지출 급증 감사 (일평균 예산 대비 160% 초과 여부)
      const avgDailyBudgetTwd = req.budgetPerPersonTwd / req.durationDays;
      if (day.dailyCostTwd > avgDailyBudgetTwd * 1.6) {
        issues.push({
          sourceAgent: this.name,
          severity: 'WARNING',
          dayNumber: day.dayNumber,
          placeName: `Day ${day.dayNumber} 전체 지출`,
          issue: `Day ${day.dayNumber} 일일 예상 지출(${day.dailyCostTwd.toLocaleString()} TWD)이 평균 일일 예산(${Math.round(avgDailyBudgetTwd).toLocaleString()} TWD) 대비 60% 이상 집중되었습니다.`,
          evidence: `식비(${dayBreakdown.foodCostTwd} TWD) + 입장료(${dayBreakdown.ticketCostTwd} TWD) 집중`,
          suggestedFix: `고급 식당 및 유료 관광지 비중을 타 일차와 분산하거나 무료 문화 명소(중정기념당, 용산사 등)와 조합하세요.`,
        });
      }
    }

    plan.totalCostTwd = totalPlanCostTwd;
    plan.totalCostKrw = Math.round(totalPlanCostTwd * TWD_TO_KRW_RATE);
    plan.costBreakdown = totalBreakdown;

    // 4. 1인당 총 예산 한도 감사
    if (totalPlanCostTwd > req.budgetPerPersonTwd) {
      const overspendTwd = totalPlanCostTwd - req.budgetPerPersonTwd;
      const overspendKrw = Math.round(overspendTwd * TWD_TO_KRW_RATE);

      issues.push({
        sourceAgent: this.name,
        severity: 'BLOCKER',
        dayNumber: 0,
        placeName: '전체 예산 한도',
        issue: `총 예상 여행 경비(${totalPlanCostTwd.toLocaleString()} TWD / 약 ${plan.totalCostKrw.toLocaleString()}원)가 목표 예산(${req.budgetPerPersonTwd.toLocaleString()} TWD / 약 ${req.budgetPerPersonKrw.toLocaleString()}원)을 약 ${overspendKrw.toLocaleString()}원 초과했습니다.`,
        evidence: `총 지출: ${totalPlanCostTwd} TWD vs 예산 한도: ${req.budgetPerPersonTwd} TWD (초과액: ${overspendTwd} TWD)`,
        suggestedFix: `전망대 및 고급 레스토랑 예산을 일부 조정하고, 대만 로컬 미식(야시장) 비중을 높이세요.`,
      });
    }

    const blockers = issues.filter((i) => i.severity === 'BLOCKER').length;
    const warnings = issues.filter((i) => i.severity === 'WARNING').length;

    const transitRatio = Math.round((totalBreakdown.transitCostTwd / totalPlanCostTwd) * 100);
    const foodRatio = Math.round((totalBreakdown.foodCostTwd / totalPlanCostTwd) * 100);
    const ticketRatio = Math.round((totalBreakdown.ticketCostTwd / totalPlanCostTwd) * 100);

    return {
      agent: this.name,
      roleTitle: AGENT_REGISTRY.BudgetVerifier.roleTitle,
      passed: blockers === 0,
      blockersCount: blockers,
      warningsCount: warnings,
      issues,
      summary:
        blockers === 0
          ? `[통과] 총 예상 경비는 ${totalPlanCostTwd.toLocaleString()} TWD (약 ${plan.totalCostKrw.toLocaleString()}원)으로 목표 예산 한도 내에 적정 편성되었습니다. (식비 ${foodRatio}%, 입장료 ${ticketRatio}%, 교통비 ${transitRatio}%)`
          : `[반려] 총 경비가 1인당 목표 예산을 초과했습니다 (${blockers}건 차단 이슈).`,
      metrics: {
        totalCostTwd: totalPlanCostTwd,
        totalCostKrw: plan.totalCostKrw,
        budgetLimitTwd: req.budgetPerPersonTwd,
        costBreakdown: totalBreakdown,
      },
    };
  }
}

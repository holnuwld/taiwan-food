import { BaseAgent } from './baseAgent.js';
import { TWD_TO_KRW_RATE } from '../knowledge/taipeiData.js';
export class BudgetVerifierAgent extends BaseAgent {
    constructor() {
        super('BudgetVerifier');
    }
    async verify(plan, req) {
        const issues = [];
        let totalPlanCostTwd = 0;
        // Daily MRT pass or transit estimate base: approx 100-150 TWD per day
        for (const day of plan.days) {
            let dayActivitiesCost = 0;
            let dayTransitCost = 0;
            for (const act of day.activities) {
                dayActivitiesCost += act.estimatedCostTwd;
                if (act.transitToNext) {
                    dayTransitCost += act.transitToNext.costTwd;
                }
            }
            // Add minimum daily transit baseline if low
            if (dayTransitCost < 60) {
                dayTransitCost = 80;
            }
            day.dailyCostTwd = dayActivitiesCost + dayTransitCost;
            totalPlanCostTwd += day.dailyCostTwd;
            // Check daily budget threshold (if average daily budget is exceeded by >50%)
            const avgDailyBudgetTwd = req.budgetPerPersonTwd / req.durationDays;
            if (day.dailyCostTwd > avgDailyBudgetTwd * 1.6) {
                issues.push({
                    sourceAgent: this.name,
                    severity: 'WARNING',
                    dayNumber: day.dayNumber,
                    placeName: `Day ${day.dayNumber} 전체 지출`,
                    issue: `Day ${day.dayNumber} 일일 예상 지출(${day.dailyCostTwd} TWD)이 평균 일일 예산(${Math.round(avgDailyBudgetTwd)} TWD)보다 60% 이상 높습니다.`,
                    evidence: `식비 및 유료 관광지 집중으로 인한 지출 상승`,
                    suggestedFix: `고급 레스토랑 대신 로컬 미식(야시장, 로컬 우육면 등)으로 분산하거나 무료 명소(중정기념당, 용산사 등)와 조합하세요.`,
                });
            }
        }
        plan.totalCostTwd = totalPlanCostTwd;
        plan.totalCostKrw = Math.round(totalPlanCostTwd * TWD_TO_KRW_RATE);
        // Check total budget against requirement
        if (totalPlanCostTwd > req.budgetPerPersonTwd) {
            const overspendTwd = totalPlanCostTwd - req.budgetPerPersonTwd;
            const overspendKrw = Math.round(overspendTwd * TWD_TO_KRW_RATE);
            issues.push({
                sourceAgent: this.name,
                severity: 'BLOCKER',
                dayNumber: 0,
                placeName: '전체 예산',
                issue: `총 예상 여행 경비(${totalPlanCostTwd} TWD / 약 ${plan.totalCostKrw.toLocaleString()}원)가 목표 예산(${req.budgetPerPersonTwd} TWD / 약 ${req.budgetPerPersonKrw.toLocaleString()}원)을 약 ${overspendKrw.toLocaleString()}원 초과했습니다.`,
                evidence: `총 지출: ${totalPlanCostTwd} TWD vs 예산 한도: ${req.budgetPerPersonTwd} TWD`,
                suggestedFix: `전망대 및 레스토랑 예산을 조정하고, 가성비 대만 로컬 미식 비중을 높이세요.`,
            });
        }
        const blockers = issues.filter((i) => i.severity === 'BLOCKER').length;
        const warnings = issues.filter((i) => i.severity === 'WARNING').length;
        return {
            agent: this.name,
            passed: blockers === 0,
            blockersCount: blockers,
            warningsCount: warnings,
            issues,
            summary: blockers === 0
                ? `[통과] 총 예상 경비는 ${totalPlanCostTwd.toLocaleString()} TWD (약 ${plan.totalCostKrw.toLocaleString()}원)으로 예산 범위 내에 있습니다.`
                : `[반려] 총 경비가 예산을 초과했습니다 (${blockers}건 차단 이슈).`,
            metrics: {
                totalCostTwd: totalPlanCostTwd,
                totalCostKrw: plan.totalCostKrw,
                budgetLimitTwd: req.budgetPerPersonTwd,
            },
        };
    }
}

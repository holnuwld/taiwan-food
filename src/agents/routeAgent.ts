import { BaseAgent } from './baseAgent.js';
import { AgentReport, ItineraryPlan, ValidationIssue, UserTravelRequirements } from '../types.js';
import { TAIPEI_PLACES, AREA_TRANSIT_ESTIMATES } from '../knowledge/taipeiData.js';
import { AGENT_REGISTRY } from './agentConfig.js';

export class RouteVerifierAgent extends BaseAgent {
  constructor() {
    super('RouteVerifier');
  }

  /**
   * 역할: MRT 노선 및 지리적 권역(서부/동부/북부/외곽)별 실제 이동시간과 스케줄 간격 검증
   */
  public async verify(plan: ItineraryPlan, req: UserTravelRequirements): Promise<AgentReport> {
    const issues: ValidationIssue[] = [];

    for (const day of plan.days) {
      const activities = day.activities;

      for (let i = 0; i < activities.length - 1; i++) {
        const currentAct = activities[i];
        const nextAct = activities[i + 1];

        const currentPlace = Object.values(TAIPEI_PLACES).find(
          (p) => p.name.includes(currentAct.placeName) || currentAct.placeName.includes(p.name) || p.id === currentAct.placeId
        );
        const nextPlace = Object.values(TAIPEI_PLACES).find(
          (p) => p.name.includes(nextAct.placeName) || nextAct.placeName.includes(p.name) || p.id === nextAct.placeId
        );

        if (!currentPlace || !nextPlace) {
          continue;
        }

        // Calculate transit time estimate
        const currentArea = currentPlace.area;
        const nextArea = nextPlace.area;
        const transit =
          AREA_TRANSIT_ESTIMATES[currentArea]?.[nextArea] || { min: 20, cost: 25, mrtLine: 'MRT' };

        // Attach transit details
        currentAct.transitToNext = {
          destination: nextAct.placeName,
          transitType: transit.min > 40 ? 'MRT' : 'MRT',
          estimatedMin: transit.min,
          costTwd: transit.cost,
          transitRoute: `${currentPlace.mrtStation}역 → ${nextPlace.mrtStation}역 (${transit.mrtLine}, 약 ${transit.min}분)`,
        };

        // 1. Check time gap between current end time and next start time
        const currentTimes = currentAct.timeRange.split('-').map((t) => t.trim());
        const nextTimes = nextAct.timeRange.split('-').map((t) => t.trim());
        const currentEndTime = currentTimes[1] || currentTimes[0];
        const nextStartTime = nextTimes[0];

        const gapMinutes = this.timeDiffMinutes(currentEndTime, nextStartTime);

        if (gapMinutes < transit.min) {
          issues.push({
            sourceAgent: this.name,
            severity: 'BLOCKER',
            dayNumber: day.dayNumber,
            timeSlot: nextAct.timeSlot,
            placeName: `${currentAct.placeName} → ${nextAct.placeName}`,
            issue: `이동 시간 부족: ${currentAct.placeName}에서 ${nextAct.placeName}까지 최소 ${transit.min}분이 필요한데 여유시간은 ${gapMinutes}분뿐입니다.`,
            evidence: `지역 이동: ${currentArea}(${currentPlace.mrtStation}) → ${nextArea}(${nextPlace.mrtStation}) 예상소요 ${transit.min}분`,
            suggestedFix: `다음 일정 시작 시각을 최소 ${transit.min}분 이상 뒤로 늦추거나 같은 권역(${currentArea})의 장소로 묶으세요.`,
          });
        }

        // 2. Check for severe geographic zigzagging (e.g. West -> Suburbs -> East on the same day)
        if (i >= 1) {
          const prevAct = activities[i - 1];
          const prevPlace = Object.values(TAIPEI_PLACES).find(
            (p) => p.name.includes(prevAct.placeName) || prevAct.placeName.includes(p.name) || p.id === prevAct.placeId
          );

          if (prevPlace) {
            if (
              prevPlace.area === 'West' &&
              currentPlace.area === 'Suburbs' &&
              nextPlace.area === 'East'
            ) {
              issues.push({
                sourceAgent: this.name,
                severity: 'WARNING',
                dayNumber: day.dayNumber,
                placeName: `${currentAct.placeName}`,
                issue: `동선 비효율 (지그재그 이동): 서부(${prevPlace.area}) → 외곽(${currentPlace.area}) → 동부(${nextPlace.area})로 동선 낭비가 큽니다.`,
                evidence: `총 예상 이동 시간 100분 초과`,
                suggestedFix: `외곽 지역(단수이 등)은 별도의 반나절 블록으로 편성하고, 동부 지역 일정과 같은 날 묶지 마세요.`,
              });
            }
          }
        }
      }
    }

    const blockers = issues.filter((i) => i.severity === 'BLOCKER').length;
    const warnings = issues.filter((i) => i.severity === 'WARNING').length;

    return {
      agent: this.name,
      roleTitle: AGENT_REGISTRY.RouteVerifier.roleTitle,
      passed: blockers === 0,
      blockersCount: blockers,
      warningsCount: warnings,
      issues,
      summary:
        blockers === 0
          ? `[통과] 모든 일간 동선 및 MRT 이동시간이 현실적으로 배정되었습니다.`
          : `[반려] ${blockers}건의 이동시간 부족 또는 동선 충돌이 감지되었습니다.`,
    };
  }

  private timeDiffMinutes(time1: string, time2: string): number {
    const [h1, m1] = time1.split(':').map((x) => parseInt(x, 10));
    const [h2, m2] = time2.split(':').map((x) => parseInt(x, 10));
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }
}

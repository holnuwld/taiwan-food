import { BaseAgent } from './baseAgent.js';
import { TAIPEI_PLACES } from '../knowledge/taipeiData.js';
export class SpotVerifierAgent extends BaseAgent {
    constructor() {
        super('SpotVerifier');
    }
    async verify(plan, req) {
        const issues = [];
        for (const day of plan.days) {
            const dayName = day.dayOfWeek;
            const dayNum = day.dayOfWeekNum;
            for (const act of day.activities) {
                // Find matching place info
                const place = Object.values(TAIPEI_PLACES).find((p) => p.name.includes(act.placeName) || act.placeName.includes(p.name) || p.id === act.placeId);
                if (!place) {
                    continue;
                }
                // 1. Check weekly closed days (휴무일 체크)
                if (place.closedDays.includes(dayNum)) {
                    issues.push({
                        sourceAgent: this.name,
                        severity: 'BLOCKER',
                        dayNumber: day.dayNumber,
                        timeSlot: act.timeSlot,
                        placeName: act.placeName,
                        issue: `${act.placeName}은(는) ${dayName}에 정기 휴관/휴무입니다.`,
                        evidence: `공식 운영 정보: 매주 ${this.getDayName(place.closedDays[0])} 정기 휴무`,
                        suggestedFix: `${dayName} 일정이 아닌 다른 요일로 재배치하거나, ${place.area} 지역의 대체 명소/식당으로 변경하세요.`,
                    });
                }
                // Parse scheduled time (e.g. "14:00 - 16:00" -> 14:00, 16:00)
                const times = act.timeRange.split('-').map((t) => t.trim());
                const startTime = times[0];
                const endTime = times[1] || times[0];
                // 2. Check Break Time (브레이크타임 체크)
                if (place.breakTimeStart && place.breakTimeEnd) {
                    if (this.isTimeOverlap(startTime, endTime, place.breakTimeStart, place.breakTimeEnd)) {
                        issues.push({
                            sourceAgent: this.name,
                            severity: 'BLOCKER',
                            dayNumber: day.dayNumber,
                            timeSlot: act.timeSlot,
                            placeName: act.placeName,
                            issue: `${act.placeName} 방문 시간이 브레이크타임(${place.breakTimeStart} ~ ${place.breakTimeEnd})과 겹칩니다.`,
                            evidence: `영업시간: ${place.openTime}~${place.closeTime} (브레이크타임 ${place.breakTimeStart}~${place.breakTimeEnd})`,
                            suggestedFix: `방문 시간을 ${place.breakTimeEnd} 이후 저녁 시간대로 변경하거나 점심 영업시간(${place.breakTimeStart} 이전)으로 조정하세요.`,
                        });
                    }
                }
                // 3. Check Open / Close hours (오픈/마감 시간 체크)
                if (place.openTime && place.closeTime) {
                    if (startTime < place.openTime) {
                        issues.push({
                            sourceAgent: this.name,
                            severity: 'BLOCKER',
                            dayNumber: day.dayNumber,
                            timeSlot: act.timeSlot,
                            placeName: act.placeName,
                            issue: `방문 예정 시각(${startTime})이 오픈 시각(${place.openTime})보다 이릅니다.`,
                            evidence: `오픈 시간: ${place.openTime}`,
                            suggestedFix: `방문 시작 시각을 ${place.openTime} 이후로 늦추거나 오전 일정 순서를 교체하세요.`,
                        });
                    }
                    else if (endTime > place.closeTime) {
                        issues.push({
                            sourceAgent: this.name,
                            severity: 'BLOCKER',
                            dayNumber: day.dayNumber,
                            timeSlot: act.timeSlot,
                            placeName: act.placeName,
                            issue: `방문 종료 시각(${endTime})이 영업 종료 시각(${place.closeTime})을 초과합니다.`,
                            evidence: `영업 종료 시간: ${place.closeTime}`,
                            suggestedFix: `더 이른 시간대에 방문하거나 소요 시간을 줄이세요.`,
                        });
                    }
                }
            }
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
                ? `[통과] 모든 방문지의 영업시간, 휴무일, 브레이크타임 검증을 통과했습니다.`
                : `[반려] ${blockers}건의 영업시간/휴무일 위반 사항이 발견되었습니다.`,
        };
    }
    isTimeOverlap(start1, end1, start2, end2) {
        return start1 < end2 && end1 > start2;
    }
    getDayName(dayNum) {
        const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        return days[dayNum] || `${dayNum}요일`;
    }
}

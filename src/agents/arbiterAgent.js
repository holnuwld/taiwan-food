import { BaseAgent } from './baseAgent.js';
export class ArbiterAgent extends BaseAgent {
    /**
     * 검증 에이전트별 해결 우선순위 및 레이블 정의
     * 1. SpotVerifier: 장소 영업/휴무/브레이크타임이 선행되어야 동선이 유효함
     * 2. RouteVerifier: 확정된 장소 간의 이동시간 및 MRT 동선 최적화
     * 3. BudgetVerifier: 동선 및 방문지 확정 후 총 비용 및 예산 한도 감사
     */
    agentConfigs = {
        SpotVerifier: {
            priority: 1,
            label: '영업/휴무/브레이크타임 정합',
        },
        RouteVerifier: {
            priority: 2,
            label: '동선 및 이동시간 여유 확보',
        },
        BudgetVerifier: {
            priority: 3,
            label: '예산 한도 및 지출 정합',
        },
    };
    constructor(customConfigs) {
        super('Arbiter');
        if (customConfigs) {
            this.agentConfigs = { ...this.agentConfigs, ...customConfigs };
        }
    }
    /**
     * 새로운 검증 에이전트 설정 동적 등록 (확장성 지원)
     */
    registerAgentConfig(agentName, config) {
        this.agentConfigs[agentName] = config;
    }
    synthesize(iteration, maxIterations, reports) {
        const allIssues = [];
        let totalBlockers = 0;
        let totalWarnings = 0;
        for (const rep of reports) {
            allIssues.push(...rep.issues);
            totalBlockers += rep.blockersCount;
            totalWarnings += rep.warningsCount;
        }
        const overallPassed = totalBlockers === 0;
        const verdict = overallPassed
            ? 'APPROVED'
            : iteration >= maxIterations
                ? 'MAX_ITERATIONS_REACHED'
                : 'REVISE_REQUIRED';
        const directives = [];
        const resolvedConflicts = [];
        // 1. WARNING 이슈 목록 정리
        const warnings = allIssues.filter((i) => i.severity === 'WARNING');
        // 2. 전체 통과 (APPROVED) 시 처리
        if (overallPassed) {
            if (warnings.length > 0) {
                const warningTexts = warnings
                    .map((w) => {
                    const loc = this.formatLocation(w);
                    const text = w.suggestedFix || w.issue || '참고 사항 확인 필요';
                    return loc ? `${loc}: ${text}` : text;
                })
                    .join(' | ');
                directives.push(`[확정 승인 (주의사항 포함)] 모든 차단 이슈(BLOCKER)가 해결되었습니다. 다음 유의사항을 일정에 참고하세요: ${warningTexts}`);
            }
            else {
                directives.push('모든 교차 검증(동선, 영업시간, 예산)을 통과했습니다. 최종 확정 가능합니다.');
            }
            return {
                iteration,
                overallPassed,
                blockersCount: totalBlockers,
                warningsCount: totalWarnings,
                verdict,
                keyIssues: allIssues,
                revisionDirectives: directives,
            };
        }
        // 3. 최대 시도 횟수 초과 (MAX_ITERATIONS_REACHED) 시 처리
        if (verdict === 'MAX_ITERATIONS_REACHED') {
            directives.push(`[최대 수정 횟수 도달] 총 ${iteration}회 반복 후에도 ${totalBlockers}건의 차단 이슈가 남아있습니다. 완전 자동 최적화가 불가하므로 사용자의 수동 확인 및 타협안 적용을 권장합니다.`);
            const unresolvableList = allIssues
                .filter((i) => i.severity === 'BLOCKER')
                .map((b) => {
                const loc = this.formatLocation(b);
                return `${loc ? `[${loc}] ` : ''}${b.suggestedFix || b.issue || '수정 필요'}`;
            });
            directives.push(`[잔여 차단 이슈 목록] ${unresolvableList.join(' | ')}`);
            return {
                iteration,
                overallPassed,
                blockersCount: totalBlockers,
                warningsCount: totalWarnings,
                verdict,
                keyIssues: allIssues,
                revisionDirectives: directives,
            };
        }
        // 4. 재수정 필요 (REVISE_REQUIRED) 시: 충돌 중재 및 우선순위 지시문 작성
        const blockerIssues = allIssues.filter((i) => i.severity === 'BLOCKER');
        // (A) 상충(Conflict) 감지 및 중재
        const filteredBlockers = this.arbitrateConflicts(blockerIssues, resolvedConflicts);
        // (B) 에이전트별 동적 그룹핑 (하드코딩 제거)
        const groupedByAgent = filteredBlockers.reduce((acc, issue) => {
            const agent = issue.sourceAgent || 'UnknownVerifier';
            if (!acc[agent])
                acc[agent] = [];
            acc[agent].push(issue);
            return acc;
        }, {});
        // (C) 우선순위에 따라 정렬
        const sortedAgents = Object.keys(groupedByAgent).sort((a, b) => {
            const pA = this.agentConfigs[a]?.priority ?? 99;
            const pB = this.agentConfigs[b]?.priority ?? 99;
            return pA - pB;
        });
        // (D) 중재 결정이 있을 경우 최상단 지침으로 추가
        if (resolvedConflicts.length > 0) {
            for (const rc of resolvedConflicts) {
                directives.push(`[중재 결정] ${rc.conflictDescription} -> ${rc.chosenDirective} (사유: ${rc.tradeOffReason})`);
            }
        }
        // (E) 우선순위별 수정 지시문 생성
        for (const agent of sortedAgents) {
            const issues = groupedByAgent[agent];
            const config = this.agentConfigs[agent];
            const label = config?.label || agent;
            const formattedFixes = issues
                .map((b) => {
                const loc = this.formatLocation(b);
                const detail = b.suggestedFix || b.issue || '문제 원인 미기재';
                return loc ? `${loc}: ${detail}` : detail;
            })
                .join(' | ');
            directives.push(`[${label}] ${formattedFixes}`);
        }
        return {
            iteration,
            overallPassed,
            blockersCount: totalBlockers,
            warningsCount: totalWarnings,
            verdict,
            keyIssues: allIssues,
            revisionDirectives: directives,
        };
    }
    /**
     * 에이전트 간의 상충/모순 이슈를 감지하고 중재하는 로직
     */
    arbitrateConflicts(blockers, resolutions) {
        const spotBlockers = blockers.filter((i) => i.sourceAgent === 'SpotVerifier');
        const routeBlockers = blockers.filter((i) => i.sourceAgent === 'RouteVerifier');
        const budgetBlockers = blockers.filter((i) => i.sourceAgent === 'BudgetVerifier');
        // 케이스 1: SpotVerifier에서 휴무/브레이크타임으로 일정 재배치가 필요한 장소에
        // RouteVerifier도 이동시간 이슈를 제기한 경우 -> Spot의 시간 재배치/대체를 선행
        const spotIssuePlaces = new Set(spotBlockers.map((s) => s.placeName?.trim().toLowerCase()).filter(Boolean));
        const adjustedBlockers = [];
        for (const issue of blockers) {
            if (issue.sourceAgent === 'RouteVerifier' &&
                issue.placeName &&
                spotIssuePlaces.has(issue.placeName.trim().toLowerCase())) {
                resolutions.push({
                    conflictDescription: `[Day ${issue.dayNumber || '?'}] '${issue.placeName}'의 운영시간 이슈와 동선 이슈가 동시 발생`,
                    chosenDirective: `'${issue.placeName}'의 방문 시간대 변경 또는 대체 장소 선정을 우선 진행`,
                    tradeOffReason: '장소 방문 시간이나 대상 자체가 변경되면 이전 동선 계산은 무효화되므로 Spot 해결을 선행합니다.',
                });
                // 동선 이슈는 시간/장소 재배치 후 다음 반복에서 재검증하도록 유예
                continue;
            }
            adjustedBlockers.push(issue);
        }
        // 케이스 2: 동선 개선(택시/특급 등 고비용 이동)과 예산 초과(비용 절감)가 충돌하는 경우
        const taxiRouteIssue = routeBlockers.find((r) => r.suggestedFix?.includes('택시') || r.suggestedFix?.includes('특급'));
        const budgetIssue = budgetBlockers.find((b) => b.suggestedFix?.includes('예산') || b.suggestedFix?.includes('비용'));
        if (taxiRouteIssue && budgetIssue) {
            resolutions.push({
                conflictDescription: '동선 시간 단축(빠른 교통수단)과 예산 초과(비용 절감) 간 상충',
                chosenDirective: '대중교통(MRT) 유지 하에 방문 장소 순서 재배치 또는 비핵심 스팟 제외',
                tradeOffReason: '예산 한도를 넘기는 고비용 이동수단 대신 동선 순서 재배치를 통한 이동시간 단축을 권장합니다.',
            });
        }
        return adjustedBlockers;
    }
    /**
     * 위치 표시 문자열 포맷팅 헬퍼 (Day N [타임슬롯] 장소명)
     */
    formatLocation(issue) {
        const parts = [];
        if (typeof issue.dayNumber === 'number') {
            parts.push(`Day ${issue.dayNumber}`);
        }
        if (issue.timeSlot) {
            parts.push(`[${issue.timeSlot}]`);
        }
        if (issue.placeName) {
            parts.push(issue.placeName);
        }
        return parts.join(' ');
    }
}

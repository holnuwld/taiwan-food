import pc from 'picocolors';
export class TerminalFormatter {
    static printBanner(title) {
        const line = '═'.repeat(70);
        console.log('\n' + pc.cyan(line));
        console.log(pc.bold(pc.cyan(`  ✈  ${title.toUpperCase()}`)));
        console.log(pc.cyan(line) + '\n');
    }
    static printStepHeader(step, title) {
        console.log(pc.yellow(`\n▶ [단계 ${step}] ${title}`));
        console.log(pc.dim('─'.repeat(60)));
    }
    static printAgentStart(agentName, roleDesc) {
        console.log(`${pc.blue('●')} ${pc.bold(pc.white(`[${agentName}]`))} ${pc.dim(roleDesc)}`);
    }
    static printIssues(issues) {
        if (issues.length === 0) {
            console.log(pc.green('   ✓ 발견된 위반/충돌 이슈가 없습니다.'));
            return;
        }
        for (const issue of issues) {
            const badge = issue.severity === 'BLOCKER'
                ? pc.bgRed(pc.white(' BLOCKER '))
                : pc.bgYellow(pc.black(' WARNING '));
            console.log(`   ${badge} ${pc.bold(`Day ${issue.dayNumber}`)} [${issue.placeName}]`);
            console.log(`      ${pc.red('이슈:')} ${issue.issue}`);
            console.log(`      ${pc.dim('근거:')} ${issue.evidence}`);
            console.log(`      ${pc.cyan('권장 해결책:')} ${issue.suggestedFix}`);
        }
    }
    static printAgentReport(report) {
        const status = report.passed
            ? pc.bgGreen(pc.black(' PASS '))
            : pc.bgRed(pc.white(' REVISE '));
        console.log(`   결과: ${status} | 차단 이슈: ${pc.bold(report.blockersCount)}건, 경고: ${report.warningsCount}건`);
        console.log(`   요약: ${pc.dim(report.summary)}`);
    }
    static printArbiterSummary(synth) {
        console.log('\n' + pc.magenta('┌' + '─'.repeat(68) + '┐'));
        console.log(pc.magenta('│') +
            pc.bold(pc.white(`  ⚖  비평 & 조율 에이전트(Arbiter) 종합 판정 (Iteration ${synth.iteration})`)) +
            ' '.repeat(10) +
            pc.magenta('│'));
        console.log(pc.magenta('├' + '─'.repeat(68) + '┤'));
        const verdictText = synth.verdict === 'APPROVED'
            ? pc.green(pc.bold('✔ 승인 (APPROVED - 모든 검증 통과)'))
            : synth.verdict === 'MAX_ITERATIONS_REACHED'
                ? pc.yellow(pc.bold('⚠ 최대 반복 횟수 도달 (부분 승인)'))
                : pc.red(pc.bold('✖ 반려 (REVISE REQUIRED - 플래너에게 수정 지시)'));
        console.log(pc.magenta('│') + `  판정 결과: ${verdictText}`);
        console.log(pc.magenta('│') +
            `  총 차단 이슈: ${pc.red(pc.bold(synth.blockersCount))}건 | 총 경고 이슈: ${pc.yellow(synth.warningsCount)}건`);
        if (synth.revisionDirectives.length > 0) {
            console.log(pc.magenta('│') + pc.bold('  플래너 전달 수정 지침:'));
            for (const dir of synth.revisionDirectives) {
                console.log(pc.magenta('│') + `   • ${pc.cyan(dir)}`);
            }
        }
        console.log(pc.magenta('└' + '─'.repeat(68) + '┘\n'));
    }
    static printFinalPlanTable(plan, req) {
        this.printBanner(`최종 확정된 대만 여행 일정표: ${plan.title}`);
        console.log(pc.bold(`여행 기간: ${plan.startDate} ~ ${plan.endDate} (${plan.totalDays}일) | 총 예산: 약 ${plan.totalCostKrw.toLocaleString()}원 (${plan.totalCostTwd.toLocaleString()} TWD)\n`));
        for (const day of plan.days) {
            console.log(pc.bgBlue(pc.white(` DAY ${day.dayNumber} `)) +
                ` ${pc.bold(day.date)} (${day.dayOfWeek}) - ${pc.yellow(day.theme)}`);
            console.log(pc.dim(`  주요 거점: ${day.baseArea} | 일일 예상 지출: ${day.dailyCostTwd.toLocaleString()} TWD`));
            for (const act of day.activities) {
                console.log(`   [${pc.cyan(act.timeRange)}] ${pc.bold(act.placeName)} (${pc.dim(act.category)})`);
                console.log(`      • 설명: ${act.notes}`);
                console.log(`      • 비용: ${act.estimatedCostTwd > 0 ? `${act.estimatedCostTwd} TWD` : '무료'} | MRT: ${act.mrtStation}역`);
                if (act.transitToNext) {
                    console.log(`      ↳ ${pc.green('이동:')} ${act.transitToNext.transitRoute} (예상 ${act.transitToNext.costTwd} TWD)`);
                }
            }
            console.log('');
        }
    }
}

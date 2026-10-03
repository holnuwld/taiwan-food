import { ArtifactVerifier } from './artifactVerifier.js';
import pc from 'picocolors';

console.log(pc.bold(pc.cyan('\n===========================================================')));
console.log(pc.bold(pc.cyan('   실제 완성 산출물 기준 멀티 에이전트 교차 검증 (Cross-Verifier)')));
console.log(pc.bold(pc.cyan('===========================================================\n')));

const verifier = new ArtifactVerifier('c:/cowork/taiwan');
const results = verifier.runVerification();

let passCount = 0;
let failCount = 0;

console.log(pc.bold('카테고리별 세부 검증 결과:\n'));

results.forEach((r, idx) => {
  const icon = r.passed ? pc.green('✔ PASS') : pc.red('✖ FAIL');
  if (r.passed) passCount++;
  else failCount++;

  console.log(`[${idx + 1}] ${icon} [${pc.yellow(r.category)}] ${pc.bold(r.item)}`);
  console.log(`    ↳ ${pc.dim(r.details)}`);
});

console.log('\n-----------------------------------------------------------');
console.log(`총 검증 항목: ${results.length}개 | 통과(PASS): ${pc.green(passCount)}개 | 실패(FAIL): ${pc.red(failCount)}개`);
console.log('-----------------------------------------------------------');

if (failCount === 0) {
  console.log(pc.bold(pc.green('\n🎉 모든 산출물(모바일/데스크탑/지도/실물사진/리뷰) 교차 검증 전원 통과 (100% APPROVED)!\n')));
} else {
  console.log(pc.bold(pc.red(`\n⚠️ ${failCount}개 항목에서 불일치 감지. 수정이 필요합니다.\n`)));
  process.exit(1);
}

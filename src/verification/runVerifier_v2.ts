import { ArtifactVerifierV2 } from './artifactVerifier_v2.js';

console.log('='.repeat(70));
console.log('       TAIPEI TRAVEL PLAN v2 MULTI-AGENT VERIFICATION REPORT       ');
console.log('='.repeat(70));

const verifier = new ArtifactVerifierV2();
const results = verifier.runVerification();

let passCount = 0;
let failCount = 0;

for (const r of results) {
  const status = r.passed ? '[ PASS ]' : '[ FAIL ]';
  if (r.passed) passCount++;
  else failCount++;

  console.log(`${status} [${r.category}] ${r.item}`);
  console.log(`         -> ${r.details}`);
}

console.log('-'.repeat(70));
console.log(`Total Checks: ${results.length} | Passed: ${passCount} | Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n>>> SUCCESS: All v2 deliverables verified and ready for client delivery! <<<');
  process.exit(0);
} else {
  console.error('\n>>> ERROR: Some verification checks failed! <<<');
  process.exit(1);
}

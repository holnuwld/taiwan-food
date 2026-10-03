import { ArtifactVerifierV3 } from './artifactVerifier_v3.js';

const verifier = new ArtifactVerifierV3('c:/cowork/taiwan');
const results = verifier.runVerification();

console.log('======================================================================');
console.log('       TAIPEI TRAVEL PLAN v3 MULTI-AGENT VERIFICATION REPORT       ');
console.log('======================================================================');

let passed = 0;
let failed = 0;

for (const r of results) {
  const status = r.passed ? '[ PASS ]' : '[ FAIL ]';
  if (r.passed) passed++;
  else failed++;

  console.log(`${status} [${r.category}] ${r.item}`);
  console.log(`         -> ${r.details}`);
}

console.log('----------------------------------------------------------------------');
console.log(`Total Checks: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

if (failed === 0) {
  console.log('\n>>> SUCCESS: All v3 deliverables verified and ready for client delivery! <<<');
  process.exit(0);
} else {
  console.error(`\n>>> FAILURE: ${failed} check(s) failed in v3 verification! <<<`);
  process.exit(1);
}

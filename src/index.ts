import { TravelPlannerOrchestrator } from './orchestrator.js';
import { UserTravelRequirements } from './types.js';
import { CONFIG } from './config.js';

async function main() {
  // Setup user travel requirements for Taiwan Taipei (3박 4일: 11/11 수 ~ 11/14 토)
  const userRequest: UserTravelRequirements = {
    destination: '대만 타이베이 (Taipei, Taiwan)',
    city: '타이베이',
    durationDays: 4,
    startDate: '2026-11-11', // 수요일 출발 ~ 토요일 귀국
    partySize: 2,
    budgetPerPersonKrw: CONFIG.defaultBudgetKrw, // 60만 원
    budgetPerPersonTwd: Math.round(CONFIG.defaultBudgetKrw / CONFIG.defaultTwdToKrwRate), // ~14,117 TWD
    travelPace: 'moderate',
    preferredThemes: [
      '스페셜티 커피/국제커피쇼',
      '미슐랭 빕구르망/현지미식',
      '야시장',
      '일몰/감성',
      '역사/문화/디화제 쇼핑'
    ],
    mustVisitSpots: [
      '2026 대만 국제 커피쇼 (난강전람관 1관)',
      '심플 카파 본점 (Simple Kaffa 興波咖啡)',
      '유산동 우육면 (劉山東牛肉麵)',
      '푸항또우장 (阜杭豆漿)',
      '딘타이펑 (신생점)',
      '단수이 라오지에 & 홍마오청',
      '스린 야시장',
      '라오허제 야시장 & 후자오빙',
      '디화제 레트로 상점가 & 다다오청',
      '진펑루로우판 (金峰魯肉飯)'
    ],
    flightArrival: {
      airport: 'TPE T1 (KE2025)',
      time: '11:00',
    },
    flightDeparture: {
      airport: 'TPE T1 (TR872)',
      time: '18:10',
    },
  };

  const orchestrator = new TravelPlannerOrchestrator();
  await orchestrator.run(userRequest);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

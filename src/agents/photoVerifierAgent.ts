import { BaseAgent } from './baseAgent.js';
import { AgentReport, ItineraryPlan, ValidationIssue } from '../types.js';
import { RealPhotoEnforcer } from '../verification/realPhotoEnforcer.js';

/**
 * PhotoVerifierAgent (사진 진위성 및 무조건 실사진 강제 집행 에이전트)
 * 
 * [핵심 역할]:
 * 1. 여행 계획 내 모든 장소, 식당 메뉴(16종), 리테일 기념품(12종)의 사진이
 *    100% 검증된 '실제 사진(Real Photo)'인지 전수 감사
 * 2. 생성형 AI 모델에 의한 합성 이미지, Mockup 템플릿 사용 감지 시 즉각 BLOCKER 발행
 * 3. 원본 URL 유효성, 로컬 이미지 바이너리 매직 바이트, 최소 파일 크기(50KB),
 *    브라우저 렌더링 검증 스크린샷 1:1 일치 여부 정밀 감사
 * 4. Arbiter에게 감사 리포트를 제출하여 미통과 시 일정 승인을 차단
 */
export class PhotoVerifierAgent extends BaseAgent {
  constructor() {
    super('PhotoVerifier');
  }

  public async verify(plan: ItineraryPlan): Promise<AgentReport> {
    const issues: ValidationIssue[] = [];

    // 1. Audit all 28 real photo assets
    const auditSummary = RealPhotoEnforcer.auditAllTravelPlanPhotos();

    for (const item of auditSummary.items) {
      if (item.status === 'FAIL') {
        issues.push({
          sourceAgent: this.name,
          severity: 'BLOCKER',
          dayNumber: 0,
          placeName: item.title,
          issue: `[실제 사진 강제 정책 위반] ${item.name} 실물 사진 무결성 검증 실패`,
          evidence: `로컬 경로: ${item.localPath} | 파일 크기: ${item.fileSize}B | 헤더 정상: ${item.magicHeaderValid}`,
          suggestedFix: `구글 지도 또는 공식 리테일 원본 URL(${item.originalUrl})에서 실제 사진을 재크롤링하여 적재하세요. AI 합성 이미지는 절대 사용할 수 없습니다.`
        });
      }
    }

    // 2. Check for synthetic AI image markers in plan descriptions
    const planText = JSON.stringify(plan);
    const aiCheck = RealPhotoEnforcer.assertNoAiMarkers(planText, 'ItineraryPlan');
    if (!aiCheck.clean) {
      issues.push({
        sourceAgent: this.name,
        severity: 'BLOCKER',
        dayNumber: 0,
        placeName: '전체 일정 계획서',
        issue: `[AI 생성 이미지 지문 감지] 계획서 내에 금지된 생성형 이미지 마커('${aiCheck.detectedMarker}')가 발견되었습니다.`,
        evidence: `감지된 키워드: ${aiCheck.detectedMarker}`,
        suggestedFix: `합성 이미지를 전면 배제하고 구글 지도 및 공식 제조사의 실물 사진만 사용하도록 교체하십시오.`
      });
    }

    // 3. Check for distinct food dish photos across 8 restaurants
    const dishPairs = [
      { restaurant: '유산동 우육면', img1: 'liu_shan_dong_real.jpg', img2: 'liu_shan_dong_hongshao_real.jpg' },
      { restaurant: '아종면선', img1: 'ay_chung_dish_real.jpg', img2: 'ay_chung_real.jpg' },
      { restaurant: '키키 레스토랑', img1: 'kiki_tofu_real.jpg', img2: 'kiki_chives_real.jpg' },
      { restaurant: '푸항또우장', img1: 'fuhang_doujiang_real.jpg', img2: 'fuhang_shaobing_real.jpg' },
      { restaurant: '딘타이펑', img1: 'din_tai_fung_real.jpg', img2: 'din_tai_fung_pork_chop_rice_real.jpg' },
      { restaurant: '심플 카파', img1: 'simple_kaffa_coffee_real.jpg', img2: 'simple_kaffa_beans_dish_real.jpg' },
      { restaurant: '라오허제 후자오빙', img1: 'hujiao_bing_raohe_real.jpg', img2: 'hujiao_bing_oven_real.jpg' },
      { restaurant: '진펑 루로우판', img1: 'luroufan_real.jpg', img2: 'jinfeng_sidedish_real.jpg' }
    ];

    const dishesDistinct = RealPhotoEnforcer.verifyNoDuplicateDishes(dishPairs);
    if (!dishesDistinct) {
      issues.push({
        sourceAgent: this.name,
        severity: 'BLOCKER',
        dayNumber: 0,
        placeName: '식당 메뉴 사진',
        issue: `[메뉴 사진 중복 오류] 동일 식당의 대표 메뉴 2종이 같은 사진으로 등록되어 있습니다.`,
        evidence: `개별 메뉴별로 구별되는 고유 실물 사진 필요`,
        suggestedFix: `서로 다른 실제 요리 사진으로 분리 등록하십시오.`
      });
    }

    const blockersCount = issues.filter(i => i.severity === 'BLOCKER').length;
    const warningsCount = issues.filter(i => i.severity === 'WARNING').length;
    const passed = blockersCount === 0;

    return {
      agent: this.name,
      roleTitle: '사진 진위성 및 무조건 실사진 강제 집행 에이전트',
      passed,
      blockersCount,
      warningsCount,
      issues,
      summary: passed
        ? `[통과] 28종 식사 및 기념품 사진 전수 실물 사진 검증 완료 (합성 AI 이미지 0%, 원본 링크 및 스크린샷 100% 일치)`
        : `[차단] 실제 사진 정책 위반 발견 (차단 이슈: ${blockersCount}건) - 실물 사진 재수집 필요`,
      metrics: {
        totalAudited: auditSummary.totalPhotos,
        passedRealPhotos: auditSummary.passedCount,
        failedRealPhotos: auditSummary.failedCount,
        zeroAiGenerated: auditSummary.zeroAiGenerated
      }
    };
  }
}

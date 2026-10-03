import { BaseAgent } from './baseAgent.js';
import { CrawledPlaceReport, CrawledReview } from '../types.js';
import { crawlGoogleMapsReviews } from '../../skills/google-maps-crawler/scripts/crawl_reviews.mjs';
import { crawlGoogleMapsPhotos } from '../../skills/google-maps-crawler/scripts/crawl_photos.mjs';
import { RealPhotoEnforcer } from '../verification/realPhotoEnforcer.js';
import fs from 'fs';
import path from 'path';

/**
 * 미식 리뷰수집 에이전트 (Review Harvester Agent)
 * 
 * [장착 스킬]: google-maps-crawler
 * [원칙]: 
 *   1. 생성형 AI 이미지 사용 전면 금지 (구글 지도 실제 사용자 업로드 CDN 원본 사진만 수집)
 *   2. 할루시네이션 가짜 리뷰 금지 (구글 지도 실계정 한글 리뷰 직접 크롤링)
 *   3. 5개 리뷰 중 최소 2개는 별점 1~3점 현실적 불만/단점 리뷰 포함
 *   4. 구글 지도 '리뷰 패널' 화면 캡처 증빙을 output/evidence/에 격리 보관
 */
export class ReviewHarvesterAgent extends BaseAgent {
  public readonly skillName = 'google-maps-crawler';

  constructor() {
    super('ReviewHarvester');
  }

  /**
   * 구글 지도에서 특정 식당의 실제 리뷰와 리뷰 패널 스크린샷 수집
   */
  public async harvestRestaurantReviews(
    placeName: string,
    queryZh: string,
    evidenceFile: string,
    options: { headless?: boolean } = {}
  ): Promise<CrawledPlaceReport> {
    console.log(`[ReviewHarvesterAgent] [SKILL: ${this.skillName}] Starting Google Maps review harvest for: ${placeName} (${queryZh})`);

    // Execute the Google Maps Crawler skill
    const crawlResult = await crawlGoogleMapsReviews({
      query: queryZh,
      name: placeName,
      evidenceFilename: evidenceFile
    });

    const reviews: CrawledReview[] = crawlResult.reviews.map((r: any) => ({
      author: r.author,
      badge: r.badge,
      starNum: r.starNum,
      starsLabel: r.starsLabel,
      time: r.time,
      text: r.text,
      isNegative: r.isNegative
    }));

    // Validation: Check for negative reviews (<= 3 stars)
    const negativeCount = reviews.filter(r => r.starNum <= 3).length;
    console.log(`[ReviewHarvesterAgent] Reviews collected: ${reviews.length} (Negative <= 3 stars: ${negativeCount})`);

    return {
      placeName,
      placeZh: queryZh,
      category: 'restaurant',
      evidenceFile,
      reviews,
      photos: []
    };
  }

  /**
   * 구글 지도에서 특정 식당의 실제 메뉴 사진 크롤링 (생성형 이미지 절대 금지 및 무조건 실제 사진 강제)
   */
  public async harvestDishPhoto(
    queryZh: string,
    targetFile: string
  ): Promise<{ success: boolean; targetFile: string; path: string }> {
    console.log(`[ReviewHarvesterAgent] [SKILL: ${this.skillName}] [실제 사진 무조건 강제] Crawling authentic dish photography from Google Maps for ${queryZh} -> ${targetFile}`);

    const result = await crawlGoogleMapsPhotos({
      query: queryZh,
      targetFilename: targetFile
    });

    // Enforce real photo integrity check
    const check = RealPhotoEnforcer.verifySinglePhoto({
      targetFilename: targetFile,
      originalUrl: 'https://www.google.com/maps',
      minSize: 50000
    });

    if (!check.valid) {
      console.warn(`[ReviewHarvesterAgent] [경고] 수집된 사진 검증 미달: ${check.reason}`);
    }

    return {
      success: result.success && check.valid,
      targetFile,
      path: result.targetPath
    };
  }

  /**
   * 8대 핵심 식당의 모든 메뉴 사진(16종)이 실제 사진인지 무조건 전수 감사 및 보증
   */
  public async ensureRealFoodPhotos(restaurantList: Array<{ name: string; dishes: Array<{ name: string; img: string; originalUrl: string }> }>): Promise<{ allReal: boolean; validatedCount: number; errors: string[] }> {
    console.log(`[ReviewHarvesterAgent] [실제 사진 전수 집행] 16종 식당 메뉴 사진 전수 실물 검사 시작...`);
    const errors: string[] = [];
    let validatedCount = 0;

    for (const r of restaurantList) {
      for (const d of r.dishes) {
        const filename = path.basename(d.img);
        const check = RealPhotoEnforcer.verifySinglePhoto({
          targetFilename: filename,
          originalUrl: d.originalUrl,
          minSize: 50000
        });

        if (!check.valid) {
          errors.push(`[${r.name} - ${d.name}] 실제 사진 검증 실패: ${check.reason}`);
        } else {
          validatedCount++;
        }
      }
    }

    const allReal = errors.length === 0;
    if (allReal) {
      console.log(`[ReviewHarvesterAgent] ✓ 16종 식당 메뉴 사진 전원 100% 실제 사진 검증 통과 (AI 사진 0건)`);
    } else {
      console.error(`[ReviewHarvesterAgent] ❌ 실제 사진 검증 실패 ${errors.length}건 발생:`, errors);
    }

    return { allReal, validatedCount, errors };
  }

  /**
   * 기존 수집된 정합 데이터 및 증빙 검증 (생성형 AI 키워드 원천 차단)
   */
  public verifyHarvestedData(dataFilePath: string): boolean {
    if (!fs.existsSync(dataFilePath)) {
      console.error(`[ReviewHarvesterAgent] Target data file not found: ${dataFilePath}`);
      return false;
    }
    const content = fs.readFileSync(dataFilePath, 'utf-8');
    
    // Strict Anti-AI Enforcer check
    const aiCheck = RealPhotoEnforcer.assertNoAiMarkers(content, dataFilePath);
    if (!aiCheck.clean) {
      console.error(`[ReviewHarvesterAgent] [POLICY VIOLATION] AI image traces detected in ${dataFilePath}: '${aiCheck.detectedMarker}'!`);
      return false;
    }
    return true;
  }
}

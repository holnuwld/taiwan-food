import { BaseAgent } from './baseAgent.js';
import { CrawledPlaceReport, CrawledReview, SouvenirItem } from '../types.js';
import { crawlGoogleMapsReviews } from '../../skills/google-maps-crawler/scripts/crawl_reviews.mjs';
import { crawlRetailSouvenirPhoto } from '../../skills/google-maps-crawler/scripts/crawl_souvenirs.mjs';
import { RealPhotoEnforcer } from '../verification/realPhotoEnforcer.js';
import fs from 'fs';
import path from 'path';

/**
 * 숙소·기념품 큐레이터 에이전트 (Hotel & Retail Curator Agent)
 * 
 * [장착 스킬]: google-maps-crawler
 * [원칙]: 
 *   1. 생성형 AI 이미지 사용 전면 금지 (구글 지도 호텔 사진 및 실제 리테일 상품 패키지 컷만 수집)
 *   2. 할루시네이션 가짜 리뷰 금지 (구글 지도 실투숙객 한글 리뷰 직접 크롤링)
 *   3. 숙소당 5개 리뷰 중 최소 2개는 별점 1~3점 현실적 불만/단점 리뷰 포함
 *   4. 구글 지도 '리뷰 패널' 화면 캡처 증빙을 output/evidence/에 격리 보관
 *   5. 12대 기념품 전 품목 실물 패키지 무조건 실제 사진 강제 검증
 */
export class HotelRetailCuratorAgent extends BaseAgent {
  public readonly skillName = 'google-maps-crawler';

  constructor() {
    super('HotelRetailCurator');
  }

  /**
   * 구글 지도에서 호텔의 실제 투숙객 리뷰 및 리뷰 패널 증빙 수집
   */
  public async harvestHotelReviews(
    hotelName: string,
    queryZh: string,
    evidenceFile: string
  ): Promise<CrawledPlaceReport> {
    console.log(`[HotelRetailCuratorAgent] [SKILL: ${this.skillName}] Starting Google Maps review harvest for hotel: ${hotelName} (${queryZh})`);

    const crawlResult = await crawlGoogleMapsReviews({
      query: queryZh,
      name: hotelName,
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

    const negativeCount = reviews.filter(r => r.starNum <= 3).length;
    console.log(`[HotelRetailCuratorAgent] Hotel reviews collected: ${reviews.length} (Negative <= 3 stars: ${negativeCount})`);

    return {
      placeName: hotelName,
      placeZh: queryZh,
      category: 'hotel',
      evidenceFile,
      reviews,
      photos: []
    };
  }

  /**
   * 실제 리테일 상품 패키지 실물 사진 크롤링 (AI 생성 이미지 절대 금지 및 무조건 실제 사진 강제)
   */
  public async harvestSouvenirPhoto(
    productName: string,
    queryZh: string,
    targetFile: string
  ): Promise<{ success: boolean; targetFile: string; path: string }> {
    console.log(`[HotelRetailCuratorAgent] [SKILL: ${this.skillName}] [실제 사진 무조건 강제] Crawling authentic retail package photography for ${productName} -> ${targetFile}`);

    const result = await crawlRetailSouvenirPhoto({
      query: queryZh,
      targetFilename: targetFile
    });

    const check = RealPhotoEnforcer.verifySinglePhoto({
      targetFilename: targetFile,
      originalUrl: 'https://www.google.com/search',
      minSize: 50000
    });

    return {
      success: result.success && check.valid,
      targetFile,
      path: result.targetPath
    };
  }

  /**
   * 12대 기념품 전 품목의 실제 사진 적재 상태 전수 검증
   */
  public async ensureRealRetailPhotos(souvenirList: Array<{ name: string; img: string; originalUrl: string }>): Promise<{ allReal: boolean; validatedCount: number; errors: string[] }> {
    console.log(`[HotelRetailCuratorAgent] [실제 사진 전수 집행] 12대 기념품 패키지 실물 사진 전수 검사 시작...`);
    const errors: string[] = [];
    let validatedCount = 0;

    for (const item of souvenirList) {
      const filename = path.basename(item.img);
      const check = RealPhotoEnforcer.verifySinglePhoto({
        targetFilename: filename,
        originalUrl: item.originalUrl,
        minSize: 50000
      });

      if (!check.valid) {
        errors.push(`[${item.name}] 리테일 실물 사진 검증 실패: ${check.reason}`);
      } else {
        validatedCount++;
      }
    }

    const allReal = errors.length === 0;
    if (allReal) {
      console.log(`[HotelRetailCuratorAgent] ✓ 12대 기념품 패키지 실물 사진 전원 100% 검증 통과 (AI 합성 0건)`);
    } else {
      console.error(`[HotelRetailCuratorAgent] ❌ 리테일 실물 사진 검증 실패 ${errors.length}건 발생:`, errors);
    }

    return { allReal, validatedCount, errors };
  }

  /**
   * 12대 기념품 카탈로그 무결성 검증
   */
  public verifySouvenirAssets(imagesDir: string, expectedFiles: string[]): boolean {
    let allExist = true;
    for (const file of expectedFiles) {
      const fullPath = path.join(imagesDir, file);
      if (!fs.existsSync(fullPath)) {
        console.error(`[HotelRetailCuratorAgent] [MISSING ASSET] ${file} does not exist!`);
        allExist = false;
      } else {
        const check = RealPhotoEnforcer.verifySinglePhoto({
          targetFilename: file,
          originalUrl: 'https://commons.wikimedia.org',
          minSize: 50000
        });
        if (!check.valid) {
          console.error(`[HotelRetailCuratorAgent] [INVALID ASSET] ${file} failed real photo check: ${check.reason}`);
          allExist = false;
        }
      }
    }
    return allExist;
  }
}

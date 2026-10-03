declare module '*/crawl_reviews.mjs' {
  export interface ScrapedReview {
    author: string;
    badge?: string;
    starNum: number;
    starsLabel?: string;
    time: string;
    text: string;
    isNegative?: boolean;
  }

  export interface CrawlReviewsResult {
    placeName: string;
    query: string;
    evidenceFile?: string;
    totalScraped: number;
    reviews: ScrapedReview[];
  }

  export interface CrawlReviewsOptions {
    query: string;
    name: string;
    evidenceFilename?: string;
    browserInstance?: any;
    limit?: number;
    includeNegatives?: boolean;
  }

  export function crawlGoogleMapsReviews(options: CrawlReviewsOptions): Promise<CrawlReviewsResult>;
}

declare module '*/crawl_photos.mjs' {
  export interface CrawlPhotosOptions {
    query: string;
    targetFilename: string;
    category?: string;
    browserInstance?: any;
  }

  export interface CrawlPhotosResult {
    success: boolean;
    targetFile: string;
    targetPath: string;
    sizeBytes: number;
    cdnUrl: string;
  }

  export function crawlGoogleMapsPhotos(options: CrawlPhotosOptions): Promise<CrawlPhotosResult>;
}

declare module '*/crawl_souvenirs.mjs' {
  export interface CrawlSouvenirsOptions {
    query: string;
    targetFilename: string;
    browserInstance?: any;
  }

  export interface CrawlSouvenirsResult {
    success: boolean;
    targetFile: string;
    targetPath: string;
    sizeBytes: number;
    sourceUrl: string;
  }

  export function crawlRetailSouvenirPhoto(options: CrawlSouvenirsOptions): Promise<CrawlSouvenirsResult>;
}

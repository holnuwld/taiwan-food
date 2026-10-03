---
name: google-maps-crawler
description: Crawls authentic Google Maps reviews, handles, star ratings, review panel evidence screenshots, and real user-uploaded photos (dishes, hotels) and genuine retail souvenir photos. Enforces zero hallucination and strictly prohibits synthetic AI generation.
---

# Google Maps Crawler & Real Asset Harvester Skill (구글 지도 실데이터 크롤러 스킬)

## 1. 개요 및 목적
본 스킬은 **미식 리뷰수집 에이전트(Review Harvester Agent)**와 **숙소·기념품 큐레이터 에이전트(Hotel & Retail Curator Agent)**가 생성형 AI 모델의 할루시네이션(가짜 리뷰 작성, 임의 계정 생성) 및 합성 이미지(`generate_image` 등) 사용을 원천 차단하고, **구글 지도(Google Maps) 및 공식 리테일 플랫폼에서 100% 검증된 실제 데이터와 사진을 직접 수집·적재**할 수 있도록 표준화된 자동화 워크플로우를 제공합니다.

---

## 2. 핵심 원칙 및 제약 조건 (Strict Constraints)

1. **무조건 실제 사진 강제 집행 (Unconditional Real Photo Enforcement)**:
   - 식당 대표 메뉴(16종), 숙소 외관/객실, 쇼핑 기념품(12종) 이미지는 **예외 없이 100% 검증된 실제 사진(Real Photo)**만을 사용해야 합니다.
   - 모든 사진은 공인된 원본 출처 링크(`originalUrl`: Wikimedia Commons, Google Maps CDN, 공식 브랜드 플래그십 몰)와 `output/verified_screenshots/`의 실물 브라우저 렌더링 캡처본과 1:1 대조가 완료되어야 합니다.
   - AI 그림 생성기(`generate_image`, DALL-E, Midjourney, Stable Diffusion 등)나 임의의 목업 템플릿 사용은 시스템 수준에서 **원천 차단 및 즉시 REJECT**됩니다.
   - `RealPhotoEnforcer` 엔진을 통해 로컬 이미지 존재, 최소 파일 크기(>= 50KB), 바이너리 매직 바이트(JPEG/PNG/WebP)가 강제 검증됩니다.

2. **실계정 아이디 및 원문 리뷰 수집 (Authentic User Reviews)**:
   - 한국인 여행자가 구글 지도에 등록한 실제 계정 핸들/아이디(예: `L S`, `Jay Yoo`, `김진희`, `Pitzzao`, `June Chang`, `분노한이쿨크` 등)와 등록일, 실제 작성 본문을 그대로 크롤링합니다.
   - 본명을 임의로 지어내거나 가상의 리뷰 문구를 합성하는 할루시네이션은 시스템 수준에서 즉각 거부됩니다.

3. **현실적인 리뷰 분포 (부정적 피드백 2건 의무 포함)**:
   - 각 장소당 5건의 리뷰 중 **최소 2건은 별점 1~3점짜리 현실적 불만/단점 리뷰**(웨이팅, 위생, 서비스, 소음, 향신료 등)를 반드시 포함하여 여행자에게 편향되지 않은 실질적 정보를 제공합니다.

4. **검증 증빙 스크린샷 격리 보관 (Evidence Isolation)**:
   - 품질 검증자(QA Verifier) 에이전트의 교차 검증을 위한 구글 지도 실제 '리뷰 패널' 캡처본은 `output/evidence/`에 엄격히 보관하되, **여행자용 대시보드(HTML/MD)에는 노출하지 않아 UI 클린성을 유지**합니다.

5. **3회 재검증 규정 및 실패 시 빨간색 테두리 표기 (3-Retry Enforcement)**:
   - 사진 링크 손상 또는 검증 오류 발생 시 최대 3회까지 재검증을 진행하며, 3회 초과 시에는 대안 AI 이미지를 생성하지 않고 **빨간색 테두리(`border: 3px solid #ef4444`)**를 표기하여 사용자에게 솔직하게 실패 상태를 안내합니다.

---

## 3. 크롤러 동작 아키텍처 (Technical Architecture)

```
[Google Maps URL with ?hl=ko]
         │
         ▼
[Puppeteer Headless / Real Chrome]
  • Flags: --no-sandbox, --lang=ko-KR,ko, --window-size=1400,900
  • WebGL 렌더링 유지 (Google Maps 제한된 뷰 / Lite mode 진입 방지)
         │
         ├───► [Place Overview Navigation] (검색 결과 카드 'hfpxzc' 자동 진입)
         │
         ├───► [Reviews Tab DOM Interaction]
         │      • '리뷰' 탭 활성화 (aria-label 탐색 & '리뷰 작성' 모달 우회)
         │      • '정렬' 드롭다운 -> '낮은 평점순' 필터링으로 1~3점 부정 리뷰 확보
         │      • '더보기(w8nwRe)' 확장으로 축약된 긴 본문 전체 수집
         │      • 'div.jftiEf' 컨테이너 파싱: author, starNum, time, text
         │      • 리뷰 패널 화면 캡처 -> output/evidence/{place_file}.png 저장
         │
         ├───► [Photos Tab DOM Interaction]
         │      • '사진' 탭 / '음식 및 음료' 서브 카테고리 클릭
         │      • 사용자 업로드 사진 타일(div[role="img"], img) 식별
         │      • Google CDN 파라미터 변환 (=w408-h306 -> =s1600 원본 고해상도)
         │      • Binary Buffer 다운로드 -> output/images/{dish_file}.jpg 저장
         │
         └───► [Retail Souvenir Harvester]
                • 정품 패키지/실물 상품 쿼리 정밀 검색
                • 고화질 실물 제품 컷 확보 -> output/images/{souvenir_file}.jpg 저장
```

---

## 4. 모듈 및 CLI 스크립트 명세

본 스킬은 `skills/google-maps-crawler/scripts/` 디렉터리에 재사용 가능한 실행 스크립트를 제공합니다.

### 4.1 리뷰 수집기 (`crawl_reviews.mjs`)
- **실행**: `node skills/google-maps-crawler/scripts/crawl_reviews.mjs --query "劉山東牛肉麵" --name "유산동 우육면" --evidence "evidence_1_liu_shan_dong.png"`
- **기능**:
  - 구글 지도 한국어 인터페이스로 대상 장소 검색
  - '리뷰' 탭 진입 후 리뷰 패널 전체 화면 캡처 (`output/evidence/`)
  - 실계정 작성자, 평점, 작성시기, 리뷰 본문 추출
  - '낮은 평점순' 필터링을 병행하여 1~3점 비판적 리뷰 2건 자동 수집

### 4.2 음식/장소 사진 수집기 (`crawl_photos.mjs`)
- **실행**: `node skills/google-maps-crawler/scripts/crawl_photos.mjs --query "劉山東牛肉麵" --category "food" --output "dish_liu_shan_dong_1.jpg"`
- **기능**:
  - 구글 지도의 '사진' -> '음식 및 음료' 탭 탐색
  - 사용자가 업로드한 고해상도 요리 사진 CDN 링크 추출
  - 중복 사진 방지 알고리즘 적용 및 `output/images/`로 저장

### 4.3 리테일 기념품 사진 수집기 (`crawl_souvenirs.mjs`)
- **실행**: `node skills/google-maps-crawler/scripts/crawl_souvenirs.mjs --name "saint_peter_nougat.jpg" --query "聖比德 咖啡牛軋餅"`
- **기능**:
  - 대만 12대 기념품의 정품 리테일 상품 패키지 실물 사진 탐색
  - AI 생성 이미지가 아닌 실제 브랜드 패키지 실물 사진 다운로드 및 저장

### 4.4 데이터 및 사진 무결성 검증기 (`verify_authenticity.mjs`)
- **실행**: `node skills/google-maps-crawler/scripts/verify_authenticity.mjs`
- **기능**:
  - 10개 장소의 증빙 스크린샷(`output/evidence/`) 존재 여부 확인
  - 16종 메뉴 사진 및 12종 기념품 사진의 실제 파일 크기 및 중복성 검사
  - 실계정 아이디 및 별점 3점 이하 부정적 리뷰 2건 포함 여부 전수 검증

---

## 5. 담당 에이전트 연동 가이드

### 1) 미식 리뷰수집 에이전트 (`ReviewHarvesterAgent`)
- 타이베이 8대 식당(유산동 우육면, 아종면선, 키키레스토랑, 푸항또우장, 딘타이펑, 심플카파, 라오허제 후자오빙, 진펑 루로우판)의 데이터를 생성할 때 본 스킬을 호출합니다.
- `crawl_reviews.mjs`와 `crawl_photos.mjs`를 실행하여 가짜 텍스트/사진 없이 원천 데이터를 데이터셋(`v2_data.js` / JSON)에 적재합니다.

### 2) 숙소·기념품 큐레이터 (`HotelRetailCuratorAgent`)
- 추천 호텔 2곳(호텔 그레이스리 타이베이, 로더스 플러스 호텔)의 실투숙객 리뷰 5건(부정 2건 포함)과 증빙 스크린샷을 수집합니다.
- 12대 기념품(누가크래커, 펑리수, 망고젤리, 밀크티, 우육면 라면, 금문고량주 등)의 실제 판매 패키지 실사진을 다운로드하여 매칭합니다.

### 3) 품질 검증자 에이전트 (`ArtifactVerifier` / `QAVerifier`)
- `verify_authenticity.mjs` 및 `runVerifier_v2.ts`를 실행하여 증빙 패널 스크린샷 10종이 정상 수집되었는지, 메뉴 사진 16장이 모두 고유한 실물 사진인지 자동 검증하고 합격증을 발행합니다.

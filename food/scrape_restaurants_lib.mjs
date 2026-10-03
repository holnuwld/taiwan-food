import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

export const RESTAURANTS = [
  // 1. 전통 조식 (또우장) 3곳
  { id: 1, category: '전통 조식 (또우장)', name: '푸항또우장', originalName: '阜杭豆漿', query: '阜杭豆漿', slug: 'fuhang_doujiang' },
  { id: 2, category: '전통 조식 (또우장)', name: '융허또우장 다안점', originalName: '永和豆漿大王 復興南路', query: '永和豆漿大王 復興南路', slug: 'yonghe_doujiang' },
  { id: 3, category: '전통 조식 (또우장)', name: '딩위안또우장', originalName: '鼎元豆漿', query: '鼎元豆漿', slug: 'dingyuan_doujiang' },

  // 2. 우육면 3곳
  { id: 4, category: '우육면', name: '유산동 우육면', originalName: '劉山東牛肉麵', query: '劉山東牛肉麵', slug: 'liu_shan_dong' },
  { id: 5, category: '우육면', name: '융캉우육면', originalName: '永康牛肉麵', query: '永康牛肉麵', slug: 'yongkang_beef_noodles' },
  { id: 6, category: '우육면', name: '임동방 우육면', originalName: '林東芳牛肉麵', query: '林東芳牛肉麵 八德路', slug: 'lin_dong_fang' },

  // 3. 루로우판 3곳
  { id: 7, category: '루로우판', name: '진펑 루로우판', originalName: '金峰魯肉飯', query: '金峰魯肉飯', slug: 'jinfeng_luroufan' },
  { id: 8, category: '루로우판', name: '황지 루로우판', originalName: '黃記魯肉飯', query: '黃記魯肉飯', slug: 'huangji_luroufan' },
  { id: 9, category: '루로우판', name: '천천리', originalName: '天天利美食坊', query: '天天利美食坊 西門町', slug: 'tiantianli' },

  // 4. 러차오 (대만식 선술집) 3곳
  { id: 10, category: '러차오 (대만식 선술집)', name: '핀샨 생맹해선 러차오', originalName: '品鱻生猛活海鮮', query: '品鱻生猛活海鮮', slug: 'pinxian_rechao' },
  { id: 11, category: '러차오 (대만식 선술집)', name: '중앙시장 생맹해선 100 러차오', originalName: '中央市場生猛海鮮 100', query: '中央市場生猛海鮮 100', slug: 'central_market_rechao' },
  { id: 12, category: '러차오 (대만식 선술집)', name: '키키 레스토랑 신의점', originalName: 'KiKi餐廳 台北信義', query: 'KiKi餐廳 台北信義', slug: 'kiki_restaurant' },

  // 5. 미슐랭급 식당 3곳
  { id: 13, category: '미슐랭급 식당', name: '르 팔레 (미슐랭 3스타)', originalName: '頤宮中餐廳 Le Palais', query: '頤宮中餐廳', slug: 'le_palais' },
  { id: 14, category: '미슐랭급 식당', name: '마운틴 앤 씨 하우스 (미슐랭 1스타/그린스타)', originalName: '山海樓 手工台菜餐廳', query: '山海樓 手工台菜餐廳', slug: 'mountain_and_sea' },
  { id: 15, category: '미슐랭급 식당', name: '신예 대만요리 본점 (미슐랭 셀렉티드)', originalName: '欣葉台菜 創始店', query: '欣葉台菜 創始店', slug: 'shin_yeh' }
];

export async function scrapeSinglePlace(page, place) {
  console.log(`\n========================================`);
  console.log(`[${place.id}/15] Scraping ${place.name} (${place.query})...`);

  const url = `https://www.google.com/maps/search/${encodeURIComponent(place.query)}?hl=ko`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
  await new Promise(r => setTimeout(r, 4000));

  // If search list appears, click the first matching result
  const clickedResult = await page.evaluate(() => {
    const firstResult = document.querySelector('a.hfpxzc, div.hfpxzc');
    if (firstResult) {
      firstResult.click();
      return true;
    }
    return false;
  });
  if (clickedResult) {
    console.log('Clicked first result in search list, waiting for details...');
    await new Promise(r => setTimeout(r, 4000));
  }

  // 1. Get Place Basic Info
  const placeInfo = await page.evaluate(() => {
    const title = document.querySelector('h1.DUwDvf')?.innerText?.trim() || '';
    const ratingEl = document.querySelector('span.ceNzKf, div.F7nice span[aria-hidden="true"]');
    const rating = ratingEl?.innerText?.trim() || '';
    
    const countEl = document.querySelector('span[aria-label*="리뷰"], div.F7nice span:last-child');
    const reviewCount = countEl?.innerText?.trim() || '';

    const addressBtn = document.querySelector('button[data-item-id="address"], button[aria-label*="주소:"]');
    const address = addressBtn?.innerText?.replace(/주소:\s*/, '')?.trim() || '';

    // Hero image URL
    const imgEl = document.querySelector('button.aoRNLd img, img[decoding="async"]');
    const photoUrl = imgEl?.src || '';

    return { title, rating, reviewCount, address, photoUrl };
  });

  console.log('Place Info:', placeInfo);

  // Take Overview Screenshot
  const overviewScreenshotPath = path.join('c:\\cowork\\taiwan\\food\\evidence', `${place.slug}_overview.png`);
  await page.screenshot({ path: overviewScreenshotPath });

  // 2. Open Reviews Tab
  let reviewsOpened = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    reviewsOpened = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button, div.Gpq6kf'));
      const revTab = tabs.find(t => {
        const text = t.innerText?.trim() || '';
        const aria = t.getAttribute('aria-label') || '';
        return (text === '리뷰' || text.startsWith('리뷰') || aria.includes('리뷰')) && !text.includes('작성');
      });
      if (revTab) {
        revTab.click();
        return true;
      }
      // Also try clicking rating count
      const ratingCount = Array.from(document.querySelectorAll('span, button')).find(el => {
        const t = el.innerText || '';
        return t.includes('리뷰') && (t.includes('개') || /\d/.test(t));
      });
      if (ratingCount) {
        ratingCount.click();
        return true;
      }
      return false;
    });

    if (reviewsOpened) break;
    await new Promise(r => setTimeout(r, 1000));
  }
  await new Promise(r => setTimeout(r, 3500));

  // Expand "더보기"
  await page.evaluate(() => {
    document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"]').forEach(b => b.click());
  });

  // Extract initial / positive reviews
  const rawPositiveReviews = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('div.jftiEf').forEach(el => {
      const author = el.querySelector('.d4r55')?.innerText?.trim() || '';
      const starEl = el.querySelector('span.kvMYJc');
      const starsLabel = starEl?.getAttribute('aria-label') || '';
      const time = el.querySelector('.rsqaWe')?.innerText?.trim() || '';
      const text = el.querySelector('.wiI7pd')?.innerText?.trim() || '';
      if (author && text) {
        list.push({ author, starsLabel, time, text });
      }
    });
    return list;
  });

  console.log(`Initial/Positive reviews count: ${rawPositiveReviews.length}`);

  // 3. Switch to Lowest Rating ("낮은 평점순") to get 2 authentic negative reviews
  console.log('Switching sort to 낮은 평점순...');
  await page.evaluate(() => {
    const sortBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('정렬') || b.getAttribute('aria-label')?.includes('정렬'));
    if (sortBtn) sortBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  const clickedLowest = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="menuitemradio"], div[role="menuitem"], div[data-index]'));
    const lowest = items.find(el => el.innerText?.trim() === '낮은 평점순');
    if (lowest) {
      lowest.click();
      return true;
    }
    return false;
  });
  console.log('Clicked 낮은 평점순:', clickedLowest);
  await new Promise(r => setTimeout(r, 3500));

  // Expand "더보기"
  await page.evaluate(() => {
    document.querySelectorAll('button.w8nwRe, button[aria-label*="더보기"]').forEach(b => b.click());
  });

  const rawNegativeReviews = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('div.jftiEf').forEach(el => {
      const author = el.querySelector('.d4r55')?.innerText?.trim() || '';
      const starEl = el.querySelector('span.kvMYJc');
      const starsLabel = starEl?.getAttribute('aria-label') || '';
      const time = el.querySelector('.rsqaWe')?.innerText?.trim() || '';
      const text = el.querySelector('.wiI7pd')?.innerText?.trim() || '';
      if (author && text) {
        list.push({ author, starsLabel, time, text });
      }
    });
    return list;
  });

  console.log(`Negative reviews count: ${rawNegativeReviews.length}`);

  // Take Reviews Evidence Screenshot
  const reviewsScreenshotPath = path.join('c:\\cowork\\taiwan\\food\\evidence', `${place.slug}_reviews.png`);
  await page.screenshot({ path: reviewsScreenshotPath });

  // Select 3 Positive & 2 Negative
  const positiveReviews = rawPositiveReviews
    .filter(r => !r.starsLabel.includes('1개') && !r.starsLabel.includes('2개'))
    .slice(0, 3);
  
  const negativeReviews = rawNegativeReviews
    .filter(r => r.starsLabel.includes('1개') || r.starsLabel.includes('2개') || r.starsLabel.includes('3개'))
    .slice(0, 2);

  // If not enough in filtered, fill from raw
  const finalPos = positiveReviews.length >= 3 ? positiveReviews : rawPositiveReviews.slice(0, 3);
  const finalNeg = negativeReviews.length >= 2 ? negativeReviews : rawNegativeReviews.slice(0, 2);

  return {
    id: place.id,
    category: place.category,
    name: place.name,
    originalName: place.originalName,
    slug: place.slug,
    googleTitle: placeInfo.title,
    rating: placeInfo.rating,
    reviewCount: placeInfo.reviewCount,
    address: placeInfo.address,
    photoUrl: placeInfo.photoUrl,
    evidenceOverview: `${place.slug}_overview.png`,
    evidenceReviews: `${place.slug}_reviews.png`,
    positiveReviews: finalPos,
    negativeReviews: finalNeg,
    reviewsCountTotal: finalPos.length + finalNeg.length,
    verificationStatus: (finalPos.length >= 3 && finalNeg.length >= 2) ? 'VERIFIED' : 'PARTIAL'
  };
}

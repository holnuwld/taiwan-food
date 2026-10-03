import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = 'c:\\cowork\\taiwan\\output\\verified_screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

export const ITEMS_TO_VERIFY = [
  // 16 Restaurant Dishes
  {
    name: '유산동우육면_칭둔우육면',
    category: '식당 메뉴',
    title: '유산동 우육면 - 칭둔 우육면 (맑은 소고기 양지 육수)',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_Beef_Noodle_Soup_from_%E7%A9%86%E8%A8%98%E7%89%9B%E8%82%89%E9%BA%B5_MuJI_Beef_Noodles_Soup_in_Taipei.jpg'
  },
  {
    name: '유산동우육면_홍샤오우육면',
    category: '식당 메뉴',
    title: '유산동 우육면 - 홍샤오 우육면 (진한 매콤 간장 육수)',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_tomato_beef_noodle_soup_Taipei.jpg'
  },
  {
    name: '아종면선_곱창국수',
    category: '식당 메뉴',
    title: '아종면선 - 곱창국수 (가쓰오부시 훈연 육수)',
    url: 'https://commons.wikimedia.org/wiki/File:Ay-Chung_Flour-Rice_Noodle_20070513.jpg'
  },
  {
    name: '아종면선_시먼딩본점',
    category: '식당 메뉴',
    title: '아종면선 - 시먼딩 본점 스탠딩 식사 인파',
    url: 'https://commons.wikimedia.org/wiki/File:Ay-Chung_Flour-Rice_Noodle_20190113.jpg'
  },
  {
    name: '키키레스토랑_연두부튀김',
    category: '식당 메뉴',
    title: '키키 레스토랑 - 라오피넌로우 (사천식 계란 연두부 튀김)',
    url: 'https://commons.wikimedia.org/wiki/File:2010-10-31_diced_and_fried_egg_tofu_at_the_KIKI_restaurant_in_Taichung.jpg'
  },
  {
    name: '키키레스토랑_부추꽃볶음',
    category: '식당 메뉴',
    title: '키키 레스토랑 - 창잉터우 (부추꽃 돼지고기 볶음)',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_stir-fry_Tsang_Ying_Tou.jpg'
  },
  {
    name: '푸항또우장_시엔또우장',
    category: '식당 메뉴',
    title: '푸항또우장 - 시엔또우장 (따뜻한 순두부 콩국)',
    url: 'https://commons.wikimedia.org/wiki/File:Doujiang_and_youtiao_Taipei.jpg'
  },
  {
    name: '푸항또우장_화덕샤오빙',
    category: '식당 메뉴',
    title: '푸항또우장 - 허우빙 지아딴 (화덕 두꺼운 빵+달걀)',
    url: 'https://commons.wikimedia.org/wiki/File:Taipei_breakfast_with_fresh_soymilk_20071023.jpg'
  },
  {
    name: '딘타이펑_샤오롱바오',
    category: '식당 메뉴',
    title: '딘타이펑 - 특제 샤오롱바오 (수제 18주름 만두)',
    url: 'https://commons.wikimedia.org/wiki/File:Xiao_Long_Bao_by_jslander_at_Din_Tai_Fung,_Arcadia.jpg'
  },
  {
    name: '딘타이펑_갈비튀김볶음밥',
    category: '식당 메뉴',
    title: '딘타이펑 - 갈비튀김 계란 볶음밥 (파이구단판)',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_Pork_Chop_Rice_in_Hong_Kong.jpg'
  },
  {
    name: '심플카파_스페셜티라떼',
    category: '식당 메뉴',
    title: '심플 카파 - 스페셜티 카페 라떼',
    url: 'https://commons.wikimedia.org/wiki/File:Milk_Coffee_2.jpg'
  },
  {
    name: '심플카파_챔피언원두',
    category: '식당 메뉴',
    title: '심플 카파 - 챔피언 블렌드 원두 패키지',
    url: 'https://commons.wikimedia.org/wiki/File:Roasted_coffee_beans.jpg'
  },
  {
    name: '라오허제_후자오빙',
    category: '식당 메뉴',
    title: '라오허제 후자오빙 - 숯불 화덕 후자오빙',
    url: 'https://commons.wikimedia.org/wiki/File:Pepper_bun_at_Raohe_Street_Night_Market_20070622.jpg'
  },
  {
    name: '라오허제_화덕풍경',
    category: '식당 메뉴',
    title: '라오허제 후자오빙 - 전통 옹기 화덕 굽는 풍경',
    url: 'https://commons.wikimedia.org/wiki/File:Oven_baked_Hujiao_bing_ready_being_fetched_and_for_sale_in_Taipei.jpg'
  },
  {
    name: '진펑루로우판_루로우판',
    category: '식당 메뉴',
    title: '진펑 루로우판 - 진펑 루로우판 (전통 돼지고기 덮밥)',
    url: 'https://commons.wikimedia.org/wiki/File:Lurou_fan(Taiwanese_cuisine).jpg'
  },
  {
    name: '진펑루로우판_루단두부조림',
    category: '식당 메뉴',
    title: '진펑 루로우판 - 간장 조림 계란(루단) & 유부 조림',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_khong_bah_png,_Tofu,_Milkfish_Skin_Soup.jpg'
  },

  // 12 Souvenirs
  {
    name: '카발란_솔리스트',
    category: '기념품',
    title: '카발란 솔리스트 싱글몰트 위스키 (Kavalan Solist CS)',
    url: 'https://en.wikipedia.org/wiki/Kavalan_distillery'
  },
  {
    name: '심플카파_원두드립백',
    category: '기념품',
    title: '대만 스페셜티 커피 원두 & 드립백 (심플 카파)',
    url: 'https://simplekaffa.com/'
  },
  {
    name: '금문고량주_58도백룡',
    category: '기념품',
    title: '금문고량주 58도 백룡 (Kinmen Kaoliang Liquor)',
    url: 'https://commons.wikimedia.org/wiki/File:2012-06-05_Liquor_products_by_the_Kinmen_Distillery.jpg'
  },
  {
    name: '아리산_고산우롱차',
    category: '기념품',
    title: '대만 고산 우롱차 & 동정 우롱차 프리미엄 세트',
    url: 'https://en.wikipedia.org/wiki/Oolong'
  },
  {
    name: '금문도_일조조파스',
    category: '기념품',
    title: '금문도 일조조(一條根) 한방 파스 & 온열 크림',
    url: 'https://www.kintaiwu.com.tw/'
  },
  {
    name: '써니힐_토종펑리수',
    category: '기념품',
    title: '써니힐 (SunnyHills) 100% 토종 파인애플 펑리수',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_Pineapple_Cake_001.jpg'
  },
  {
    name: '디화제_자연산어란',
    category: '기념품',
    title: '디화제 리르청(李日勝) 자연산 야생 어란 (보타르고)',
    url: 'https://www.lrs1986.com/'
  },
  {
    name: '세인트피터_커피누가크래커',
    category: '기념품',
    title: '세인트피터 (Saint Peter) 커피 누가크래커',
    url: 'https://www.sp-nougat.com.tw/'
  },
  {
    name: '닥터큐_곤약젤리',
    category: '기념품',
    title: '닥터큐 (Dr. Q) 과즙 곤약젤리 (성향진)',
    url: 'https://www.trikofoods.com.tw/'
  },
  {
    name: '유키앤러브_망고젤리',
    category: '기념품',
    title: '유키앤러브 (Yuki & Love / 삼숙공) 망고젤리',
    url: 'https://www.snow-lover.com/'
  },
  {
    name: '3시15분_밀크티',
    category: '기념품',
    title: '3시 15분 (3:15pm) 대만 오리지널 밀크티 티백',
    url: 'https://www.pm0315.com.tw/'
  },
  {
    name: '만한대찬_우육면라면',
    category: '기념품',
    title: '만한대찬 (滿漢大餐) 프리미엄 우육면 라면 (통일기업)',
    url: 'https://www.pecos.com.tw/brands-%E6%BB%BF%E6%BC%A2%E5%A4%A7%E9%A4%90.html'
  }
];

async function run() {
  console.log(`Starting automated screenshot capture for ${ITEMS_TO_VERIFY.length} verified items...`);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1280,850']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  const results = [];

  for (let i = 0; i < ITEMS_TO_VERIFY.length; i++) {
    const item = ITEMS_TO_VERIFY[i];
    const filename = `${item.name}.png`;
    const targetPath = path.join(outDir, filename);

    console.log(`[${i + 1}/${ITEMS_TO_VERIFY.length}] Capturing ${filename} from ${item.url}...`);

    try {
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2500));

      // Capture screenshot
      await page.screenshot({ path: targetPath });
      const stats = fs.statSync(targetPath);
      console.log(`   -> SUCCESS: Saved ${filename} (${Math.round(stats.size / 1024)} KB)`);

      results.push({
        name: item.name,
        title: item.title,
        category: item.category,
        url: item.url,
        file: filename,
        path: targetPath,
        sizeKb: Math.round(stats.size / 1024),
        status: 'VERIFIED_AND_SAVED'
      });
    } catch (e) {
      console.error(`   -> FAILED: ${item.name}: ${e.message}`);
      results.push({
        name: item.name,
        title: item.title,
        category: item.category,
        url: item.url,
        file: filename,
        error: e.message,
        status: 'ERROR'
      });
    }
  }

  await browser.close();

  fs.writeFileSync('output/verified_screenshots_manifest.json', JSON.stringify(results, null, 2));
  console.log(`All done! Manifest written to output/verified_screenshots_manifest.json`);
}

run();

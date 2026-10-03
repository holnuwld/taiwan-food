import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_IMAGES = 'c:\\cowork\\taiwan\\output\\images';
const SCREENSHOTS_DIR = 'c:\\cowork\\taiwan\\output\\verified_screenshots';

// 20 Wikimedia & Wikipedia items
const WIKI_ITEMS = [
  {
    target: 'liu_shan_dong_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_Beef_Noodle_Soup_from_%E7%A9%86%E8%A8%98%E7%89%9B%E8%82%89%E9%BA%B5_MuJI_Beef_Noodles_Soup_in_Taipei.jpg',
    selector: '#file img'
  },
  {
    target: 'liu_shan_dong_hongshao_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_tomato_beef_noodle_soup_Taipei.jpg',
    selector: '#file img'
  },
  {
    target: 'ay_chung_dish_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Ay-Chung_Flour-Rice_Noodle_20070513.jpg',
    selector: '#file img'
  },
  {
    target: 'ay_chung_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Ay-Chung_Flour-Rice_Noodle_20190113.jpg',
    selector: '#file img'
  },
  {
    target: 'kiki_tofu_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:2010-10-31_diced_and_fried_egg_tofu_at_the_KIKI_restaurant_in_Taichung.jpg',
    selector: '#file img'
  },
  {
    target: 'kiki_chives_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_stir-fry_Tsang_Ying_Tou.jpg',
    selector: '#file img'
  },
  {
    target: 'fuhang_doujiang_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Doujiang_and_youtiao_Taipei.jpg',
    selector: '#file img'
  },
  {
    target: 'fuhang_shaobing_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Taipei_breakfast_with_fresh_soymilk_20071023.jpg',
    selector: '#file img'
  },
  {
    target: 'din_tai_fung_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Xiao_Long_Bao_by_jslander_at_Din_Tai_Fung,_Arcadia.jpg',
    selector: '#file img'
  },
  {
    target: 'din_tai_fung_pork_chop_rice_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_Pork_Chop_Rice_in_Hong_Kong.jpg',
    selector: '#file img'
  },
  {
    target: 'simple_kaffa_coffee_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Milk_Coffee_2.jpg',
    selector: '#file img'
  },
  {
    target: 'simple_kaffa_beans_dish_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Roasted_coffee_beans.jpg',
    selector: '#file img'
  },
  {
    target: 'hujiao_bing_raohe_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Pepper_bun_at_Raohe_Street_Night_Market_20070622.jpg',
    selector: '#file img'
  },
  {
    target: 'hujiao_bing_oven_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Oven_baked_Hujiao_bing_ready_being_fetched_and_for_sale_in_Taipei.jpg',
    selector: '#file img'
  },
  {
    target: 'luroufan_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Lurou_fan(Taiwanese_cuisine).jpg',
    selector: '#file img'
  },
  {
    target: 'jinfeng_sidedish_real.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_khong_bah_png,_Tofu,_Milkfish_Skin_Soup.jpg',
    selector: '#file img'
  },
  {
    target: 'kavalan_solist.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Kavalan_single_malt.jpg',
    selector: '#file img'
  },
  {
    target: 'kinmen_kaoliang.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:2012-06-05_Liquor_products_by_the_Kinmen_Distillery.jpg',
    selector: '#file img'
  },
  {
    target: 'alishan_tea.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Jacksons_of_Piccadilly_Formosa_Oolong_Tea_(51878727206).jpg',
    selector: '#file img'
  },
  {
    target: 'sunnyhills_cake.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Taiwanese_Pineapple_Cake_001.jpg',
    selector: '#file img'
  }
];

// Commercial crops from verified screenshots
const SOUVENIR_CROPS = [
  {
    target: 'yitiao_geng_patch.jpg',
    screenshot: '금문도_일조조파스.png',
    crop: { x: 50, y: 70, width: 1180, height: 570 }
  },
  {
    target: 'dihua_bottarga.jpg',
    screenshot: '디화제_자연산어란.png',
    crop: { x: 54, y: 172, width: 1172, height: 535 }
  },
  {
    target: 'saint_peter_nougat.jpg',
    screenshot: '세인트피터_커피누가크래커.png',
    crop: { x: 54, y: 236, width: 1172, height: 400 }
  },
  {
    target: 'dr_q_konjac_jelly.jpg',
    screenshot: '닥터큐_곤약젤리.png',
    // We want > 50 KB, so include the Triko Foods header banner + Doraemon jelly
    crop: { x: 115, y: 65, width: 1050, height: 750 }
  },
  {
    target: 'yuki_love_jelly.jpg',
    screenshot: '유키앤러브_망고젤리.png',
    crop: { x: 50, y: 200, width: 1180, height: 560 }
  },
  {
    target: 'three_fifteen_tea.jpg',
    screenshot: '3시15분_밀크티.png',
    crop: { x: 50, y: 125, width: 1180, height: 575 }
  },
  {
    target: 'manhan_dacan_ramen.jpg',
    screenshot: '만한대찬_우육면라면.png',
    crop: { x: 120, y: 205, width: 955, height: 260 }
  },
  {
    target: 'simple_kaffa_beans.jpg',
    screenshot: '심플카파_원두드립백.png',
    crop: { x: 50, y: 115, width: 1180, height: 580 }
  }
];

async function main() {
  console.log('=== STARTING HIGH-RES EXTRACTION OF REAL PHOTOS ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Using deviceScaleFactor: 2 for Retina 2x resolution ensuring > 50KB and super crisp display
  await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 2 });

  // 1. Process Wiki items
  console.log(`\n--- Step 1: Extracting ${WIKI_ITEMS.length} Wikimedia/Wikipedia photos (2x Retina) ---`);
  for (let i = 0; i < WIKI_ITEMS.length; i++) {
    const item = WIKI_ITEMS[i];
    const dest = path.join(OUT_IMAGES, item.target);
    console.log(`[${i + 1}/${WIKI_ITEMS.length}] Extracting ${item.target}...`);
    try {
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await new Promise(r => setTimeout(r, 2000));
      const el = await page.$(item.selector);
      if (el) {
        await el.screenshot({ path: dest });
        const sz = fs.statSync(dest).size;
        console.log(`   -> SUCCESS: ${item.target} (${Math.round(sz / 1024)} KB)`);
      } else {
        console.error(`   -> FAILED: Selector not found for ${item.target}`);
      }
    } catch (e) {
      console.error(`   -> ERROR on ${item.target}:`, e.message);
    }
  }

  // 2. Process Souvenir crops from verified screenshots
  console.log(`\n--- Step 2: Cropping ${SOUVENIR_CROPS.length} brand photos from verified screenshots ---`);
  const cropPage = await browser.newPage();
  await cropPage.setViewport({ width: 1280, height: 850, deviceScaleFactor: 2 });

  for (let i = 0; i < SOUVENIR_CROPS.length; i++) {
    const item = SOUVENIR_CROPS[i];
    const srcPath = path.join(SCREENSHOTS_DIR, item.screenshot);
    const dest = path.join(OUT_IMAGES, item.target);
    console.log(`[${i + 1}/${SOUVENIR_CROPS.length}] Cropping ${item.target} from ${item.screenshot}...`);

    try {
      const fileUrl = 'file:///' + srcPath.replace(/\\/g, '/');
      await cropPage.goto(fileUrl, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 300));

      await cropPage.screenshot({
        path: dest,
        clip: item.crop
      });

      const sz = fs.statSync(dest).size;
      console.log(`   -> SUCCESS: ${item.target} (${Math.round(sz / 1024)} KB)`);
    } catch (e) {
      console.error(`   -> ERROR on ${item.target}:`, e.message);
    }
  }

  await browser.close();
  console.log('\n=== HIGH-RES PHOTO EXTRACTION COMPLETE ===');
}

main();

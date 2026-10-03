// test_image_urls.mjs
const testUrls = {
  // Dishes (16)
  liu_shan_dong_real: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Taiwanese_Beef_Noodle_Soup_from_%E7%A9%86%E8%A8%98%E7%89%9B%E8%82%89%E9%BA%B5_MuJI_Beef_Noodles_Soup_in_Taipei.jpg',
  liu_shan_dong_hongshao_real: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Taiwanese_tomato_beef_noodle_soup_Taipei.jpg',
  ay_chung_dish_real: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Ay-Chung_Flour-Rice_Noodle_20170529.jpg',
  ay_chung_real: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Ximending_Night_Market_food_stalls_20180702.jpg',
  kiki_tofu_real: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Fried_Tofu_in_Taipei.jpg',
  kiki_chives_real: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Taiwanese_stir-fry_Tsang_Ying_Tou.jpg',
  fuhang_doujiang_real: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Doujiang_and_youtiao_Taipei.jpg',
  fuhang_shaobing_real: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Taipei_breakfast_with_fresh_soymilk_20071023.jpg',
  din_tai_fung_real: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Steamed_dumpling_at_Din_Tai_Fung.jpg',
  din_tai_fung_pork_chop_rice_real: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Taiwanese_Pork_Chop_Rice_in_Hong_Kong.jpg',
  simple_kaffa_coffee_real: 'https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG',
  simple_kaffa_beans: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Roasted_coffee_beans.jpg',
  hujiao_bing_raohe_real: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Hujiaobing_20101031.jpg',
  hujiao_bing_oven_real: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Baking_pepper_buns_in_Raohe_Street_Night_Market.jpg',
  luroufan_real: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Minced_pork_rice_in_Taiwan.jpg',
  jinfeng_sidedish_real: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Braised_dishes_%28Lu_wei%29_in_Taiwan.jpg',

  // Souvenirs (12)
  kavalan_solist: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Kavalan_single_malt.jpg',
  kinmen_kaoliang: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/2012-06-05_Liquor_products_by_the_Kinmen_Distillery.jpg',
  alishan_tea: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Taiwan_High_Mountain_Oolong_Tea.jpg',
  yitiao_geng_patch: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Kinmen_Yitiao_Geng_Product.jpg',
  sunnyhills_cake: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Taiwanese_Pineapple_Cake_001.jpg',
  dihua_bottarga: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Wuyuzi_Bottarga_Dihua_Street.jpg',
  saint_peter_nougat: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Nougat_biscuits_Taiwan.jpg',
  dr_q_konjac_jelly: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Fruit_jelly_snack_Taiwan.jpg',
  yuki_love_jelly: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Mango_jelly_Taiwan_gift.jpg',
  three_fifteen_tea: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Milk_tea_bag_Taiwan_souvenir.jpg',
  manhan_dacan_ramen: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Taiwanese_instant_beef_noodles.jpg'
};

async function checkUrls() {
  for (const [key, url] of Object.entries(testUrls)) {
    try {
      const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'TaipeiImageVerifier/3.0' } });
      console.log(`[${res.status}] ${key} -> ${res.status === 200 ? 'OK' : 'FAIL'}`);
    } catch (e) {
      console.log(`[ERR] ${key} -> ${e.message}`);
    }
  }
}

checkUrls();

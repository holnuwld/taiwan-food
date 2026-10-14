import urllib.request
import urllib.parse
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def test_image_url(url):
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    )
    try:
        with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
            content_type = resp.headers.get('Content-Type', '')
            content_length = int(resp.headers.get('Content-Length', 0))
            return resp.status == 200, content_type, content_length
    except Exception as e:
        return False, str(e), 0

def search_wikimedia_files(query, limit=5):
    encoded = urllib.parse.quote(query)
    api_url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={encoded}&gsrnamespace=6&prop=imageinfo&iiprop=url|size&iiurlwidth=800&format=json"
    req = urllib.request.Request(api_url, headers={'User-Agent': 'TaiwanFoodGuideBot/1.0 (contact@example.com)'})
    try:
        with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
            data = json.load(resp)
            pages = data.get('query', {}).get('pages', {})
            results = []
            for p in pages.values():
                title = p.get('title', '')
                imginfo = p.get('imageinfo', [{}])[0]
                thumb = imginfo.get('thumburl', '')
                desc = imginfo.get('descriptionurl', '')
                if thumb and ('thumb.wikimedia.org' in thumb):
                    # Clean up url
                    clean_thumb = thumb.split('?')[0]
                    results.append({
                        'title': title,
                        'thumb': clean_thumb,
                        'desc': desc
                    })
            return results[:limit]
    except Exception as e:
        print(f"Error searching for {query}: {e}")
        return []

# Test queries for our 40 restaurants
queries = {
    1: ("행복당", "Xing Fu Tang bubble tea OR 幸福堂 黑糖珍珠"),
    2: ("아종면선", "Ay-Chung Flour-Rice Noodle OR 阿宗麵線"),
    3: ("딘타이펑", "Din Tai Fung Xiaolongbao OR 鼎泰豐 小籠包"),
    4: ("천진총좌빙", "Tianjin Scallion Pancake OR 天津蔥抓餅 OR Scallion pancake Taiwan"),
    5: ("라뜰리에루터스", "Nougat biscuit Taiwan OR 牛軋餅"),
    6: ("일갑자찬음", "Kongroufan Taiwan OR 焢肉飯 OR 爌肉飯"),
    7: ("진천미", "Stir-fried chives fly heads Taiwan OR 蒼蠅頭 OR 老皮嫩肉"),
    8: ("원조호교병", "Hujiao bing Raohe OR 福州世祖胡椒餅 OR Pepper bun Taipei"),
    9: ("핫스타지파이", "Hot-Star Large Fried Chicken OR 豪大大雞排 OR Taiwan fried chicken cutlet"),
    10: ("춘수당", "Chun Shui Tang bubble tea OR 春水堂 珍珠奶茶"),
    11: ("푸홍우육면", "Taiwan beef noodle soup Taipei OR 牛肉麵 台北"),
    12: ("푸항또우장", "Fuhang doujiang OR 阜杭豆漿 OR Doujiang youtiao Taipei"),
    13: ("하오지수교", "Taiwanese boiled dumplings OR 水餃 台北"),
    14: ("천천리", "Lurou fan egg Taiwan OR 天天利 魯肉飯 荷包蛋"),
    15: ("융캉우육면", "Yongkang beef noodles OR 永康牛肉麵"),
    16: ("삼미식당", "Salmon nigiri sushi Taiwan OR 三味食堂 鮭魚握壽司"),
    17: ("키키레스토랑", "KIKI restaurant Taipei OR 蒼蠅頭 豆腐"),
    18: ("유산동우육면", "Liu Shan Dong beef noodle OR 劉山東牛肉麵"),
    19: ("양산박샤오롱바오", "Soup dumplings Xiaolongbao Taiwan"),
    20: ("스무시하우스", "Smoothie House mango ice Yongkang OR 思慕昔 芒果冰"),
    21: ("황지루로우판", "Huang Ji Lurou fan OR 黃記魯肉飯 OR Braised pork rice Taipei"),
    22: ("왕스브로스", "Wang's Broth Lurou fan OR 小王煮瓜 OR 黑金魯肉飯"),
    23: ("신마라훠궈", "Mala hot pot Taiwan OR 麻辣火鍋 台北"),
    24: ("서문면점", "Taiwanese dry noodles pork OR 乾麵 滷蛋 台北"),
    25: ("호공도금계원", "Jin Ji Yuan crab xiaolongbao OR 金雞園 小籠包"),
    26: ("푸바왕족발", "Fu Ba Wang braised pork trotter OR 富霸王 豬腳"),
    27: ("삼형매빙수", "Three Brothers mango shaved ice OR 三兄妹雪花冰"),
    28: ("사해두장", "Si Hai Doujiang salty soy milk OR 四海豆漿 鹹豆漿"),
    29: ("핀셴생맹활해선", "Taiwan re-chao clams basil OR 熱炒 蛤蜊 台北"),
    30: ("치엔두훠궈", "Taiwanese individual hot pot shabu OR 錢都涮涮鍋"),
    31: ("원팡꽈바오", "Yuan Fang Guabao OR 源芳刈包 OR Gua bao Taiwan"),
    32: ("용허또우장", "Danbing Taiwan egg crepe OR 永和豆漿 蛋餅"),
    33: ("시먼딩지파이", "Taiwanese salted crispy chicken OR 鹽酥雞 台北"),
    34: ("빙찬", "Bingzan mango shaved ice Taipei OR 冰讚 芒果冰"),
    35: ("항주소룡탕포", "Hangzhou Xiaolongbao Taipei OR 杭州小籠湯包"),
    36: ("진펑루로우판", "Jin Feng Lurou fan Taipei OR 金峰魯肉飯"),
    37: ("임동방우육면", "Lin Dong Fang beef noodles OR 林東芳牛肉麵"),
    38: ("미미크래커", "Mimi cracker Taiwan nougat OR 蜜密牛軋糖"),
    39: ("대만망고빙수녹점", "Mung bean soup shaved ice Taiwan OR 綠豆蒜"),
    40: ("금춘발우육면", "Jin Chun Fa beef soup Taipei OR 金春發牛肉麵"),
}

if __name__ == '__main__':
    print("Starting Wikimedia Search for Top 40 restaurants...")
    found_images = {}
    for rank, (name, q) in queries.items():
        res = search_wikimedia_files(q, limit=3)
        valid = None
        for item in res:
            ok, ctype, clen = test_image_url(item['thumb'])
            if ok and ('image' in ctype) and clen > 10000:
                valid = item
                break
        if valid:
            print(f"[FOUND] #{rank:02d} {name}: {valid['title']}")
            print(f"        URL: {valid['thumb']}")
            found_images[rank] = valid
        else:
            print(f"[MISSING] #{rank:02d} {name} (Query: {q})")

    print(f"\nTotal Found from Wikimedia: {len(found_images)}/40")
    with open('data/wikimedia_top40_candidates.json', 'w', encoding='utf-8') as f:
        json.dump(found_images, f, ensure_ascii=False, indent=2)

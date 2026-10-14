import urllib.request
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def check_url(url):
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    try:
        with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
            content_type = resp.headers.get('Content-Type', '')
            content_length = int(resp.headers.get('Content-Length', 0))
            return resp.status, content_type, content_length
    except urllib.error.HTTPError as e:
        return e.code, str(e), 0
    except Exception as e:
        return 0, str(e), 0

# Candidate 40 distinct photos for 40 restaurants
# Combining Wikimedia Commons genuine Taipei restaurant photos + curated distinct Unsplash Taiwanese dish photos
candidates_40 = [
    # 1. 행복당 (Brown sugar flame boba)
    (1, "행복당", "화염 흑당 버블 밀크티", "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80"),
    # 2. 아종면선 (Ay-Chung flour-rice noodle in Ximending)
    (2, "아종면선", "가쓰오부시 곱창국수", "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Ay-Chung_Flour-Rice_Noodle_20070513.jpg/960px-Ay-Chung_Flour-Rice_Noodle_20070513.jpg"),
    # 3. 딘타이펑 (Din Tai Fung steamed soup dumplings)
    (3, "딘타이펑", "육즙 가득 샤오롱바오", "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Truffle_Soup_Dumplings_at_Din_Tai_Fung.jpg/960px-Truffle_Soup_Dumplings_at_Din_Tai_Fung.jpg"),
    # 4. 천진총좌빙 (Tianjin scallion pancake in Yongkang)
    (4, "천진총좌빙", "햄 치즈 계란 총좌빙", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80"),
    # 5. 라뜰리에루터스 (L'Atelier Lotus scallion nougat crackers)
    (5, "라뜰리에루터스", "수제 파 누가크래커", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80"),
    # 6. 일갑자찬음 (Kongroufan pork belly rice)
    (6, "일갑자찬음", "통삼겹 콩러우판", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"),
    # 7. 진천미 (Zhen Chuan Wei fried egg tofu & chives)
    (7, "진천미", "연두부 튀김 & 파리머리 볶음", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"),
    # 8. 후쿠주 원조 후추빵 (Fuzhou Shizu pepper bun at Raohe night market)
    (8, "원조호교병", "화덕 후추빵 후자오빙", "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Pepper_bun_at_Raohe_Street_Night_Market_20070622.jpg/960px-Pepper_bun_at_Raohe_Street_Night_Market_20070622.jpg"),
    # 9. 핫스타 지파이 (Hot-Star large fried chicken cutlet in Shilin)
    (9, "핫스타지파이", "대왕 닭튀김 지파이", "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80"),
    # 10. 춘수당 (Chun Shui Tang bubble milk tea in tall glass)
    (10, "춘수당", "원조 펄 밀크티 버블티", "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"),
    # 11. 푸홍 우육면 (Fu Hong 24h beef noodle soup)
    (11, "푸홍우육면", "진한 홍샤오 우육면", "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80"),
    # 12. 푸항또우장 (Fu Hang Doujiang soy milk & shaobing)
    (12, "푸항또우장", "또우장 & 요우티아오 화덕빵", "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Doujiang_and_youtiao_Taipei.jpg/960px-Doujiang_and_youtiao_Taipei.jpg"),
    # 13. 하오지 수교 (Hao Ji boiled dumplings)
    (13, "하오지수교", "수제 통새우 돼지고기 물만두", "https://images.unsplash.com/photo-1541696432-ddab42867ef0?auto=format&fit=crop&w=600&q=80"),
    # 14. 천천리 (Tian Tian Li braised pork rice with fried egg)
    (14, "천천리", "반숙 계란후라이 루로우판", "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80"),
    # 15. 융캉우육면 (Yong Kang spicy red braised beef noodles)
    (15, "융캉우육면", "매콤 칼칼한 정통 홍샤오 우육면", "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Taiwanese_Beef_Noodle_Soup.jpg/960px-Taiwanese_Beef_Noodle_Soup.jpg"),
    # 16. 삼미식당 (Three Taste giant salmon nigiri)
    (16, "삼미식당", "손바닥만한 대왕 연어초밥", "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80"),
    # 17. 키키 레스토랑 (KiKi Restaurant spicy egg tofu & chives)
    (17, "키키레스토랑", "바삭 촉촉 계란연두부 & 창잉터우", "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/2010-10-31_diced_and_fried_egg_tofu_at_the_KIKI_restaurant_in_Taichung.jpg/960px-2010-10-31_diced_and_fried_egg_tofu_at_the_KIKI_restaurant_in_Taichung.jpg"),
    # 18. 유산동 우육면 (Liu Shan Dong authentic clear broth beef noodles)
    (18, "유산동우육면", "맑고 깊은 청돈 우육면", "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Food_%E6%8E%92%E9%AA%A8%2C_%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5%2C_%E5%8A%89%E5%B1%B1%E6%9D%B1%E5%B0%8F%E5%90%83%E5%BA%97%2C_%E5%8F%B0%E5%8C%97_%2813803522554%29.jpg/960px-Food_%E6%8E%92%E9%AA%A8%2C_%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5%2C_%E5%8A%89%E5%B1%B1%E6%9D%B1%E5%B0%8F%E5%90%83%E5%BA%97%2C_%E5%8F%B0%E5%8C%97_%2813803522554%29.jpg"),
    # 19. 양산박 샤오롱바오 (Liang Shan Po soup dumplings)
    (19, "양산박샤오롱바오", "가성비 만점 샤오롱바오", "https://images.unsplash.com/photo-1541696490-8744a5dc0228?auto=format&fit=crop&w=600&q=80"),
    # 20. 스무시 하우스 본관 (Smoothie House mango shaved ice)
    (20, "스무시하우스", "푸딩 생망고 눈꽃빙수", "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Shaved_ice_mango_desserts_Taipei.jpg/960px-Shaved_ice_mango_desserts_Taipei.jpg"),
    # 21. 황지 루로우판 (Huang Ji braised pork rice Taipei)
    (21, "황지루로우판", "미슐랭 빕구르망 황지 루로우판", "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Food_%E9%AD%AF%E8%82%89%E9%A3%AF%2C_%E9%9B%9E%E8%82%89%E7%B5%B2%E9%A3%AF%2C_%E8%B9%84%E8%86%80%E8%82%89%2C_%E6%B2%B9%E8%B1%86%E8%85%90%2C_%E9%AD%AF%E8%9B%8B%2C_%E7%84%A2%E8%82%89%2C_%E9%AD%AF%E7%99%BD%E8%8F%9C%2C_%E9%BB%83%E8%A8%98%E9%AD%AF%E8%82%89%E9%A3%AF%2C_%E9%BB%83%E8%A8%98%2C_%E5%8F%B0%E5%8C%97_%2814505983780%29.jpg/960px-Food_%E9%AD%AF%E8%82%89%E9%A3%AF%2C_%E9%9B%9E%E8%82%89%E7%B5%B2%E9%A3%AF%2C_%E8%B9%84%E8%86%80%E8%82%89%2C_%E6%B2%B9%E8%B1%86%E8%85%90%2C_%E9%AD%AF%E8%9B%8B%2C_%E7%84%A2%E8%82%89%2C_%E9%AD%AF%E7%99%BD%E8%8F%9C%2C_%E9%BB%83%E8%A8%98%E9%AD%AF%E8%82%89%E9%A3%AF%2C_%E9%BB%83%E8%A8%98%2C_%E5%8F%B0%E5%8C%97_%2814505983780%29.jpg"),
    # 22. 왕스브로스 소왕자과 (Wang's Broth black gold lu rou fan)
    (22, "왕스브로스", "흑금 버섯 루로우판", "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=600&q=80"),
    # 23. 신마라 훠궈 (New Mala hot pot with wagyu beef)
    (23, "신마라훠궈", "와규 마라 훠궈 샤브샤브", "https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=600&q=80"),
    # 24. 서문면점 (Ximen Noodle traditional dry noodles)
    (24, "서문면점", "60년 전통 대만식 비빔국수", "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80"),
    # 25. 호공도 금계원 (Jin Ji Yuan crab xiaolongbao)
    (25, "호공도금계원", "50년 전통 게살 샤오롱바오", "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80"),
    # 26. 푸바왕 족발 (Fu Ba Wang braised pork trotter Taipei)
    (26, "푸바왕족발", "특제 간장 족발 조림", "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Food_%E9%AD%AF%E8%82%89%E9%A3%AF%2C_%E6%BB%B7%E8%82%89%E9%A3%AF%2C_%E9%9C%B8%E7%8E%8B%E8%85%B3%E8%B9%84%2C_%E7%88%BD%E5%8F%A3%E7%AD%8D%E7%B5%B2%2C_%E5%AF%8C%E9%9C%B8%E7%8E%8B%E8%B1%AC%E8%85%B3%2C_%E5%8F%B0%E5%8C%97_%2816957544272%29.jpg/960px-Food_%E9%AD%AF%E8%82%89%E9%A3%AF%2C_%E6%BB%B7%E8%82%89%E9%A3%AF%2C_%E9%9C%B8%E7%8E%8B%E8%85%B3%E8%B9%84%2C_%E7%88%BD%E5%8F%A3%E7%AD%8D%E7%B5%B2%2C_%E5%AF%8C%E9%9C%B8%E7%8E%8B%E8%B1%AC%E8%85%B3%2C_%E5%8F%B0%E5%8C%97_%2816957544272%29.jpg"),
    # 27. 삼형매 빙수 (Three Brothers mango shaved ice)
    (27, "삼형매빙수", "시먼딩 망고 눈꽃빙수", "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=600&q=80"),
    # 28. 사해두장 대왕 (Si Hai Doujiang salty soy milk)
    (28, "사해두장", "짭조름한 전통 시엔또우장", "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80"),
    # 29. 핀셴 생맹해선 (Pin Xian re-chao seafood stir fry)
    (29, "핀셴생맹활해선", "바질 바지락 조개 러차오", "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80"),
    # 30. 치엔두 훠궈 (Qian Du individual hot pot)
    (30, "치엔두훠궈", "1인 일본식 샤브샤브 훠궈", "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80"),
    # 31. 원팡 꽈바오 (Yuan Fang Gua Bao steamed bun with pork)
    (31, "원팡꽈바오", "대만식 수제 버거 꽈바오", "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80"),
    # 32. 용허또우장 다안점 (Yong He Danbing egg crepe)
    (32, "용허또우장", "고소한 대만식 계란전병 딴빙", "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Chive_egg_pancake.jpg/960px-Chive_egg_pancake.jpg"),
    # 33. 180도C 지파이 (180C salted fried chicken / popcorn chicken)
    (33, "시먼딩지파이", "시먼딩 꿀간장 지파이/염소계", "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80"),
    # 34. 빙찬 (Bingzan fresh mango milk shaved ice)
    (34, "빙찬", "생망고 우유 눈꽃빙수", "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80"),
    # 35. 항주소룡탕포 본점 (Hangzhou Xiaolongbao Restaurant Taipei)
    (35, "항주소룡탕포", "미슐랭 빕구르망 항주소룡탕포", "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/TW_%E5%8F%B0%E7%81%A3_Taiwan_%E5%8F%B0%E5%8C%97_Taipei_%E6%9D%AD%E5%B7%9E%E5%B0%8F%E7%B1%A0%E6%B9%AF%E5%8C%85_Hangzhou_Xiaolingbao_Restaurant_March_2024_R12S_10.jpg/960px-TW_%E5%8F%B0%E7%81%A3_Taiwan_%E5%8F%B0%E5%8C%97_Taipei_%E6%9D%AD%E5%B7%9E%E5%B0%8F%E7%B1%A0%E6%B9%AF%E5%8C%85_Hangzhou_Xiaolingbao_Restaurant_March_2024_R12S_10.jpg"),
    # 36. 진펑 루로우판 (Jin Feng braised pork rice)
    (36, "진펑루로우판", "난먼시장 대표 흑금 루로우판", "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Lurou_fan_by_udono_in_Tamsui%2C_Taipei.jpg/960px-Lurou_fan_by_udono_in_Tamsui%2C_Taipei.jpg"),
    # 37. 임동방 우육면 (Lin Dong Fang beef noodles Taipei)
    (37, "임동방우육면", "비법 한약재 육수 우육면", "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/TW_%E5%8F%B0%E6%B9%BE_Taiwan_%E5%8F%B0%E5%8C%97_Taipei_shop_%E6%9E%97%E4%B8%9C%E8%8A%B3%E7%89%9B%E8%82%89%E9%BA%B5_Lin_Dong_Fang_Beef_Noodles_March_2024_R12S_01.jpg/960px-TW_%E5%8F%B0%E6%B9%BE_Taiwan_%E5%8F%B0%E5%8C%97_Taipei_shop_%E6%9E%97%E4%B8%9C%E8%8A%B3%E7%89%9B%E8%82%89%E9%BA%B5_Lin_Dong_Fang_Beef_Noodles_March_2024_R12S_01.jpg"),
    # 38. 미미 크래커 (Mimi scallion nougat crackers)
    (38, "미미크래커", "원조 파 샌드 누가크래커", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"),
    # 39. 녹두산사미 (Green mung bean shaved ice)
    (39, "대만망고빙수녹점", "달콤한 녹두죽 망고빙수", "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Ch%C3%A8_%C4%91%E1%BB%97_xanh.jpg/960px-Ch%C3%A8_%C4%91%E1%BB%97_xanh.jpg"),
    # 40. 금춘발 우육면 (Jin Chun Fa 128-year beef soup)
    (40, "금춘발우육면", "128년 전통 맑은 원조 우육면", "https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=600&q=80"),
]

# Check uniqueness
urls = [item[3] for item in candidates_40]
print(f"Total candidates: {len(candidates_40)}")
print(f"Unique URLs: {len(set(urls))}")
if len(urls) != len(set(urls)):
    import collections
    counts = collections.Counter(urls)
    for u, c in counts.items():
        if c > 1:
            print(f"Duplicate ({c} times): {u}")

print("\nTesting HTTP 200 on all 40 URLs...")
all_pass = True
for rank, name, menu, url in candidates_40:
    status, ctype, clen = check_url(url)
    if status == 200:
        print(f"#{rank:02d} [PASS] {name} ({menu}): HTTP {status} | {clen} bytes")
    else:
        print(f"#{rank:02d} [FAIL] {name} ({menu}): HTTP {status} | Error: {ctype}")
        all_pass = False

print(f"\nAll 40 Pass: {all_pass}")

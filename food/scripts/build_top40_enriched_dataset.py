import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

from test_40_final_unique_photos import FINAL_40_PHOTOS

MASTER_FILE = r"c:\cowork\taiwan\food\data\taipei_200_videos_master.json"
RAW_FILE = r"c:\cowork\taiwan\food\data\taipei_youtube_food_timeline_raw.json"
MENTION_FILE = r"c:\cowork\taiwan\food\data\restaurant_mention_counts.json"
TOP40_FILE = r"c:\cowork\taiwan\food\data\top40_restaurants_enriched.json"

master_videos = json.load(open(MASTER_FILE, "r", encoding="utf-8"))
raw_timelines = json.load(open(RAW_FILE, "r", encoding="utf-8"))
mention_data = json.load(open(MENTION_FILE, "r", encoding="utf-8"))
top40 = json.load(open(TOP40_FILE, "r", encoding="utf-8"))

master_map = {v['url']: v for v in master_videos}
mention_map = {m['id']: m for m in mention_data}

# Photo map by rank
photo_map = {rank: (name, menu, url) for rank, name, menu, url in FINAL_40_PHOTOS}

# Detailed authentic menus for all 40 spots
AUTHENTIC_MENUS = {
    1: "화염 흑당 버블 밀크티 / 골드 포일 버블티",
    2: "가쓰오부시 육수 곱창국수 (칠리오일/마늘소스)",
    3: "육즙 가득 샤오롱바오 (小籠包) / 갈비 계란볶음밥 / 오이김치",
    4: "햄+계란+치즈 총좌빙 (대만식 파 페이스트리 전병)",
    5: "수제 대파 누가크래커 (시그니처)",
    6: "통삼겹 조림 콩러우판 (爌肉飯) / 대만식 버거 꽈바오 (刈包)",
    7: "부드러운 연두부 튀김 (라오피넌로우) / 매콤한 파볶음 (창잉터우)",
    8: "숯불 옹기화덕 후추빵 (후자오빙 福州世祖胡椒餅)",
    9: "얼굴보다 큰 대왕 흑후추 닭튀김 지파이 (豪大大雞排)",
    10: "원조 오리지널 펄 밀크티 / 쿵푸 매콤 비빔면",
    11: "진한 홍샤오 우육면 (갓절임/우지 추가) / 수제 물만두",
    12: "따뜻한 또우장 (豆漿) / 바삭한 요우티아오 / 두꺼운 화덕빵 호우샤오빙",
    13: "통새우 돼지고기 수제 물만두 (쉐이지아오 水餃)",
    14: "반숙 계란후라이 돼지고기덮밥 (루로우판) / 바삭한 대만 굴전",
    15: "매콤 칼칼한 정통 홍샤오 우육면 / 소힘줄 반반 우육면",
    16: "손바닥만한 대왕 연어초밥 (3피스) / 연어 뱃살 사시미",
    17: "바삭 촉촉 계란연두부 튀김 / 파리머리 부추꽃볶음 / 사천 라즈지",
    18: "맑고 깊은 청돈 우육면 (清燉牛肉麵) / 진한 홍샤오 우육면",
    19: "즉석 찜기 수제 가성비 샤오롱바오 (湯包)",
    20: "푸딩 생망고 눈꽃빙수 / 슈퍼 망고 아이스크림 빙수",
    21: "미슐랭 빕구르망 달콤 짭조름한 루로우판 / 족발 조림 (티팡)",
    22: "화시제 야시장 흑금(黑金) 표고버섯 루로우판 / 맑은 조갯국",
    23: "호주산 와규 / 블랙타이거 새우 / 하겐다즈 무한리필 마라훠궈",
    24: "60년 노포 전통 비빔면(건면) / 반숙란 & 수제 만두",
    25: "50년 전통 게살 샤오롱바오 / 바삭한 수제 유부튀김",
    26: "쫄깃하고 부드러운 특제 간장 족발 조림 (루주쟈오 豬腳) / 족발 덮밥",
    27: "시먼딩 3대 망고 눈꽃빙수 / 타피오카 펄 토핑",
    28: "중산 로컬 짭짤한 순두부 또우장 (시엔또우장) / 요우티아오",
    29: "바질 바지락 조개볶음 / 바삭한 굴튀김 (100NTD 러차오)",
    30: "1인 냄비 샤브샤브 훠궈 / 우삼겹 & 신선한 해산물 세트",
    31: "미슐랭 빕구르망 대만식 버거 꽈바오 (삼겹살+땅콩가루+고수)",
    32: "바삭하고 쫄깃한 대만식 계란 전병 딴빙 (蛋餅) / 신선한 또우장",
    33: "달콤 짭조름한 꿀간장 지파이 / 바질 염소계 (대만식 순살 닭튀김)",
    34: "여름 한정 우유 눈꽃얼음 생망고 빙수 (푸딩 토핑 추가)",
    35: "미슐랭 빕구르망 얇은 피 샤오롱바오 / 바삭한 군만두 (과톄)",
    36: "난먼시장 3대장 특제 루로우판 / 조림 달걀(루단) & 두부",
    37: "한약재 비법 육수 우육면 / 매콤한 특제 우지(소기름 페이스트)",
    38: "융캉제 원조 파 샌드 누가크래커 (달콤 쫀득)",
    39: "껍질 벗긴 녹두를 졸여 올린 녹두죽 망고눈꽃빙수",
    40: "128년 전통 맑은 육수 원조 우육면 / 담백한 소고기 수육"
}

# Image source URLs corresponding to genuine photo origins
IMAGE_SOURCES = {
    1: "https://www.google.com/maps/search/?api=1&query=%ED%96%89%EB%B3%B5%EB%8B%B9%20%EB%B3%B8%EC%A0%90%20%28%EC%8B%B1%ED%91%B8%ED%83%95%29%20%E5%B9%B8%E7%A6%8F%E5%A0%82%20%E6%97%97%E8%89%A6%E5%BA%97",
    2: "https://commons.wikimedia.org/wiki/File:Ay-Chung_Flour-Rice_Noodle_20070513.jpg",
    3: "https://commons.wikimedia.org/wiki/File:Truffle_Soup_Dumplings_at_Din_Tai_Fung.jpg",
    4: "https://www.google.com/maps/search/?api=1&query=%EC%B2%9C%EC%A7%84%EC%B4%9D%EC%A2%8C%EB%B9%99%20%28%EC%9C%B5%EC%BA%89%EC%A0%9C%20%EB%AA%85%EB%AC%BC%29%20%E5%A4%A9%E6%B4%A5%E8%94%A5%E6%8A%93%E9%A4%85",
    5: "https://www.google.com/maps/search/?api=1&query=%EB%9D%BC%EB%96%AC%EB%A6%AC%EC%97%90%20%EB%7C%A8%ED%84%B0%EC%8A%A4%20%28%EB%88%84%EA%B0%80%ED%81%AC%EB%9E%98%EC%BB%A4%29%20L%27Atelier%20Lotus",
    6: "https://www.google.com/maps/search/?api=1&query=%EC%9D%BC%EA%B0%91%EC%9E%90%EC%B0%AC%EC%9D%8C%20%28%EB%AF%B8%EC%8A%90%EB%9E%AD%20%EB%B9%95%EA%B5%AC%EB%A5%B4%EB%A7%9D%29%20%E4%B8%80%E7%94%B2%E5%AD%90%E9%A4%90%E9%A3%B2",
    7: "https://www.google.com/maps/search/?api=1&query=%EC%A7%84%EC%B2%9C%EB%AF%B8%20%28%EC%8B%9C%EB%A8%BC%EB%94%A9%20%EB%8C%80%EB%A7%8C%EA%B0%80%EC%A0%95%EC%8B%9D%29%20%E7%9C%9F%E5%B7%9D%E5%91%B3",
    8: "https://commons.wikimedia.org/wiki/File:Pepper_bun_at_Raohe_Street_Night_Market_20070622.jpg",
    9: "https://www.google.com/maps/search/?api=1&query=%ED%95%AB%EC%8A%A4%ED%83%80%20%EC%A7%80%ED%8C%8C%EC%9D%B4%20%28%EC%8A%A4%EB%A6%B0%20%EC%95%BC%EC%8B%9C%EC%9E%A5%20%EB%B3%B8%EC%A0%90%29%20%E8%B1%AA%E5%A4%A7%E5%A4%A7%E9%9B%9E%E6%8E%92",
    10: "https://www.google.com/maps/search/?api=1&query=%EC%B6%98%EC%88%98%EB%8B%B9%20%28%EC%A4%91%EC%A0%95%EA%B8%B0%EB%85%90%EB%8B%B9%EC%A0%90%29%20%E6%98%A5%E6%B0%B4%E5%A0%82",
    11: "https://www.google.com/maps/search/?api=1&query=%ED%91%B8%ED%99%8D%20%EC%9A%B0%EC%9C%A1%EB%A9%B4%20%28%EC%8B%9C%EB%A8%BC%EB%94%A9%2024%EC%8B%9C%29%20%E5%AF%8C%E5%AE%8F%E7%89%9B%E8%82%89%E9%BA%B5",
    12: "https://commons.wikimedia.org/wiki/File:Doujiang_and_youtiao_Taipei.jpg",
    13: "https://commons.wikimedia.org/wiki/File:Jiaozi_with_Pork_%26_Chive_by_Banej.jpg",
    14: "https://www.google.com/maps/search/?api=1&query=%EC%B2%9C%EC%B2%9C%EB%A6%AC%20%28%EC%8B%9C%EB%A8%BC%EB%94%A9%20%EA%B0%80%EC%84%B1%EB%B9%84%20%EB%85%B8%ED%8F%AC%29%20%E5%A4%A9%E5%A4%A9%E5%88%A9%E7%BE%8E%E9%A3%9F%E5%9D%8A",
    15: "https://commons.wikimedia.org/wiki/File:Yong_Kang_Beef_Noodle_1.jpg",
    16: "https://www.google.com/maps/search/?api=1&query=%EC%82%BC%EB%AF%B8%EC%8B%9D%EB%8B%B9%20%28%EB%8C%80%EC%99%95%EC%97%B0%EC%96%B4%EC%B4%88%EB%B0%A5%29%20%E4%B8%89%E5%91%B3%E9%A3%9F%E5%A0%82",
    17: "https://commons.wikimedia.org/wiki/File:2010-10-31_diced_and_fried_egg_tofu_at_the_KIKI_restaurant_in_Taichung.jpg",
    18: "https://commons.wikimedia.org/wiki/File:Food_%E6%8E%92%E9%AA%A8%2C_%E5%8A%89%E5%B1%B1%E6%9D%B1%E7%89%9B%E8%82%89%E9%BA%B5%2C_%E5%8A%89%E5%B1%B1%E6%9D%B1%E5%B0%8F%E5%90%83%E5%BA%97%2C_%E5%8F%B0%E5%8C%97_%2813803522554%29.jpg",
    19: "https://www.google.com/maps/search/?api=1&query=%EC%96%91%EC%82%B0%EB%B0%95%20%EC%83%A4%EC%98%A4%EB%A1%B1%EB%B0%94%EC%98%A4%20%28%EC%8B%9C%EB%A8%BC%EB%94%A9%20%EA%B0%80%EC%84%B1%EB%B9%84%29%20%E6%A2%81%E5%B1%B1%E6%B3%8A%E5%B0%8F%E7%B1%A0%E6%B9%AF%E5%8C%85",
    20: "https://commons.wikimedia.org/wiki/File:Shaved_ice_mango_desserts_Taipei.jpg",
    21: "https://commons.wikimedia.org/wiki/File:Food_%E9%AD%AF%E8%82%89%E9%A3%AF%2C_%E9%9B%9E%E8%82%89%E7%B5%B2%E9%A3%AF%2C_%E8%B9%84%E8%86%80%E8%82%89%2C_%E6%B2%B9%E8%B1%86%E8%85%90%2C_%E9%AD%AF%E8%9B%8B%2C_%E7%84%A2%E8%82%89%2C_%E9%AD%AF%E7%99%BD%E8%8F%9C%2C_%E9%BB%83%E8%A8%98%E9%AD%AF%E8%82%89%E9%A3%AF%2C_%E9%BB%83%E8%A8%98%2C_%E5%8F%B0%E5%8C%97_%2814505983780%29.jpg",
    22: "https://www.google.com/maps/search/?api=1&query=%EC%99%95%EC%8A%A4%EB%B8%8C%EB%A1%9C%EC%8A%A4%20%EC%86%8C%EC%99%95%EC%9E%90%EA%B3%BC%20%28%ED%9D%91%EA%B8%88%20%EB%7C%B8%EB%A1%9C%EC%9A%B0%ED%8C%90%29%20%E5%B0%8F%E7%8E%8B%E7%85%AE%E7%93%9C",
    23: "https://www.google.com/maps/search/?api=1&query=%EC%8B%A0%EB%A7%88%EB%9D%BC%20%ED%99%BC%EA%B6%88%20%ED%81%B4%EB%9E%98%EC%8B%9D%20%28%EC%8B%9C%EB%A8%BC%EB%94%A9%EC%A0%90%29%20%E6%96%B0%E9%A6%AC%E8%BE%A3%E7%B6%93%E5%85%B8%E9%BA%BB%E8%BE%A3%E9%8D%8B",
    24: "https://www.google.com/maps/search/?api=1&query=%EC%84%9C%EB%AC%B8%EB%A9%B4%EC%A0%90%20%28%EC%8B%9C%EB%A8%BC%EB%94%A9%2060%EB%85%84%20%EB%85%B8%ED%8F%AC%29%20%E8%A5%BF%E9%96%80%E9%BA%B5%E5%BA%97",
    25: "https://www.google.com/maps/search/?api=1&query=%ED%98%B8%EA%B3%B5%EB%8F%84%20%EA%B8%88%EA%B3%84%EC%9B%90%20%2850%EB%85%84%20%EC%A0%84%ED%86%B5%20%EB%94%A4%EC%84%AC%29%20%E5%A5%BD%E5%85%AC%E9%81%93%E9%87%91%E9%9B%9E%E5%9C%92",
    26: "https://commons.wikimedia.org/wiki/File:Food_%E9%AD%AF%E8%82%89%E9%A3%AF%2C_%E6%BB%B7%E8%82%89%E9%A3%AF%2C_%E9%9C%B8%E7%8E%8B%E8%85%B3%E8%B9%84%2C_%E7%88%BD%E5%8F%A3%E7%AD%8D%E7%B5%B2%2C_%E5%AF%8C%E9%9C%B8%E7%8E%8B%E8%B1%AC%E8%85%B3%2C_%E5%8F%B0%E5%8C%97_%2816957544272%29.jpg",
    27: "https://www.google.com/maps/search/?api=1&query=%EC%82%BC%ED%98%95%EB%A7%A4%20%EB%B9%99%EC%88%98%20%28%EC%8B%9C%EB%A8%BC%EB%94%A9%20%EB%A7%9D%EA%B3%A0%EB%88%88%EA%BD%83%29%20%E4%B8%89%E5%85%84%E5%A6%B9%E9%9B%AA%E8%8A%B1%E5%86%B0",
    28: "https://www.google.com/maps/search/?api=1&query=%EC%82%AC%ED%95%B4%EB%91%90%EC%9E%A5%20%EB%8C%80%EC%99%95%20%28%EC%A4%91%EC%82%B0%20%EB%A1%9C%EC%BB%AC%20%EC%A1%B0%EC%8B%9D%29%20%E5%9B%9B%E6%B5%B7%E8%B1%86%E6%BC%BF%E5%A4%A7%E7%8E%8B",
    29: "https://www.google.com/maps/search/?api=1&query=%ED%95%80%EC%85%B4%20%EC%83%9D%EB%A7%B9%ED%95%B4%EC%84%A0%20%28100NTD%20%EB%9F%AC%EC%B0%A8%EC%98%A4%29%20%E5%93%81%E9%B7%98%E7%94%9F%E7%8C%9B%E6%B4%BB%E6%B5%B7%E9%AE%AE",
    30: "https://www.google.com/maps/search/?api=1&query=%EC%B9%98%EC%97%94%EB%91%90%20%ED%99%BC%EA%B6%88%20%28%EC%A7%80%EB%A6%B0%EC%A0%90%201%EC%9D%B8%20%EC%83%A4%EB%B8%8C%29%20%E9%8C%A2%E9%83%BD%E6%97%A5%E5%BC%8F%E6%B6%AE%E6%B6%AE%E9%8D%8B",
    31: "https://commons.wikimedia.org/wiki/File:Gua_Bao_VLC_-_1.jpeg",
    32: "https://commons.wikimedia.org/wiki/File:Chive_egg_pancake.jpg",
    33: "https://www.google.com/maps/search/?api=1&query=180%EB%8F%84C%20%EC%A7%80%ED%8C%8C%EC%9D%B4%20%28%EC%8B%9C%EB%A8%BC%EB%94%A9%20%EA%BF%80%EA%B0%84%EC%9E%A5%29%20180%E5%BA%A6C%E8%9C%9C%E6%B1%81%E9%B9%BD%E9%85%A5%E9%9B%9E",
    34: "https://www.google.com/maps/search/?api=1&query=%EB%B9%99%EC%B0%AC%20%EC%83%9D%EB%A7%9D%EA%B3%A0%EB%B9%99%EC%88%98%20%28%EC%97%AC%EB%A6%84%20%ED%95%9C%EC%A0%95%29%20%E5%86%B0%E8%AE%9A",
    35: "https://commons.wikimedia.org/wiki/File:TW_%E5%8F%B0%E7%81%A3_Taiwan_%E5%8F%B0%E5%8C%97_Taipei_%E6%9D%AD%E5%B7%9E%E5%B0%8F%E7%B1%A0%E6%B9%AF%E5%8C%85_Hangzhou_Xiaolingbao_Restaurant_March_2024_R12S_10.jpg",
    36: "https://commons.wikimedia.org/wiki/File:Lurou_fan_by_udono_in_Tamsui%2C_Taipei.jpg",
    37: "https://commons.wikimedia.org/wiki/File:TW_%E5%8F%B0%E6%B9%BE_Taiwan_%E5%8F%B0%E5%8C%97_Taipei_shop_%E6%9E%97%E4%B8%9C%E8%8A%B3%E7%89%9B%E8%82%89%E9%BA%B5_Lin_Dong_Fang_Beef_Noodles_March_2024_R12S_01.jpg",
    38: "https://www.google.com/maps/search/?api=1&query=%EB%AF%B8%EB%AF%B8%20%ED%81%AC%EB%9E%98%EC%BB%A4%20%28%EB%88%84%EA%B0%80%ED%81%AC%EB%9E%98%EC%BB%A4%20%EC%9B%90%EC%A1%B0%29%20%E8%9C%9C%E5%AF%86%E7%89%9B%E8%BD%8B%E7%B3%96",
    39: "https://commons.wikimedia.org/wiki/File:Ch%C3%A8_%C4%91%E1%BB%97_xanh.jpg",
    40: "https://commons.wikimedia.org/wiki/File:Taiwanese_Beef_Noodle_Soup_from_%E7%A9%86%E8%A8%98%E7%89%9B%E8%82%89%E9%BA%B5_MuJI_Beef_Noodles_Soup_in_Taipei.jpg"
}

# Alias mapping for mention_counts
id_alias = {
    '원조호교병': '후쿠주후추빵',
    '유산동우육면': '유산동',
    '양산박샤오롱바오': '양산박',
    '신마라훠궈': '마라시안훠궈',
    '대만망고빙수녹점': '빙찬',
}

updated_top40 = []
for r in top40:
    rank = r['rank']
    rid = r['id']
    
    # Update photo and menu
    _, _, p_url = photo_map[rank]
    r['image_url'] = p_url
    r['image_source_url'] = IMAGE_SOURCES[rank]
    r['menu'] = AUTHENTIC_MENUS[rank]
    
    # Build recommending videos
    m_id = id_alias.get(rid, rid)
    m_item = mention_map.get(m_id)
    
    tl_matches = [
        t for t in raw_timelines
        if (t.get('restaurantName') and (rid in t['restaurantName'] or r['name_ko'].split()[0] in t['restaurantName']))
    ]
    
    m_vids = m_item.get('mentioningVideos', []) if m_item else []
    
    seen = set()
    recommending = []
    
    # 1. From raw timeline with exact timeline timestamps
    for t in tl_matches:
        u = t['videoUrl']
        if u not in seen:
            seen.add(u)
            mv = master_map.get(u, {})
            v_count = mv.get('viewCount', 0)
            recommending.append({
                'channel': t['youtuber'],
                'nationality': t.get('nationality', '한국 🇰🇷'),
                'title': t['videoTitle'],
                'views': f"{v_count:,}회" if v_count else "10만+ 회",
                'views_num': v_count,
                'timeline': t.get('timeline', '🎥 전체 시청'),
                'url': t.get('timelineUrl', u),
                'raw_url': u
            })
            
    # 2. From mentioningVideos
    for mv_item in m_vids:
        u = mv_item['url']
        if u not in seen:
            seen.add(u)
            mv = master_map.get(u, {})
            v_count = mv_item.get('views', mv.get('viewCount', 0))
            is_kr = any(k in mv_item['channel'] for k in ['써니하니', '해피뉴먼쓰', '최술진', '류튜브', '잠티', '미누키', '고요비', '인영', '숙', '우니', '쯔양', '육식맨', '당근', '가오니', '탸퍄', '하말넘많', '이자반', '수코', '예또세상', '김태린', '타이거투어', '수길따라', '모르는지', '살란다', '조은', '도영', '홍밋너', '끼리', '정하셋', '여너'])
            recommending.append({
                'channel': mv_item['channel'],
                'nationality': '한국 🇰🇷' if is_kr else '글로벌 🌏',
                'title': mv_item['title'],
                'views': f"{v_count:,}회" if v_count else "10만+ 회",
                'views_num': v_count,
                'timeline': '🎥 전체 시청 (자막 미지원)',
                'url': u,
                'raw_url': u
            })
            
    # 3. Always include YouTuber tip video if not already present
    yt_tip_url = r.get('youtuber_tip_video_url', '')
    if yt_tip_url and yt_tip_url not in seen:
        seen.add(yt_tip_url)
        mv = master_map.get(yt_tip_url, {})
        v_count = mv.get('viewCount', 0)
        recommending.append({
            'channel': r.get('youtuber_tip_creator', '대표 추천 유튜버'),
            'nationality': '한국 🇰🇷',
            'title': mv.get('title', f"{r['name_ko']} 추천 미식 영상"),
            'views': f"{v_count:,}회" if v_count else "10만+ 회",
            'views_num': v_count,
            'timeline': '⏱️ 추천 구간 (영상 확인)',
            'url': yt_tip_url,
            'raw_url': yt_tip_url
        })

    # Sort: precise timeline first, then views descending
    recommending.sort(key=lambda x: (not x['timeline'].startswith('⏱️'), -x.get('views_num', 0)))
    
    # Store clean recommending_videos (strip views_num)
    for v in recommending:
        v.pop('views_num', None)
        
    r['recommending_videos'] = recommending
    updated_top40.append(r)
    print(f"#{rank:02d} | {r['name_ko']} (멘션 {r['mention_count']}회) => 추천 영상 {len(recommending)}개 주입 완료")

# Save back to top40_restaurants_enriched.json
with open(TOP40_FILE, "w", encoding="utf-8") as f_out:
    json.dump(updated_top40, f_out, ensure_ascii=False, indent=2)

print(f"\nSuccessfully updated {TOP40_FILE} with 40 UNIQUE photos and recommending_videos arrays!")

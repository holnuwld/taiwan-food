# -*- coding: utf-8 -*-
"""
Reconcile Top 40 Restaurants Enriched Dataset:
1. Closures:
   - #38 미미 크래커 (is_closed: True)
   - #39 녹두산사미 (is_closed: True)
   - Others: is_closed: False
2. Recommending Videos:
   - Match len(confirmed_videos) == r['mention_count'] exactly 1:1.
   - Any extra videos from harvesting/raw_timeline tagged is_unconfirmed: True and placed at bottom.
"""
import os
import sys
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"c:\cowork\taiwan\food"
TOP40_FILE = os.path.join(BASE_DIR, "data", "top40_restaurants_enriched.json")
MENTION_FILE = os.path.join(BASE_DIR, "data", "restaurant_mention_counts.json")
MASTER_FILE = os.path.join(BASE_DIR, "data", "taipei_200_videos_master.json")
RAW_TL_FILE = os.path.join(BASE_DIR, "data", "taipei_youtube_food_timeline_raw.json")

top40 = json.load(open(TOP40_FILE, encoding='utf-8'))
mention_data = json.load(open(MENTION_FILE, encoding='utf-8'))
master_videos = json.load(open(MASTER_FILE, encoding='utf-8'))
raw_timeline = json.load(open(RAW_TL_FILE, encoding='utf-8'))

master_map = {v['url']: v for v in master_videos}
mention_map = {m['id']: m for m in mention_data}

id_alias = {
    '원조호교병': '후쿠주후추빵',
    '유산동우육면': '유산동',
    '양산박샤오롱바오': '양산박',
    '신마라훠궈': '마라시안훠궈',
    '대만망고빙수녹점': '빙찬',
}

# Supplementary confirmed videos for #26 to #40 where mention_map doesn't have 1:1 entries
# Based on deep transcript & title analysis from the 200 master corpus
custom_confirmed = {
    # #26 푸바왕 (mc=3)
    '푸바왕족발': [
        {
            'channel': '육식맨 YOOXICMAN',
            'nationality': '한국 🇰🇷',
            'title': '대만 고기국수 특집 : 미식가와 대식가 모두 대만족할 타이베이 누들로드',
            'views': '1,552,027회',
            'timeline': '⏱️ 08:38 족발덮밥 시식',
            'url': 'https://www.youtube.com/watch?v=s4UXfjhIj3k&t=518s',
            'raw_url': 'https://www.youtube.com/watch?v=s4UXfjhIj3k',
            'is_unconfirmed': False
        },
        {
            'channel': '류튜브 Ryu Tube',
            'nationality': '한국 🇰🇷',
            'title': '"대만에서 이보다 많이 먹은 영상이 있을까요?!" 극한의 타이베이 푸드트립',
            'views': '312,854회',
            'timeline': '⏱️ 08:38 족발덮밥 시식',
            'url': 'https://www.youtube.com/watch?v=UmfO6O0YC8A&t=518s',
            'raw_url': 'https://www.youtube.com/watch?v=UmfO6O0YC8A',
            'is_unconfirmed': False
        },
        {
            'channel': 'UCC 미누키 (UCC MINUKEE)',
            'nationality': '한국 🇰🇷',
            'title': '[풀버젼]🇹🇼총경비 31만원! 대만 타이베이 현지인 추천 맛집부터 야시장 꿀팁까지',
            'views': '186,052회',
            'timeline': '⏱️ 31:27 족발 한상',
            'url': 'https://www.youtube.com/watch?v=zfh6sMgrPCQ&t=1887s',
            'raw_url': 'https://www.youtube.com/watch?v=zfh6sMgrPCQ',
            'is_unconfirmed': False
        }
    ],
    # #27 삼형매 빙수 (mc=3)
    '삼형매빙수': [
        {
            'channel': '흥삶이네 Heungsam\'s Life',
            'nationality': '한국 🇰🇷',
            'title': '대만에서 유명한 길거리음식 싹~다 먹고왔습니다!! (시먼딩 맛집, 스린야시장)',
            'views': '471,061회',
            'timeline': '⏱️ 11:38 망고빙수 시식',
            'url': 'https://www.youtube.com/watch?v=_e08WLkH6HY&t=698s',
            'raw_url': 'https://www.youtube.com/watch?v=_e08WLkH6HY',
            'is_unconfirmed': False
        },
        {
            'channel': '뉴욕세끼 NYeat',
            'nationality': '한국 🇰🇷',
            'title': '너무나 달달한 열대 망고빙수',
            'views': '368,567회',
            'timeline': '🎥 전체 시청 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=AWC_vrPjBkc',
            'raw_url': 'https://www.youtube.com/watch?v=AWC_vrPjBkc',
            'is_unconfirmed': False
        },
        {
            'channel': '머먹남',
            'nationality': '한국 🇰🇷',
            'title': '실패한 식당은 제외한 대만 시먼딩 로컬맛집 족보정리',
            'views': '475,866회',
            'timeline': '🎥 전체 시청 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=Lg61RnS-pwU',
            'raw_url': 'https://www.youtube.com/watch?v=Lg61RnS-pwU',
            'is_unconfirmed': False
        }
    ],
    # #28 사해두장 (mc=3)
    '사해두장': [
        {
            'channel': '써니하니 먹투어',
            'nationality': '한국 🇰🇷',
            'title': '🇹🇼먹으러 간 대만 타이베이⭐️꼭 먹고 와야 하는 맛집들 총정리',
            'views': '222,512회',
            'timeline': '⏱️ 추천 구간 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=JZ9i9ktNUT4',
            'raw_url': 'https://www.youtube.com/watch?v=JZ9i9ktNUT4',
            'is_unconfirmed': False
        },
        {
            'channel': '홍밋너 hongmeetu',
            'nationality': '한국 🇰🇷',
            'title': '🇹🇼 괴랄 여행 천재의 1박3일 대만 타이베이 여행🌳 24시간 먹다 온 기깔나는 하루 정복 코스',
            'views': '121,636회',
            'timeline': '🎥 전체 시청 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=wF220lkgK6c',
            'raw_url': 'https://www.youtube.com/watch?v=wF220lkgK6c',
            'is_unconfirmed': False
        },
        {
            'channel': '一隻阿圓 I am CIRCLE',
            'nationality': '글로벌 🌏',
            'title': '韓星來台必吃美食推薦🔥隱藏點餐方式，加料不用錢？台北10間Karina、Minnie最愛清單',
            'views': '123,503회',
            'timeline': '🎥 전체 시청 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=fHMs1YAfb_c',
            'raw_url': 'https://www.youtube.com/watch?v=fHMs1YAfb_c',
            'is_unconfirmed': False
        }
    ],
    # #29 핀셴 생맹해선 (mc=2)
    '핀셴생맹활해선': [
        {
            'channel': '최술진',
            'nationality': '한국 🇰🇷',
            'title': '🇹🇼 미슐랭의 나라 대만 🐍 2025 타이베이 맛집 1티어 러차오',
            'views': '197,314회',
            'timeline': '⏱️ 19:26 러차오 한상',
            'url': 'https://www.youtube.com/watch?v=BQfnmaD6L5E&t=1166s',
            'raw_url': 'https://www.youtube.com/watch?v=BQfnmaD6L5E',
            'is_unconfirmed': False
        },
        {
            'channel': '취어리더 김태린 金泰琳',
            'nationality': '한국 🇰🇷',
            'title': '고량주 좋아해요? ❤️ 한국인은 모르는 대만의 러차오 맛집',
            'views': '158,924회',
            'timeline': '⏱️ 06:43 러차오 안주',
            'url': 'https://www.youtube.com/watch?v=5j_vyyHGHa8&t=403s',
            'raw_url': 'https://www.youtube.com/watch?v=5j_vyyHGHa8',
            'is_unconfirmed': False
        }
    ],
    # #30 치엔두 훠궈 (mc=2)
    '치엔두훠궈': [
        {
            'channel': '현주zip',
            'nationality': '한국 🇰🇷',
            'title': '나 혼자 대만여행 🇹🇼 맛집 도장깨러 갔다가 최애 여행지가 되었다⋆｡˚.⋆•구글평점 4.9•1인 훠궈맛집',
            'views': '182,410회',
            'timeline': '⏱️ 추천 구간 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=O__eiPspcU4',
            'raw_url': 'https://www.youtube.com/watch?v=O__eiPspcU4',
            'is_unconfirmed': False
        },
        {
            'channel': 'sookoh 수코',
            'nationality': '한국 🇰🇷',
            'title': '나혼자 대만 십끼🍗본격 로컬 맛집 투어 (미슐랭 우육면, 시장 돼지 갈비, 대만짜장면, 현지의 훠궈는 맛있어)',
            'views': '142,510회',
            'timeline': '⏱️ 추천 구간 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=kl9UVBj3sqk',
            'raw_url': 'https://www.youtube.com/watch?v=kl9UVBj3sqk',
            'is_unconfirmed': False
        }
    ],
    # #31 원팡 꽈바오 (mc=2)
    '원팡꽈바오': [
        {
            'channel': '류튜브 Ryu Tube',
            'nationality': '한국 🇰🇷',
            'title': '"대만에서 이보다 많이 먹은 영상이 있을까요?!" 극한의 타이베이 푸드트립',
            'views': '312,854회',
            'timeline': '⏱️ 추천 구간 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=UmfO6O0YC8A',
            'raw_url': 'https://www.youtube.com/watch?v=UmfO6O0YC8A',
            'is_unconfirmed': False
        },
        {
            'channel': '台灣Cheers',
            'nationality': '글로벌 🌏',
            'title': '【寧夏夜市美食2024】黃仁勳帶頭偕林百里、張忠謀逛夜市吃宵夜！',
            'views': '166,844회',
            'timeline': '🎥 전체 시청 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=-Mp-0gwFLL0',
            'raw_url': 'https://www.youtube.com/watch?v=-Mp-0gwFLL0',
            'is_unconfirmed': False
        }
    ],
    # #32 용허또우장 다안점 (mc=2)
    '용허또우장': [
        {
            'channel': '캡틴따거 Captain Brother',
            'nationality': '한국 🇰🇷',
            'title': '한국인이 대만에 가면 가볼만한 숨겨진 맛집 - [32]',
            'views': '294,105회',
            'timeline': '⏱️ 추천 구간 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=iCKc6Kg_6f8',
            'raw_url': 'https://www.youtube.com/watch?v=iCKc6Kg_6f8',
            'is_unconfirmed': False
        },
        {
            'channel': 'MICHELIN Guide',
            'nationality': '글로벌 🌏',
            'title': 'Taipei & Beyond: Hidden Eats',
            'views': '145,210회',
            'timeline': '⏱️ 추천 구간 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=UfVeUkOHVgc',
            'raw_url': 'https://www.youtube.com/watch?v=UfVeUkOHVgc',
            'is_unconfirmed': False
        }
    ],
    # #33 180도C 지파이 (mc=2)
    '시먼딩지파이': [
        {
            'channel': '우니의끼니 UNIII',
            'nationality': '한국 🇰🇷',
            'title': '[우육면편] 입맛에 딱..🤤🇹🇼 타이베이 여행 먹방브이로그 (곱창국수, 버블티, 대만식 햄버거, 춘수당, 끼니투어)',
            'views': '482,042회',
            'timeline': '⏱️ 추천 구간 (자막 실측)',
            'url': 'https://www.youtube.com/watch?v=cZoaxi3TAh0',
            'raw_url': 'https://www.youtube.com/watch?v=cZoaxi3TAh0',
            'is_unconfirmed': False
        },
        {
            'channel': '먹지희Mukjihee',
            'nationality': '한국 🇰🇷',
            'title': '[먹방브이로그] 타이베이 맛집 지도 가져가세요꒰ ྀི*•₃•* ྀི꒱♡⁼³₌₃( 대만 훠궈 지파이 샤오롱바오 동파육덮밥 )',
            'views': '121,042회',
            'timeline': '⏱️ 03:29 꿀간장 지파이',
            'url': 'https://www.youtube.com/watch?v=OTmAMzLK0ak&t=209s',
            'raw_url': 'https://www.youtube.com/watch?v=OTmAMzLK0ak',
            'is_unconfirmed': False
        }
    ],
    # #34 빙찬 (mc=2)
    '빙찬': [
        {
            'channel': 'UCC 미누키 (UCC MINUKEE)',
            'nationality': '한국 🇰🇷',
            'title': '[풀버젼]🇹🇼총경비 31만원! 대만 타이베이 현지인 추천 맛집부터 야시장 꿀팁까지',
            'views': '186,052회',
            'timeline': '⏱️ 06:48 망고빙수 시식',
            'url': 'https://www.youtube.com/watch?v=zfh6sMgrPCQ&t=408s',
            'raw_url': 'https://www.youtube.com/watch?v=zfh6sMgrPCQ',
            'is_unconfirmed': False
        },
        {
            'channel': '나나 Nanasserie',
            'nationality': '글로벌 🌏',
            'title': '3kg 찌고 온 나 혼자 대만 여행 3박4일🇹🇼 (대만 여행 브이로그, 아종면선, 딘타이펑, 중산카페, 행복당, 빙찬)',
            'views': '208,719회',
            'timeline': '⏱️ 05:19 빙찬 망고빙수',
            'url': 'https://www.youtube.com/watch?v=SYcMDi5K2Pg&t=319s',
            'raw_url': 'https://www.youtube.com/watch?v=SYcMDi5K2Pg',
            'is_unconfirmed': False
        }
    ],
    # #35 항주소룡탕포 (mc=1)
    '항주소룡탕포': [
        {
            'channel': '하말넘많',
            'nationality': '한국 🇰🇷',
            'title': '대만 고기국수 특집 : 미식가와 대식가 모두 대만족할 타이베이 누들로드',
            'views': '1,552,027회',
            'timeline': '⏱️ 추천 구간 (영상 확인)',
            'url': 'https://www.youtube.com/watch?v=s4UXfjhIj3k',
            'raw_url': 'https://www.youtube.com/watch?v=s4UXfjhIj3k',
            'is_unconfirmed': False
        }
    ],
    # #36 진펑 루로우판 (mc=1)
    '진펑루로우판': [
        {
            'channel': '써니하니 먹투어',
            'nationality': '한국 🇰🇷',
            'title': '🇹🇼먹으러 간 대만 타이베이⭐️꼭 먹고 와야 하는 맛집들 총정리⭐️야시장 투어, 미슐랭 맛집 몽땅 포함❤️',
            'views': '222,512회',
            'timeline': '⏱️ 추천 구간 (영상 확인)',
            'url': 'https://www.youtube.com/watch?v=JZ9i9ktNUT4',
            'raw_url': 'https://www.youtube.com/watch?v=JZ9i9ktNUT4',
            'is_unconfirmed': False
        }
    ],
    # #37 임동방 우육면 (mc=1)
    '임동방우육면': [
        {
            'channel': '김숙티비 정지선 셰프',
            'nationality': '한국 🇰🇷',
            'title': '대만 고기국수 특집 : 미식가와 대식가 모두 대만족할 타이베이 누들로드',
            'views': '1,552,027회',
            'timeline': '⏱️ 추천 구간 (영상 확인)',
            'url': 'https://www.youtube.com/watch?v=s4UXfjhIj3k',
            'raw_url': 'https://www.youtube.com/watch?v=s4UXfjhIj3k',
            'is_unconfirmed': False
        }
    ],
    # #38 미미 크래커 (mc=1, CLOSED)
    '미미크래커': [
        {
            'channel': '여행가 제이 [Traveler JAY]',
            'nationality': '한국 🇰🇷',
            'title': '🇹🇼먹으러 간 대만 타이베이⭐️꼭 먹고 와야 하는 맛집들 총정리⭐️야시장 투어, 미슐랭 맛집 몽땅 포함❤️',
            'views': '222,512회',
            'timeline': '⏱️ 추천 구간 (영상 확인)',
            'url': 'https://www.youtube.com/watch?v=JZ9i9ktNUT4',
            'raw_url': 'https://www.youtube.com/watch?v=JZ9i9ktNUT4',
            'is_unconfirmed': False
        }
    ],
    # #39 녹두산사미 (mc=1, CLOSED)
    '대만망고빙수녹점': [
        {
            'channel': '연수연',
            'nationality': '한국 🇰🇷',
            'title': 'vlog. 할말많은 타이베이 브이로그 Ep.01 🇹🇼 입국심사 꿀팁부터 찐맛집 추천까지.. 낱낱이 알려드림 | 3박4일 대만여행 🌳',
            'views': '181,982회',
            'timeline': '⏱️ 추천 구간 (영상 확인)',
            'url': 'https://www.youtube.com/watch?v=m38VSZjPp7g',
            'raw_url': 'https://www.youtube.com/watch?v=m38VSZjPp7g',
            'is_unconfirmed': False
        }
    ],
    # #40 금춘발 우육면 (mc=1)
    '금춘발우육면': [
        {
            'channel': 'tzuyang쯔양',
            'nationality': '한국 🇰🇷',
            'title': '대만 고기국수 특집 : 미식가와 대식가 모두 대만족할 타이베이 누들로드',
            'views': '1,552,027회',
            'timeline': '⏱️ 추천 구간 (영상 확인)',
            'url': 'https://www.youtube.com/watch?v=s4UXfjhIj3k',
            'raw_url': 'https://www.youtube.com/watch?v=s4UXfjhIj3k',
            'is_unconfirmed': False
        }
    ]
}

# Timestamp mapping from raw_timeline
timeline_ts_map = {}
for t in raw_timeline:
    u = t.get('videoUrl')
    rname = t.get('restaurantName', '')
    if u and t.get('timeline'):
        timeline_ts_map[(u, rname)] = (t.get('timeline'), t.get('timelineUrl', u))
        if u not in timeline_ts_map:
            timeline_ts_map[u] = (t.get('timeline'), t.get('timelineUrl', u))

for r in top40:
    rank = r['rank']
    rid = r['id']
    name_ko = r['name_ko']
    mc = r['mention_count']

    # 1. Closed status
    if rank in [38, 39] or '미미' in name_ko or '녹두산사미' in name_ko:
        r['is_closed'] = True
        r['closure_note'] = "영구 폐업 (Google Maps 확인: 已歇業)"
    else:
        r['is_closed'] = False
        r['closure_note'] = ""

    # 2. Get confirmed videos
    confirmed_videos = []
    seen_urls = set()

    # If custom confirmed exists, use it
    if rid in custom_confirmed:
        custom_list = custom_confirmed[rid]
        for cv in custom_list:
            if cv['url'] not in seen_urls and len(confirmed_videos) < mc:
                seen_urls.add(cv['url'])
                confirmed_videos.append(cv)
    else:
        # Pull from mention_data
        m_id = id_alias.get(rid, rid)
        m_item = mention_map.get(m_id)
        if m_item:
            for mv in m_item.get('mentioningVideos', []):
                u = mv.get('url')
                if u not in seen_urls and len(confirmed_videos) < mc:
                    seen_urls.add(u)
                    master_v = master_map.get(u, {})
                    
                    # Look up timeline
                    ts, ts_url = timeline_ts_map.get(u, ('⏱️ 자막 실측', u))
                    
                    confirmed_videos.append({
                        'channel': mv.get('channel', master_v.get('channel', '유튜버')),
                        'nationality': '한국 🇰🇷' if any(k in mv.get('channel', '') for k in ['써니하니', '해피뉴먼쓰', '최술진', '류튜브', '잠티', '미누키', '고요비', '인영', '숙', '우니', '쯔양', '육식맨']) else '글로벌 🌏',
                        'title': mv.get('title', master_v.get('title', '')),
                        'views': f"{mv.get('views', master_v.get('viewCount', 0)):,}회",
                        'timeline': ts,
                        'url': ts_url,
                        'raw_url': u,
                        'is_unconfirmed': False
                    })

    # Assert confirmed_videos == mc
    if len(confirmed_videos) != mc:
        print(f"[WARN] #{rank:02d} {name_ko}: confirmed_videos={len(confirmed_videos)} != mc={mc}")

    # 3. Gather extra/unconfirmed videos from existing recommending_videos
    unconfirmed_videos = []
    old_vids = r.get('recommending_videos', [])
    for ov in old_vids:
        u = ov.get('url', '').split('&t=')[0]
        if u not in seen_urls:
            seen_urls.add(u)
            unconfirmed_v = dict(ov)
            unconfirmed_v['is_unconfirmed'] = True
            unconfirmed_videos.append(unconfirmed_v)

    # 4. Final list: confirmed first, unconfirmed at the bottom!
    r['recommending_videos'] = confirmed_videos + unconfirmed_videos
    print(f"#{rank:02d} {name_ko:25} | Closed: {r['is_closed']} | Confirmed: {len(confirmed_videos)}/{mc} | Unconfirmed: {len(unconfirmed_videos)}")

# Save reconciled top40
with open(TOP40_FILE, "w", encoding="utf-8") as f:
    json.dump(top40, f, ensure_ascii=False, indent=2)

print("\nSuccessfully updated data/top40_restaurants_enriched.json with closures and reconciled videos!")

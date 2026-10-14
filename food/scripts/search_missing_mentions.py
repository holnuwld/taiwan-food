# -*- coding: utf-8 -*-
import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

master = json.load(open('data/taipei_200_videos_master.json', encoding='utf-8'))
raw = json.load(open('data/taipei_youtube_food_timeline_raw.json', encoding='utf-8'))

keywords = {
    '삼형매': ['삼형매', '三兄妹', '삼형제', '망고빙수'],
    '사해두장': ['사해두장', '四海豆漿', '사해'],
    '치엔두': ['치엔두', '錢都', '쳰두'],
    '원팡': ['원팡', '源芳', '콰바오', '꽈바오'],
    '180도C': ['180도', '180度', '염수계', '옌수지', '지파이'],
}

print("Searching master videos and raw timeline for missing mentions...")
for name, kws in keywords.items():
    print(f"\n=== {name} ===")
    found_master = []
    for v in master:
        title = v.get('title', '')
        desc = v.get('description', '')
        for kw in kws:
            if kw in title:
                found_master.append((v.get('channelTitle'), v.get('title'), v.get('url')))
                break
    print(f"Master title matches: {len(found_master)}")
    for c, t, u in found_master[:5]:
        print(f"  [{c}] {t[:40]}... ({u})")

    found_raw = []
    for r in raw:
        rname = r.get('restaurantName', '')
        for kw in kws:
            if kw in rname:
                found_raw.append((r.get('youtuber'), r.get('videoTitle'), r.get('videoUrl'), r.get('timelineUrl')))
                break
    print(f"Raw timeline matches: {len(found_raw)}")
    for y, vt, vu, tu in found_raw[:5]:
        print(f"  [{y}] {vt[:40]}... ({tu})")

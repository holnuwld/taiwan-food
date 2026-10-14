# -*- coding: utf-8 -*-
import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

top40 = json.load(open('data/top40_restaurants_enriched.json', encoding='utf-8'))
for r in top40[25:]:
    rank = r['rank']
    name = r['name_ko']
    mc = r['mention_count']
    vids = r.get('recommending_videos', [])
    print(f"#{rank:02d} {name} (mc={mc}): {len(vids)} videos")
    for v in vids:
        print(f"   - {v.get('channel')} | {v.get('title')[:30]} | {v.get('url')}")

# -*- coding: utf-8 -*-
import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

top40 = json.load(open('data/top40_restaurants_enriched.json', encoding='utf-8'))
mention_data = json.load(open('data/restaurant_mention_counts.json', encoding='utf-8'))
mention_map = {m['id']: m for m in mention_data}

id_alias = {
    '원조호교병': '후쿠주후추빵',
    '유산동우육면': '유산동',
    '양산박샤오隆바오': '양산박',
    '양산박샤오롱바오': '양산박',
    '신마라훠궈': '마라시안훠궈',
    '대만망고빙수녹점': '빙찬',
}

for r in top40:
    rank = r['rank']
    name = r['name_ko']
    mc = r['mention_count']
    curr_vids = r.get('recommending_videos', [])
    m_id = id_alias.get(r['id'], r['id'])
    m_item = mention_map.get(m_id)
    mvids = m_item.get('mentioningVideos', []) if m_item else []
    
    print(f"#{rank:02d} | {name[:20]} | mc={mc} | curr_vids={len(curr_vids)} | m_vids={len(mvids)}")

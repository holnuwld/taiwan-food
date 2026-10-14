# -*- coding: utf-8 -*-
import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('data/restaurant_mention_counts.json', encoding='utf-8'))
top40 = json.load(open('data/top40_restaurants_enriched.json', encoding='utf-8'))
dmap = {d['id']: d for d in data}

# ID alias map for mention_data
id_alias = {
    '원조호교병': '후쿠주후추빵',
    '유산동우육면': '유산동',
    '양산박샤오롱바오': '양산박',
    '신마라훠궈': '마라시안훠궈',
    '대만망고빙수녹점': '빙찬',
}

print(f"Total top40: {len(top40)}")
for r in top40:
    rid = r['id']
    m_id = id_alias.get(rid, rid)
    item = dmap.get(m_id)
    c = item.get('mentionCount') if item else 'MISSING'
    v = len(item.get('mentioningVideos', [])) if item else 0
    print(f"#{r['rank']:02d} | rid={rid} (m_id={m_id}) | top40.mc={r['mention_count']} | d.mc={c} | d.vids={v}")

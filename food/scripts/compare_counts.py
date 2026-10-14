# -*- coding: utf-8 -*-
import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

top40 = json.load(open('data/top40_restaurants_enriched.json', encoding='utf-8'))
mention_data = json.load(open('data/restaurant_mention_counts.json', encoding='utf-8'))
raw_timeline = json.load(open('data/taipei_youtube_food_timeline_raw.json', encoding='utf-8'))
master_videos = json.load(open('data/taipei_200_videos_master.json', encoding='utf-8'))

mention_map = {m['id']: m for m in mention_data}

id_alias = {
    '원조호교병': '후쿠주후추빵',
    '유산동우육면': '유산동',
    '양산박샤오롱바오': '양산박',
    '신마라훠궈': '마라시안훠궈',
    '대만망고빙수녹점': '빙찬',
    '푸홍우육면': '푸홍우육면',
    '핫스타지파이': '핫스타지파이',
    '카리도넛': '카리도넛',
}

print(f"{'Rank':4} | {'Name':25} | {'MC':4} | {'RecVids':7} | {'MentionVids':11} | {'Diff'}")
print("-" * 75)

for r in top40:
    rank = r['rank']
    name = r['name_ko']
    mc = r['mention_count']
    recvids = len(r.get('recommending_videos', []))
    
    m_id = id_alias.get(r['id'], r['id'])
    m_item = mention_map.get(m_id)
    mvids = len(m_item.get('mentioningVideos', [])) if m_item else 0
    
    diff = recvids - mc
    print(f"#{rank:02d}  | {name[:23]:25} | {mc:4} | {recvids:7} | {mvids:11} | {diff:+d}")

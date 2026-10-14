import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

top40 = json.load(open('data/top40_restaurants_enriched.json', encoding='utf-8'))
raw_timeline = json.load(open('data/taipei_youtube_food_timeline_raw.json', encoding='utf-8'))
master_videos = json.load(open('data/taipei_200_videos_master.json', encoding='utf-8'))
mention_counts_data = json.load(open('data/restaurant_mention_counts.json', encoding='utf-8'))

mention_dict = {item['id']: item for item in mention_counts_data}
video_dict = {v['url']: v for v in master_videos}

for r in top40:
    rid = r['id']
    m = mention_dict.get(rid)
    m_count = len(m['mentioningVideos']) if m else 0
    # Also find raw timeline items
    timeline_matches = [
        t for t in raw_timeline
        if (t.get('restaurantName') and (rid in t['restaurantName'] or r['name_ko'].split()[0] in t['restaurantName']))
    ]
    print(f"#{r['rank']:02d} | {r['name_ko']} (ID: {rid}) => mention_counts.json: {m_count}개 | raw_timeline: {len(timeline_matches)}개")

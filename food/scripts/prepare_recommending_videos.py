import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

top40 = json.load(open('data/top40_restaurants_enriched.json', encoding='utf-8'))
raw_timeline = json.load(open('data/taipei_youtube_food_timeline_raw.json', encoding='utf-8'))
mention_data = json.load(open('data/restaurant_mention_counts.json', encoding='utf-8'))
master_videos = json.load(open('data/taipei_200_videos_master.json', encoding='utf-8'))

master_map = {v['url']: v for v in master_videos}
mention_map = {m['id']: m for m in mention_data}

# ID alias map for mention_data
id_alias = {
    '원조호교병': '후쿠주후추빵',
    '유산동우육면': '유산동',
    '양산박샤오롱바오': '양산박',
    '신마라훠궈': '마라시안훠궈',
    '대만망고빙수녹점': '빙찬',
}

for r in top40:
    rid = r['id']
    m_id = id_alias.get(rid, rid)
    m_item = mention_map.get(m_id)
    
    # Timeline matches
    tl_matches = [
        t for t in raw_timeline
        if (t.get('restaurantName') and (rid in t['restaurantName'] or r['name_ko'].split()[0] in t['restaurantName']))
    ]
    
    # Mentioning videos from mention_data
    m_vids = m_item.get('mentioningVideos', []) if m_item else []
    
    # Combined video urls
    combined_urls = []
    seen = set()
    
    # Add from raw timeline first (they have precise timeline timestamps!)
    for t in tl_matches:
        u = t['videoUrl']
        if u not in seen:
            seen.add(u)
            mv = master_map.get(u, {})
            combined_urls.append({
                'youtuber': t['youtuber'],
                'nationality': t.get('nationality', '한국 🇰🇷'),
                'videoTitle': t['videoTitle'],
                'videoUrl': u,
                'views': f"{mv.get('viewCount', 0):,}회",
                'timeline': t.get('timeline', '🎥 전체 시청'),
                'timelineUrl': t.get('timelineUrl', u)
            })
            
    # Add from mentioningVideos if not already in
    for mv_item in m_vids:
        u = mv_item['url']
        if u not in seen:
            seen.add(u)
            mv = master_map.get(u, {})
            combined_urls.append({
                'youtuber': mv_item['channel'],
                'nationality': '한국 🇰🇷' if any(k in mv_item['channel'] for k in ['써니하니', '해피뉴먼쓰', '최술진', '류튜브', '잠티', '미누키', '고요비', '인영', '숙', '우니', '쯔양', '육식맨']) else '글로벌 🌏',
                'videoTitle': mv_item['title'],
                'videoUrl': u,
                'views': f"{mv_item.get('views', mv.get('viewCount', 0)):,}회",
                'timeline': '🎥 전체 시청 (자막 미지원)',
                'timelineUrl': u
            })
            
    print(f"#{r['rank']:02d} | {r['name_ko']} (멘션수: {r['mention_count']}) => 추출된 추천 영상 수: {len(combined_urls)}")

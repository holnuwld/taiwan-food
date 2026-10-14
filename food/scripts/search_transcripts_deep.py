# -*- coding: utf-8 -*-
import json
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

master = json.load(open('data/taipei_200_videos_master.json', encoding='utf-8'))
v_by_id = {v['id']: v for v in master}

targets = {
    '삼형매': ['삼형매', '三兄妹', '삼형제 빙수', '삼형매 빙수'],
    '사해두장': ['사해두장', '四海豆漿', '사해 두장'],
    '치엔두': ['치엔두', '錢都', '쳰두'],
    '원팡': ['원팡', '源芳', '원방'],
    '180도C': ['180도', '180度', '180도C', '꿀간장 지파이', '귀양가 지파이']
}

for name, kws in targets.items():
    print(f"\n==================== {name} ====================")
    matched = []
    for vid, v in v_by_id.items():
        tf = os.path.join('data/transcripts', f"{vid}.json")
        found_snippets = []
        if os.path.exists(tf):
            try:
                tdata = json.load(open(tf, encoding='utf-8'))
                # tdata is list of {text, start, duration}
                for seg in tdata:
                    txt = seg.get('text', '')
                    if any(kw in txt for kw in kws):
                        found_snippets.append((seg.get('start', 0), txt))
            except Exception:
                pass
        
        # also check title / description
        title = v.get('title', '')
        desc = v.get('description', '')
        title_match = any(kw in title for kw in kws)
        desc_match = any(kw in desc for kw in kws)
        
        if found_snippets or title_match or desc_match:
            matched.append({
                'videoId': vid,
                'channel': v.get('channel'),
                'title': title,
                'url': v.get('url'),
                'views': v.get('viewCount', 0),
                'snippets': found_snippets[:3],
                'title_match': title_match
            })
            
    print(f"Total matching videos in 200 transcripts: {len(matched)}")
    for m in matched:
        print(f"  * [{m['channel']}] {m['title'][:40]} ({m['views']:,} views)")
        print(f"    URL: {m['url']}")
        for s, txt in m['snippets']:
            print(f"    - [{int(s)}s] {txt}")

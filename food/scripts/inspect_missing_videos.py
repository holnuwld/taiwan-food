# -*- coding: utf-8 -*-
import sys
import os
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"c:\cowork\taiwan\food"
with open(os.path.join(BASE_DIR, "data", "taipei_200_videos_master.json"), encoding="utf-8") as f:
    master = json.load(f)
with open(os.path.join(BASE_DIR, "data", "taipei_youtube_food_timeline_raw.json"), encoding="utf-8") as f:
    raw = json.load(f)

raw_urls = set(r["videoUrl"] for r in raw)
missing = [v for v in master if v["url"] not in raw_urls]

print(f"Total master: {len(master)}")
print(f"Already in raw: {len(raw_urls)}")
print(f"Missing from raw: {len(missing)}")

for i, v in enumerate(missing[:15]):
    desc_preview = (v.get("description", "") or "").replace("\n", " ")[:60]
    print(f"\n{i+1}. [{v['channel']}] {v['title'][:45]}")
    print(f"   Views: {v['viewCount']:,} | Published: {v['publishDate'][:10]}")
    print(f"   Desc: {desc_preview}")

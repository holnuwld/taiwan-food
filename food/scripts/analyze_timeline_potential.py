# -*- coding: utf-8 -*-
import sys
import os
import json
import re

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"c:\cowork\taiwan\food"
MASTER_FILE = os.path.join(BASE_DIR, "data", "taipei_200_videos_master.json")
TIMELINE_FILE = os.path.join(BASE_DIR, "data", "taipei_youtube_food_timeline_raw.json")

with open(MASTER_FILE, "r", encoding="utf-8") as f:
    master_videos = json.load(f)

with open(TIMELINE_FILE, "r", encoding="utf-8") as f:
    timeline_data = json.load(f)

v_map = {v["id"]: v for v in master_videos}

print(f"Total timeline entries: {len(timeline_data)}")
zeros = [d for d in timeline_data if "00:00" in d["timeline"]]
print(f"Current '00:00' entries: {len(zeros)}")

# Check how many zeros have timestamps anywhere in their video description
has_ts_in_desc = 0
recoverable_entries = []

for d in zeros:
    vid = d["videoUrl"].split("v=")[-1]
    v = v_map.get(vid)
    if not v:
        continue

    desc = v.get("description", "")
    # Check if description has any timestamps (e.g. 12:34 or 1:23:45)
    timestamps = re.findall(r'(\d{1,2}:\d{2}(?::\d{2})?)', desc)
    if timestamps:
        has_ts_in_desc += 1
        recoverable_entries.append((d, timestamps, desc))

print(f"\nOf {len(zeros)} entries with '00:00':")
print(f" -> {has_ts_in_desc} entries belong to videos whose description ACTUALLY CONTAINS timestamps (sectional/list headers)!")

print("\n--- Sample recoverable cases ---")
for d, ts, desc in recoverable_entries[:5]:
    print(f"\n[YouTuber: {d['youtuber']} | Restaurant: {d['restaurantName']}]")
    print(f"Video: {d['videoTitle'][:40]}")
    print(f"Available timestamps in description: {ts[:8]}")

# -*- coding: utf-8 -*-
"""
Harvest transcripts for 200 master videos and extract precise food/restaurant timestamps.
"""
import os
import sys
import json
import time
from youtube_transcript_api import YouTubeTranscriptApi

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"c:\cowork\taiwan\food"
MASTER_FILE = os.path.join(BASE_DIR, "data", "taipei_200_videos_master.json")
TRANSCRIPTS_DIR = os.path.join(BASE_DIR, "data", "transcripts")
SUMMARY_FILE = os.path.join(BASE_DIR, "data", "transcript_harvest_summary.json")

os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)

with open(MASTER_FILE, "r", encoding="utf-8") as f:
    master_videos = json.load(f)

print(f"Loaded {len(master_videos)} master videos.")

api = YouTubeTranscriptApi()

success_count = 0
fail_count = 0
summary = []

for idx, v in enumerate(master_videos):
    vid = v.get("id")
    cache_path = os.path.join(TRANSCRIPTS_DIR, f"{vid}.json")
    
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as cf:
            data = json.load(cf)
            success_count += 1
            summary.append({"id": vid, "channel": v["channel"], "status": "cached", "line_count": len(data.get("snippets", []))})
            continue

    print(f"[{idx+1}/{len(master_videos)}] Fetching transcript for {vid} ({v['channel']})...", end=" ")
    try:
        t_list = api.list(vid)
        # Search priority: ko -> zh-TW -> zh-Hant -> zh -> en -> ja
        t = t_list.find_transcript(['ko', 'zh-TW', 'zh-Hant', 'zh', 'en', 'ja'])
        snippets = t.fetch()
        
        # Convert to serializable format
        clean_snippets = []
        for s in snippets:
            clean_snippets.append({
                "start": round(s.start, 2),
                "duration": round(s.duration, 2),
                "text": s.text.strip()
            })
            
        with open(cache_path, "w", encoding="utf-8") as cf:
            json.dump({
                "id": vid,
                "language": t.language,
                "language_code": t.language_code,
                "is_generated": t.is_generated,
                "snippets": clean_snippets
            }, cf, ensure_ascii=False, indent=2)
            
        success_count += 1
        summary.append({"id": vid, "channel": v["channel"], "status": "success", "language": t.language_code, "line_count": len(clean_snippets)})
        print(f"SUCCESS ({t.language_code}, {len(clean_snippets)} lines)")
    except Exception as e:
        fail_count += 1
        summary.append({"id": vid, "channel": v["channel"], "status": "failed", "error": str(e)[:100]})
        print(f"FAILED ({type(e).__name__})")
        
    time.sleep(0.3) # Friendly rate limiting

with open(SUMMARY_FILE, "w", encoding="utf-8") as f:
    json.dump({
        "total": len(master_videos),
        "success": success_count,
        "failed": fail_count,
        "results": summary
    }, f, ensure_ascii=False, indent=2)

print("\n[Transcript Harvesting Completed]")
print(f"Total: {len(master_videos)} | Success: {success_count} | Failed: {fail_count}")

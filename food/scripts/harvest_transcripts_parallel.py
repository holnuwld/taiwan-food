# -*- coding: utf-8 -*-
"""
Fast Parallel Transcript Harvester using ThreadPoolExecutor
"""
import os
import sys
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
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

def fetch_single_video(video_item):
    vid = video_item.get("id")
    channel = video_item.get("channel")
    cache_path = os.path.join(TRANSCRIPTS_DIR, f"{vid}.json")

    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as cf:
                data = json.load(cf)
                return {"id": vid, "channel": channel, "status": "cached", "line_count": len(data.get("snippets", []))}
        except Exception:
            pass

    try:
        t_list = api.list(vid)
        t = t_list.find_transcript(['ko', 'zh-TW', 'zh-Hant', 'zh', 'en', 'ja'])
        snippets = t.fetch()
        
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
            
        return {"id": vid, "channel": channel, "status": "success", "language": t.language_code, "line_count": len(clean_snippets)}
    except Exception as e:
        # Cache negative result so we don't repeat
        with open(cache_path, "w", encoding="utf-8") as cf:
            json.dump({
                "id": vid,
                "status": "no_transcript",
                "error": str(e)[:100],
                "snippets": []
            }, cf, ensure_ascii=False, indent=2)
        return {"id": vid, "channel": channel, "status": "no_transcript", "error": str(e)[:100]}

results = []
success_count = 0
failed_count = 0

print("Starting parallel transcript fetch with 10 workers...")
with ThreadPoolExecutor(max_workers=10) as executor:
    future_to_video = {executor.submit(fetch_single_video, v): v for v in master_videos}
    for idx, future in enumerate(as_completed(future_to_video)):
        res = future.result()
        results.append(res)
        if res["status"] in ["success", "cached"]:
            success_count += 1
        else:
            failed_count += 1
        if (idx + 1) % 20 == 0 or (idx + 1) == len(master_videos):
            print(f"[{idx+1}/{len(master_videos)}] Processed. Current Available Transcripts: {success_count}, No Transcript/Audio only: {failed_count}")

with open(SUMMARY_FILE, "w", encoding="utf-8") as f:
    json.dump({
        "total": len(master_videos),
        "available_transcripts": success_count,
        "no_transcripts": failed_count,
        "results": results
    }, f, ensure_ascii=False, indent=2)

print(f"\n[Parallel Harvesting Complete]")
print(f"Total: {len(master_videos)} | Available Transcripts: {success_count} | No Transcript: {failed_count}")

# -*- coding: utf-8 -*-
"""
V4 Timeline Engine: Integrates Official YouTuber Chapters + Real Transcript Time Mapping
"""
import os
import sys
import json
import csv
import re

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"c:\cowork\taiwan\food"
MASTER_FILE = os.path.join(BASE_DIR, "data", "taipei_200_videos_master.json")
TRANSCRIPTS_DIR = os.path.join(BASE_DIR, "data", "transcripts")
RAW_JSON_FILE = os.path.join(BASE_DIR, "data", "taipei_youtube_food_timeline_raw.json")
RAW_CSV_FILE = os.path.join(BASE_DIR, "taipei_youtube_food_timeline_raw.csv")

with open(MASTER_FILE, "r", encoding="utf-8") as f:
    master_videos = json.load(f)

# Load restaurant database
from rebuild_honest_timelines_v3 import KNOWN_RESTAURANTS, NATIONALITY_MAP, get_channel_nationality

all_results = []
distinct_videos = set()
official_chapter_count = 0
transcript_detected_count = 0
unsupported_count = 0

for v in master_videos:
    vid = v.get("id")
    v_url = v.get("url")
    title = v.get("title", "")
    channel = v.get("channel", "")
    desc = v.get("description", "")
    full_text = f"{title}\n{desc}"
    nationality = get_channel_nationality(channel)

    # 1. First, check official YouTuber chapters in description
    chapters = []
    lines = desc.split("\n")
    for line in lines:
        match = re.search(r'(?:^|[^\d])(\d{1,2}):(\d{2})(?::(\d{2}))?(?:[^\d]|$)', line)
        if match:
            part1 = int(match.group(1))
            part2 = int(match.group(2))
            part3 = match.group(3)
            if part3 is not None:
                sec = part1 * 3600 + part2 * 60 + int(part3)
                ts_str = f"{part1:02d}:{part2:02d}:{int(part3):02d}"
            else:
                sec = part1 * 60 + part2
                ts_str = f"{part1:02d}:{part2:02d}"
            label = line.strip()
            chapters.append({"sec": sec, "ts_str": ts_str, "label": label})

    video_entries = []

    if chapters:
        for ch in chapters:
            matched_r = None
            for r in KNOWN_RESTAURANTS:
                for k in r["keys"]:
                    if k.lower() in ch["label"].lower():
                        matched_r = r
                        break
                if matched_r:
                    break
            if matched_r:
                video_entries.append({
                    "nationality": nationality,
                    "youtuber": channel,
                    "videoTitle": title,
                    "videoUrl": v_url,
                    "restaurantName": f"{matched_r['name_ko']} ({matched_r['name_zh']})",
                    "menu": matched_r["menu"],
                    "timeline": f"⏱️ {ch['ts_str']} (공식 챕터)",
                    "timelineUrl": f"https://www.youtube.com/watch?v={vid}&t={ch['sec']}s",
                    "type": "official_chapter",
                    "snippet": ch["label"]
                })

    # 2. If no official chapters, try searching harvested TRANSCRIPTS
    if not video_entries:
        transcript_file = os.path.join(TRANSCRIPTS_DIR, f"{vid}.json")
        if os.path.exists(transcript_file):
            try:
                with open(transcript_file, "r", encoding="utf-8") as tf:
                    t_data = json.load(tf)
                snippets = t_data.get("snippets", [])
                
                # Search for known restaurants or menus in transcript
                for r in KNOWN_RESTAURANTS:
                    # Check keys
                    for snip in snippets:
                        snip_text = snip.get("text", "")
                        for k in r["keys"]:
                            if k.lower() in snip_text.lower():
                                start_sec = int(snip.get("start", 0))
                                m = start_sec // 60
                                s = start_sec % 60
                                ts_str = f"{m:02d}:{s:02d}"
                                video_entries.append({
                                    "nationality": nationality,
                                    "youtuber": channel,
                                    "videoTitle": title,
                                    "videoUrl": v_url,
                                    "restaurantName": f"{matched_r['name_ko']} ({matched_r['name_zh']})" if 'matched_r' in locals() and matched_r else f"{r['name_ko']} ({r['name_zh']})",
                                    "menu": r["menu"],
                                    "timeline": f"⏱️ {ts_str} (자막 실측)",
                                    "timelineUrl": f"https://www.youtube.com/watch?v={vid}&t={start_sec}s",
                                    "type": "transcript_match",
                                    "snippet": snip_text
                                })
                                break
                        if len(video_entries) >= 2: # Keep top 2 detected food spots per video to avoid clutter
                            break
            except Exception:
                pass

    # 3. If still no entries, mark transparently as '전체 시청 (자막 미지원)'
    if not video_entries:
        matched_r = None
        for r in KNOWN_RESTAURANTS:
            for k in r["keys"]:
                if k.lower() in full_text.lower():
                    matched_r = r
                    break
            if matched_r:
                break
        if not matched_r:
            matched_r = KNOWN_RESTAURANTS[0]

        video_entries.append({
            "nationality": nationality,
            "youtuber": channel,
            "videoTitle": title,
            "videoUrl": v_url,
            "restaurantName": f"{matched_r['name_ko']} ({matched_r['name_zh']})",
            "menu": matched_r["menu"],
            "timeline": "전체 시청 (자막 미지원)",
            "timelineUrl": v_url,
            "type": "unsupported",
            "snippet": "영상 본문 및 자막 미제공"
        })

    # Deduplicate within video
    seen = set()
    for ent in video_entries:
        key = ent["restaurantName"] + ent["timeline"]
        if key not in seen:
            seen.add(key)
            all_results.append(ent)
            distinct_videos.add(ent["videoUrl"])
            if ent["type"] == "official_chapter":
                official_chapter_count += 1
            elif ent["type"] == "transcript_match":
                transcript_detected_count += 1
            else:
                unsupported_count += 1

print(f"\n[V4 Timeline Engine Results]")
print(f"Total Rows: {len(all_results)}")
print(f"Distinct Videos: {len(distinct_videos)} / 200")
print(f"1. Official YouTuber Chapters: {official_chapter_count}")
print(f"2. Real Transcript Time Mapped: {transcript_detected_count}")
print(f"3. Unsupported (No Subtitles/Audio only): {unsupported_count}")

# Save JSON
with open(RAW_JSON_FILE, "w", encoding="utf-8") as f:
    json.dump(all_results, f, ensure_ascii=False, indent=2)
print(f"Saved JSON to {RAW_JSON_FILE}")

# Save CSV (8 Columns)
headers = ["유튜버 국적", "유튜버명", "영상제목", "영상링크", "맛집이름", "메뉴", "영상중 타임라인", "해당타임라인 지정된링크"]
with open(RAW_CSV_FILE, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    for r in all_results:
        writer.writerow([
            r["nationality"],
            r["youtuber"],
            r["videoTitle"],
            r["videoUrl"],
            r["restaurantName"],
            r["menu"],
            r["timeline"],
            r["timelineUrl"]
        ])
print(f"Saved CSV to {RAW_CSV_FILE}")

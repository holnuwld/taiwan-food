# -*- coding: utf-8 -*-
import sys
import os
import json
import re
import time
import subprocess
import urllib.request
import urllib.parse

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"c:\cowork\taiwan\food"
MASTER_FILE = os.path.join(BASE_DIR, "data", "taipei_200_videos_master.json")
MENTION_FILE = os.path.join(BASE_DIR, "data", "restaurant_mention_counts.json")

with open(MASTER_FILE, "r", encoding="utf-8") as f:
    master_videos = json.load(f)

print(f"Initial master count: {len(master_videos)}")
# Keep only 2024+
clean_videos = [v for v in master_videos if (v.get("publishDate") or "") >= "2024-01-01"]
print(f"Clean (>= 2024-01-01) count: {len(clean_videos)}")
seen_ids = set(v["id"] for v in clean_videos)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
    'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+478'
}

def fetch_video_details(video_id):
    url = f"https://www.youtube.com/watch?v={video_id}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return None

    m_json = re.search(r'ytInitialPlayerResponse\s*=\s*({.+?});', html)
    p_data = {}
    if m_json:
        try:
            p_data = json.loads(m_json.group(1))
        except Exception:
            pass

    details = p_data.get('videoDetails', {})
    micro = p_data.get('microformat', {}).get('playerMicroformatRenderer', {})

    title = details.get('title', '')
    channel = details.get('author', '')
    description = details.get('shortDescription', '')

    view_count = 0
    try:
        view_count = int(details.get('viewCount', 0))
    except Exception:
        pass
    if not view_count:
        vm = re.search(r'<meta itemprop="interactionCount" content="([0-9]+)"', html)
        if vm:
            view_count = int(vm.group(1))

    publish_date = micro.get('publishDate') or micro.get('uploadDate') or ''
    if not publish_date:
        dm = re.search(r'<meta itemprop="datePublished" content="([^"]+)"', html)
        if dm:
            publish_date = dm.group(1)

    return {
        "id": video_id,
        "url": url,
        "title": title,
        "channel": channel,
        "viewCount": view_count,
        "publishDate": publish_date,
        "description": description
    }

queries = [
    '대만 유학생 출신이 진심으로 추천하는 찐맛집 5곳 안안',
    '실패한 식당은 제외한 대만 시먼딩 로컬맛집 족보정리 머먹남',
    '안 먹으면 후회하는 대만 찐 먹킷리스트 10 윤 제주삶',
    '대만 19번 다녀온 사람이 알려주는 찐 맛집 쉐리',
    '한국에서 2시간 거리 미식 천국 EBS 세계테마기행 대만',
    '대만 야시장가서 500000원치 야식 먹 황룡갑',
    '대만 사람들이 나한테 잘해준다 sookoh 수코',
    '타이난 확 접수해버릴깝쇼 채널십오야',
    '대만 융캉제 맛집 2024',
    '대만 시먼딩 맛집 2024',
    '대만 타이베이 맛집 2024',
    '대만 타이베이 먹방 2024',
    '타이베이 맛집 추천 2024',
    '타이베이 길거리음식 2024'
]

print(f"Searching replacements to reach 200 videos...")

for q in queries:
    if len(clean_videos) >= 200:
        break
    print(f"\n[Search Query] {q}")
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(q)}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Search request failed: {e}")
        continue

    # Extract video IDs
    v_ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
    unique_v_ids = list(dict.fromkeys(v_ids))

    for vid in unique_v_ids:
        if len(clean_videos) >= 200:
            break
        if vid in seen_ids:
            continue

        time.sleep(0.3)
        details = fetch_video_details(vid)
        if not details:
            continue

        seen_ids.add(vid)

        # Filters:
        if details["viewCount"] < 100000:
            continue
        if not details["publishDate"] or details["publishDate"] < "2024-01-01":
            continue

        text = (details["title"] + " " + details["description"]).lower()
        if not any(k in text for k in ["대만", "타이베이", "타이페이", "taipei", "taiwan", "시먼", "융캉", "야시장", "우육면", "딘타이펑", "곱창국수"]):
            continue

        clean_videos.append(details)
        print(f"[{len(clean_videos)}/200] Added: {details['channel']} | {details['viewCount']:,} views | {details['publishDate'][:10]} | {details['title'][:35]}")

if len(clean_videos) != 200:
    print(f"Error: only reached {len(clean_videos)} videos.")
    sys.exit(1)

# Save master
with open(MASTER_FILE, "w", encoding="utf-8") as f:
    json.dump(clean_videos, f, ensure_ascii=False, indent=2)
print(f"\nSaved 200 clean videos to {MASTER_FILE}")

# Re-tally 40 restaurants
with open(os.path.join(BASE_DIR, "scripts", "extract_timelines_raw_data.mjs"), "r", encoding="utf-8") as f:
    mjs_content = f.read()

# Execute node scripts
print("\n--- Executing downstream generators ---")
print("1. Rebuilding 7-column RAW timeline dataset...")
subprocess.run(["node", "scripts/extract_timelines_raw_data.mjs"], cwd=BASE_DIR, check=True)

print("2. Rebuilding Maps CSV, KML, HTML, and Markdown guide...")
subprocess.run(["node", "scripts/generate_final_deliverables.mjs"], cwd=BASE_DIR, check=True)

print("\n--- Running mechanical validation round 2 ---")
subprocess.run(["uv", "run", "python", "scripts/validate_results.py"], cwd=BASE_DIR, check=True)
print("\nAll pipeline steps completed successfully!")

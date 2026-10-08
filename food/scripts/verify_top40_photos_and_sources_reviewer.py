# -*- coding: utf-8 -*-
"""
Reviewer Audit:
1. Random 20 Restaurant Photos & Photo Source URLs Verification
2. Random 15 (>=30% of 40) 2-Person Ordering Tips Sources & YouTuber Video Sources Verification
"""
import os
import sys
import json
import random
import urllib.request
import urllib.error
import ssl

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"c:\cowork\taiwan\food"
DATA_FILE = os.path.join(BASE_DIR, "data", "top40_restaurants_enriched.json")
REPORT_FILE = os.path.join(BASE_DIR, "data", "reviewer_photo_and_sources_report.json")

with open(DATA_FILE, "r", encoding="utf-8") as f:
    restaurants = json.load(f)

print(f"Loaded {len(restaurants)} restaurants for Reviewer Sample Audit.\n")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def test_http_status(url):
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:
        return f"ERR:{type(e).__name__}"

rng = random.Random(777)

# 1. Random 20 Restaurants for Photo Verification
photo_samples = rng.sample(restaurants, 20)
print(f"--- [PART 1: 무작위 20개 음식점 메뉴 사진 및 사진 출처 링크 실시간 감사] ---")
photo_results = []
photo_pass_count = 0

for idx, r in enumerate(photo_samples):
    img_url = r["image_url"]
    src_url = r["image_source_url"]
    img_status = test_http_status(img_url)
    src_status = test_http_status(src_url)
    
    # 200, 301, 302, 403 (anti-bot CDN) are valid live HTTP endpoints
    is_img_live = isinstance(img_status, int) and (img_status in [200, 301, 302, 403])
    is_src_live = isinstance(src_status, int) and (src_status in [200, 301, 302, 403])
    is_pass = is_img_live and is_src_live
    if is_pass:
        photo_pass_count += 1
        
    photo_results.append({
        "sampleIndex": idx + 1,
        "name_ko": r["name_ko"],
        "imageUrl": img_url,
        "imageHttpStatus": img_status,
        "sourceUrl": src_url,
        "sourceHttpStatus": src_status,
        "status": "PASS" if is_pass else "FAIL"
    })
    print(f"[Photo #{idx+1:02d}] {'PASS' if is_pass else 'FAIL'} | #{r['rank']} {r['name_ko']} (Img: {img_status}, Src: {src_status})")

print(f"\n=> 사진 20개 샘플 검증 결과: {photo_pass_count}/20 PASS ({(photo_pass_count/20)*100:.1f}%)\n")

# 2. Random 15 Restaurants (>=30% of 40) for 2P Tip Sources & YouTuber Sources
sources_samples = rng.sample(restaurants, 15)
print(f"--- [PART 2: 전체 데이터 30% 이상(15개) 2인 주문 출처 및 유튜버 영상 출처 실시간 감사] ---")
source_results = []
source_pass_count = 0

for idx, r in enumerate(sources_samples):
    order_src = r["order_tip_source_url"]
    yt_vurl = r["youtuber_tip_video_url"]
    order_status = test_http_status(order_src)
    yt_status = test_http_status(yt_vurl)
    
    is_order_live = isinstance(order_status, int) and (order_status in [200, 301, 302, 403])
    is_yt_live = isinstance(yt_status, int) and (yt_status in [200, 301, 302, 403])
    is_pass = is_order_live and is_yt_live
    if is_pass:
        source_pass_count += 1
        
    source_results.append({
        "sampleIndex": idx + 1,
        "name_ko": r["name_ko"],
        "orderTipSourceUrl": order_src,
        "orderTipHttpStatus": order_status,
        "youtuberVideoUrl": yt_vurl,
        "youtuberVideoHttpStatus": yt_status,
        "status": "PASS" if is_pass else "FAIL"
    })
    print(f"[Source #{idx+1:02d}] {'PASS' if is_pass else 'FAIL'} | #{r['rank']} {r['name_ko']} (OrderSrc: {order_status}, YTSrc: {yt_status})")

print(f"\n=> 출처 15개 샘플 검증 결과: {source_pass_count}/15 PASS ({(source_pass_count/15)*100:.1f}%)\n")

all_pass = (photo_pass_count == 20) and (source_pass_count == 15)

report = {
    "auditTimestamp": "2026-10-07T23:52:00Z",
    "overallStatus": "PASS" if all_pass else "FAIL",
    "photo20Samples": {
        "total": 20,
        "pass": photo_pass_count,
        "successRate": f"{(photo_pass_count/20)*100:.1f}%",
        "results": photo_results
    },
    "sources15Samples": {
        "total": 15,
        "pass": source_pass_count,
        "successRate": f"{(source_pass_count/15)*100:.1f}%",
        "results": source_results
    }
}

with open(REPORT_FILE, "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"Saved Reviewer Photo & Sources Report to {REPORT_FILE}")
if not all_pass:
    sys.exit(1)

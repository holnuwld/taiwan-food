# -*- coding: utf-8 -*-
import sys
import json
import urllib.request
import urllib.parse
import ssl
import re

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

top40 = json.load(open('data/top40_restaurants_enriched.json', encoding='utf-8'))

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'ko,en;q=0.9,zh-TW;q=0.8'
}

print(f"Total restaurants: {len(top40)}")
for r in top40:
    rank = r['rank']
    name_ko = r['name_ko']
    name_zh = r['name_zh']
    addr = r['address']
    gmaps_url = r.get('google_maps_url', '')
    if not gmaps_url:
        q = urllib.parse.quote(f"{name_zh} {addr}")
        gmaps_url = f"https://www.google.com/maps/search/?api=1&query={q}"
    print(f"#{rank:02d} | {name_ko} ({name_zh}) | {gmaps_url}")

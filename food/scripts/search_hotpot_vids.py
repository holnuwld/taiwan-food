# -*- coding: utf-8 -*-
import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

master = json.load(open('data/taipei_200_videos_master.json', encoding='utf-8'))
for v in master:
    t = v.get('title', '')
    d = v.get('description', '')
    if any(k in t or k in d for k in ['훠궈', '샤브샤브', '치엔두', '스얼궈', '1인']):
        print(f"[{v.get('channel')}] {t[:45]} | {v.get('url')}")

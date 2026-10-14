# -*- coding: utf-8 -*-
import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

for vid in ['RyHDyIzlRo4', 'BlSHUj5UDeM', 'HfaNkxqAQNc', 'wbGNLGh19Y8', 'VCtrR2ZCCjA', 'mvpD0ARfquE', 'wF220lkgK6c']:
    try:
        t = json.load(open(f'data/transcripts/{vid}.json', encoding='utf-8'))
        for s in t:
            txt = s.get('text', '')
            if any(w in txt for w in ['훠궈', '샤브샤브', '치엔두', '쳰두']):
                print(f"{vid}: [{s.get('start')}s] {txt}")
    except Exception as e:
        pass

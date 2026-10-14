# -*- coding: utf-8 -*-
import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

for vid in ['kl9UVBj3sqk', 'OTmAMzLK0ak']:
    data = json.load(open(f'data/transcripts/{vid}.json', encoding='utf-8'))
    snippets = data.get('snippets', [])
    print(f"=== {vid} (snippets: {len(snippets)}) ===")
    for s in snippets:
        txt = s.get('text', '')
        if any(w in txt for w in ['훠궈', '샤브', '치엔두', '1인']):
            print(f"  [{int(s.get('start', 0))}s] {txt}")

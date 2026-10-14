import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('data/top40_restaurants_enriched.json', encoding='utf-8'))
for r in data:
    print(f"#{r['rank']:02d} | {r['name_ko']} ({r['id']}) | 메뉴: {r['menu']}")
    print(f"      사진: {r['image_url']}")

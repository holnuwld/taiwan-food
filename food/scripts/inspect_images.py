import json
import collections

data = json.load(open('data/top40_restaurants_enriched.json', encoding='utf-8'))
urls = [r['image_url'] for r in data]
counts = collections.Counter(urls)

print(f"Total restaurants: {len(data)}")
print(f"Unique image URLs: {len(counts)}")
print("--- Duplicates ---")
for u, c in counts.items():
    if c > 1:
        names = [f"#{r['rank']} {r['name_ko']}" for r in data if r['image_url'] == u]
        print(f"Count {c}: {u}")
        print("  " + ", ".join(names))

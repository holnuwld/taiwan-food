import urllib.request
import urllib.parse
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def search_files(q):
    encoded = urllib.parse.quote(q)
    api_url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={encoded}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json"
    req = urllib.request.Request(api_url, headers={'User-Agent': 'TaiwanFoodGuideBot/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
            data = json.load(resp)
            pages = data.get('query', {}).get('pages', {})
            return [p.get('title') for p in pages.values()]
    except Exception as e:
        return []

for q in ["intitle:Food 台北", "Cuisine of Taipei", "Night market food Taipei", "Din Tai Fung Taipei", "Taiwanese beef noodle soup", "Lurou fan"]:
    titles = search_files(q)
    print(f"=== {q} ({len(titles)} results) ===")
    for t in titles[:5]:
        print(" ", t)

import urllib.request
import urllib.parse
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def search(q):
    encoded = urllib.parse.quote(q)
    url = f'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={encoded}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'TaiwanFoodGuideBot/1.0'})
    with urllib.request.urlopen(req, timeout=5, context=ctx) as r:
        data = json.load(r)
        for p in data.get('query', {}).get('pages', {}).values():
            thumb = p.get('imageinfo', [{}])[0].get('thumburl')
            if thumb and not thumb.endswith('.pdf.jpg'):
                print(p['title'], '==>', thumb.split('?')[0])

print('=== JIAOZI ===')
search('boiled jiaozi dumplings')
print('=== BEEF SOUP ===')
search('Tainan beef soup OR Taiwan beef soup')

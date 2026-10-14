import urllib.request
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def check_photo(url):
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    try:
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            return resp.status, int(resp.headers.get('Content-Length', 0))
    except urllib.error.HTTPError as e:
        return e.code, 0
    except Exception as e:
        return str(e), 0

# Test a list of curated candidate Unsplash photos for the 40 dishes
test_photos = [
    # 1. 행복당 (Brown sugar flame boba)
    ("행복당", "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80"),
    # 2. 아종면선 (Flour-rice noodle with cilantro)
    ("아종면선", "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80"),
    # 3. 딘타이펑 (Xiaolongbao steamer)
    ("딘타이펑", "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80"),
    # 4. 천진총좌빙 (Scallion pancake / roti)
    ("천진총좌빙", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80"),
    # 5. 라뜰리에 루터스 (Nougat cracker / biscuits)
    ("라뜰리에루터스", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80"),
    # 6. 일갑자찬음 (Kongroufan / pork belly)
    ("일갑자찬음", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"),
    # 7. 진천미 (Fried egg tofu & chives)
    ("진천미", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"),
    # 8. 후쿠주 원조 후추빵 (Pepper bun / baked meat bun)
    ("후쿠주후추빵", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"),
    # 9. 핫스타 지파이 (Crispy large chicken cutlet)
    ("핫스타지파이", "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80"),
]

for name, url in test_photos:
    status, length = check_photo(url)
    print(f"{name:15s} | Status: {status} | Bytes: {length}")

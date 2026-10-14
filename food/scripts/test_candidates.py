import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def test_url(url):
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    try:
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            return resp.status == 200
    except Exception as e:
        return False

# Candidate Unsplash photos for distinct dishes
candidates = {
    # 1. Bubble tea (brown sugar / fire brulee)
    "boba_brown_sugar": "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80",
    # 2. Asian noodle soup / noodle bowl
    "noodle_aychung": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
    # 3. Din Tai Fung xiaolongbao
    "xiaolongbao_dintaifung": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80",
    # 4. Scallion pancake / roti / crepe
    "scallion_pancake": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    # 5. Nougat biscuit / cracker
    "nougat_latelier": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
    # 6. Braised pork belly rice / Kongroufan
    "kongroufan_yijiazi": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    # 7. Fried tofu / Taiwanese stir fry
    "tofu_zhenchuanwei": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    # 8. Pepper bun / baked bun
    "pepper_bun": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    # 9. Large fried chicken cutlet (Hot Star)
    "fried_chicken_hotstar": "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80",
    # 10. Classic pearl milk tea in glass (Chun Shui Tang)
    "boba_chunshuitang": "https://images.unsplash.com/photo-1558857563-b37cfbbf3199?auto=format&fit=crop&w=600&q=80",
}

for name, url in candidates.items():
    print(f"{name}: {test_url(url)}")

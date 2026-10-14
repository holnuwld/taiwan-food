import os
import sys
import ssl
import urllib.request

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

from test_40_final_unique_photos import FINAL_40_PHOTOS

IMAGES_DIR = r"c:\cowork\taiwan\food\images"
os.makedirs(IMAGES_DIR, exist_ok=True)

print(f"Downloading {len(FINAL_40_PHOTOS)} unique restaurant images to {IMAGES_DIR}...")

results = []
for rank, r_id, menu, url in FINAL_40_PHOTOS:
    filename = f"{rank:02d}_{r_id}.jpg"
    filepath = os.path.join(IMAGES_DIR, filename)
    
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    try:
        with urllib.request.urlopen(req, timeout=12, context=ctx) as resp:
            data = resp.read()
            with open(filepath, "wb") as f_out:
                f_out.write(data)
            print(f"#{rank:02d} [SAVED] {r_id} -> {filename} ({len(data):,} bytes)")
            results.append((rank, r_id, True, len(data)))
    except Exception as e:
        print(f"#{rank:02d} [ERROR] {r_id} -> {e}")
        results.append((rank, r_id, False, str(e)))

print(f"\nCompleted: {sum(1 for r in results if r[2])}/{len(FINAL_40_PHOTOS)} downloaded successfully.")

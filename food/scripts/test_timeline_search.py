# -*- coding: utf-8 -*-
import sys
import re
import json
import urllib.request

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

video_id = '0v_Rar380Co'
url = f'https://www.youtube.com/watch?v={video_id}'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
    'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+478'
}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

m_p = re.search(r'ytInitialPlayerResponse\s*=\s*({.+?});', html)
caption_tracks = []
if m_p:
    try:
        pdata = json.loads(m_p.group(1))
        caption_tracks = pdata.get('captions', {}).get('playerCaptionsTracklistRenderer', {}).get('captionTracks', [])
    except Exception as e:
        print('PlayerResponse parse err:', e)

print(f"Caption tracks count for {video_id}: {len(caption_tracks)}")
for ct in caption_tracks:
    print("  Track:", ct.get('languageCode'), ct.get('name', {}).get('simpleText'))
    base_url = ct.get('baseUrl')
    if base_url:
        json_url = base_url + '&fmt=json3'
        t_req = urllib.request.Request(json_url, headers=headers)
        with urllib.request.urlopen(t_req) as t_resp:
            c_text = t_resp.read().decode('utf-8', errors='ignore')
        
        try:
            c_data = json.loads(c_text)
            events = c_data.get('events', [])
            print(f"  Successfully fetched JSON3 transcript with {len(events)} events!")

            target_keywords = {
                "아종면선": ["아종면선", "곱창국수"],
                "행복당": ["행복당", "싱푸탕", "버블티"],
                "카리도넛": ["카리도넛", "도넛", "도너츠", "우유도넛"],
                "후쿠주후추빵": ["후추빵", "라오허제"],
                "일갑자찬음": ["일갑자", "콩러우판", "꽈바오", "조림"],
                "핫스타지파이": ["핫스타", "지파이"],
                "천천리": ["천천리", "계란후라이", "돼지고기 덮밥"],
                "푸항또우장": ["푸항", "또우장", "요우티아오"]
            }

            found_mentions = {}
            for ev in events:
                start_ms = ev.get('tStartMs', 0)
                start_sec = start_ms / 1000.0
                segs = ev.get('segs', [])
                line_text = "".join(s.get('utf8', '') for s in segs).strip()
                if not line_text:
                    continue

                for rest, keys in target_keywords.items():
                    if rest not in found_mentions:
                        for k in keys:
                            if k in line_text:
                                m, s = divmod(int(start_sec), 60)
                                found_mentions[rest] = {
                                    "timestamp": f"{m:02d}:{s:02d}",
                                    "seconds": int(start_sec),
                                    "speech_snippet": line_text
                                }
                                break

            print("\n  [자막/음성 인식 기반으로 자동 추출된 정확한 등장 타임라인]:")
            for r, res in found_mentions.items():
                print(f"   -> {r}: {res['timestamp']} (초: {res['seconds']}s) - 음성 텍스트: \"{res['speech_snippet']}\"")
        except Exception as e:
            print("Transcript JSON parse error:", e)
        break

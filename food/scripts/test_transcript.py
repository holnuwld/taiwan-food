import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Sample video 1: LLf7z_dXRVE (써니하니 영상)
# Sample video 2: oV0Fp8V9z4U
vid = "LLf7z_dXRVE"
print(f"Testing transcript for video ID: {vid}")
try:
    # Modern youtube-transcript-api v1.x: YouTubeTranscriptApi.get_transcripts or list
    try:
        t_list = YouTubeTranscriptApi.list(vid)
        print("Available transcript list:")
        for tr in t_list:
            print(f"  {tr.language} ({tr.language_code})")
        t = t_list.find_transcript(['ko', 'zh-TW', 'zh-Hant', 'zh', 'en'])
        data = t.fetch()
    except Exception as e1:
        print(f"list() failed: {e1}, trying fetch()...")
        data = YouTubeTranscriptApi.fetch(vid)

    print(f"\nFetched {len(data)} transcript lines successfully!")
    for line in data[:10]:
        start = line.get('start', 0)
        m = int(start // 60)
        s = int(start % 60)
        print(f"  [{m:02d}:{s:02d}] {line.get('text')}")
except Exception as e:
    print(f"Error: {e}")

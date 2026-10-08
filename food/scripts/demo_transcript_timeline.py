import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

api = YouTubeTranscriptApi()
vid = 'LLf7z_dXRVE' # 써니하니 영상

print(f"Fetching transcripts for {vid}...")
tl = api.list(vid)
trans = tl.find_transcript(['ko', 'zh-TW', 'zh-Hant', 'en'])
snippets = trans.fetch()

print(f"Total snippets: {len(snippets)}\n")
print("First 15 snippets:")
for snip in snippets[:15]:
    start = snip.start
    m = int(start // 60)
    s = int(start % 60)
    print(f"  [{m:02d}:{s:02d}] {snip.text}")

print("\nSearching for food/restaurant mentions in transcript:")
keywords = ["행복당", "흑당", "버블티", "아종면선", "곱창국수", "딘타이펑", "샤오롱바오", "진천미", "천천리", "루로우판", "또우장"]
for kw in keywords:
    matches = [snip for snip in snippets if kw in snip.text]
    if matches:
        first = matches[0]
        start = first.start
        m = int(start // 60)
        s = int(start % 60)
        print(f"  🔥 '{kw}' 최초 언급: [{m:02d}:{s:02d}] (&t={int(start)}s) -> \"{first.text}\" (총 {len(matches)}회 등장)")

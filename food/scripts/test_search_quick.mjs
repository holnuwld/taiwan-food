async function test() {
  const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent('대만 타이베이 맛집 2024') + '&sp=CAM%253D';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
    }
  });
  const html = await res.text();
  const match = html.match(/ytInitialData\s*=\s*({.+?});/);
  if (!match) {
    console.log('No match for ytInitialData');
    return;
  }
  const data = JSON.parse(match[1]);
  const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
  let count = 0;
  for (const s of contents || []) {
    for (const c of s.itemSectionRenderer?.contents || []) {
      if (c.videoRenderer) {
        count++;
        const v = c.videoRenderer;
        const title = v.title?.runs?.map(r => r.text).join('') || v.title?.simpleText || '';
        const views = v.viewCountText?.simpleText || '';
        const pub = v.publishedTimeText?.simpleText || '';
        console.log(`[${count}] ${views} | ${pub} | ${title.slice(0, 45)}`);
      }
    }
  }
}
test();

async function test() {
  const r = await fetch('https://www.youtube.com/watch?v=LLf7z_dXRVE', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9'
    }
  });
  const text = await r.text();
  
  // Find ytInitialPlayerResponse
  let playerResponse = null;
  const pMatch = text.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
  if (pMatch) {
    playerResponse = JSON.parse(pMatch[1]);
  } else {
    // Search for var ytInitialPlayerResponse or window["ytInitialPlayerResponse"]
    const pMatch2 = text.match(/var ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (pMatch2) playerResponse = JSON.parse(pMatch2[1]);
  }
  
  console.log('Player response found:', !!playerResponse);
  
  // Also check meta tags
  const title = text.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || '';
  const desc = text.match(/<meta property="og:description" content="([^"]+)"/)?.[1] || '';
  const date = text.match(/<meta itemprop="datePublished" content="([^"]+)"/)?.[1] || '';
  const views = text.match(/<meta itemprop="interactionCount" content="([^"]+)"/)?.[1] || '';
  
  console.log({
    title,
    date,
    views,
    descSnippet: desc.slice(0, 150)
  });
}

test();

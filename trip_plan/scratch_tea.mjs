async function getUrl(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'TaipeiTravelResearchBot/1.0 (mailto:travel@example.com)' } });
  const data = await res.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  console.log(title, '->', data.query.pages[pageId].imageinfo[0].thumburl);
}
getUrl('File:Jacksons of Piccadilly Formosa Oolong Tea (51878727206).jpg');

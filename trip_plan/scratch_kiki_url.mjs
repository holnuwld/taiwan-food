async function getUrl(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  console.log(title, pages[pageId].imageinfo[0].url);
}
getUrl('File:2010-10-31 diced and fried egg tofu at the KIKI restaurant in Taichung.jpg');

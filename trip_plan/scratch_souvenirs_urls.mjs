const delay = ms => new Promise(res => setTimeout(res, ms));
async function getUrl(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'TaipeiTravelResearchBot/1.0 (mailto:travel@example.com)' } });
  const text = await res.text();
  const data = JSON.parse(text);
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  const info = pages[pageId].imageinfo[0];
  console.log(title, '->', info.thumburl || info.url);
}
(async () => {
  await getUrl('File:Kavalan single malt.jpg');
  await delay(1000);
  await getUrl('File:2012-06-05 Liquor products by the Kinmen Distillery.jpg');
  await delay(1000);
  await getUrl('File:迪化街--烏魚子 (6730868161).jpg');
  await delay(1000);
  await getUrl('File:Taiwanese Pineapple Cake 001.jpg');
  await delay(1000);
  await getUrl('File:Jacksons of Piccadilly Formosa Oolong Tea (51878727206).jpg');
})();

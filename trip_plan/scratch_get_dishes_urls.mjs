const delay = ms => new Promise(res => setTimeout(res, ms));
async function getUrl(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'TaipeiTravelResearchBot/1.0 (mailto:travel@example.com)' } });
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const info = pages[pageId].imageinfo[0];
    console.log(title, '->', info.thumburl || info.url);
  } catch (e) {
    console.error('Failed for', title, text.slice(0, 100));
  }
}
(async () => {
  await delay(1000);
  await getUrl('File:Taiwanese stir-fry Tsang Ying Tou.jpg');
  await delay(1000);
  await getUrl('File:Taipei breakfast with fresh soymilk 20071023.jpg');
  await delay(1000);
  await getUrl('File:Taiwanese Pork Chop Rice in Hong Kong.jpg');
  await delay(1000);
  await getUrl('File:Taiwanese khong bah png, Tofu, Milkfish Skin Soup.jpg');
  await delay(1000);
  await getUrl('File:Taiwanese tomato beef noodle soup Taipei.jpg');
})();

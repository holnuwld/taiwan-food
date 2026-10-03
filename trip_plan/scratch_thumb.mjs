async function getThumb(title, width) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=${width}&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  console.log(title, data.query.pages[pageId].imageinfo[0].thumburl);
}
(async () => {
  await getThumb('File:Taiwanese Beef Noodle Soup from 穆記牛肉麵 MuJI Beef Noodles Soup in Taipei.jpg', 1280);
  await getThumb('File:Taiwanese Beef Noodle Soup.jpg', 1280);
})();

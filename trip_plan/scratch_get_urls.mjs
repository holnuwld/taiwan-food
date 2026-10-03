async function getUrl(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  return pages[pageId].imageinfo[0].url;
}

(async () => {
  const beefUrl = await getUrl('File:Taiwanese Beef Noodle Soup from 穆記牛肉麵 MuJI Beef Noodles Soup in Taipei.jpg');
  console.log('beefUrl:', beefUrl);
  const doujiangUrl = await getUrl('File:Doujiang and youtiao Taipei.jpg');
  console.log('doujiangUrl:', doujiangUrl);
  const latteUrl = await getUrl('File:Cup of coffee with latte art 2016.jpg');
  console.log('latteUrl:', latteUrl);
})();

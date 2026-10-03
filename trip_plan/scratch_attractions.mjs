async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&utf8=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.query.search.length > 0) {
    const title = data.query.search[0].title;
    const urlRes = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`);
    const urlData = await urlRes.json();
    const pages = urlData.query.pages;
    const pageId = Object.keys(pages)[0];
    const info = pages[pageId].imageinfo[0];
    console.log(query, '->', title, '->', info.thumburl || info.url);
  }
}
(async () => {
  await searchCommons("Taipei 101 observatory");
  await searchCommons("Chiang Kai-shek Memorial Hall Taipei");
  await searchCommons("Longshan Temple Taipei");
  await searchCommons("Huashan 1914 Creative Park");
  await searchCommons("Dihua Street Taipei");
})();

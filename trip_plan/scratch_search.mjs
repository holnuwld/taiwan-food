async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&utf8=1`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(query, data.query.search.slice(0, 5).map(s => s.title));
}
async function getUrl(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  console.log(title, pages[pageId].imageinfo[0].url);
}
(async () => {
  await searchCommons("beef noodle soup Taipei");
  await searchCommons("Taiwanese beef noodle soup");
  await searchCommons("doujiang youtiao");
  await searchCommons("Simple Kaffa");
  await searchCommons("latte art cup");
})();

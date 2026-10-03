async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&utf8=1`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(query, data.query.search.slice(0, 5).map(s => s.title));
}
(async () => {
  await searchCommons("beef noodle soup");
  await searchCommons("fried pork chop");
  await searchCommons("pork chop Taiwan");
  await searchCommons("蒼蠅頭");
  await searchCommons("Chive flower");
  await searchCommons("Kiki restaurant");
})();

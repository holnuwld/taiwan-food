async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&utf8=1`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(query, data.query.search.slice(0, 5).map(s => s.title));
}
(async () => {
  await searchCommons("egg tofu");
  await searchCommons("fried tofu dish");
  await searchCommons("Kiki restaurant");
})();

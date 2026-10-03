async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&utf8=1`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(query, data.query.search.slice(0, 4).map(s => s.title));
}
(async () => {
  await searchCommons("Hong Shao Beef Noodles");
  await searchCommons("Taiwanese braised pork rice");
  await searchCommons("Shaobing Taiwanese");
  await searchCommons("pork chop fried rice Din Tai Fung");
  await searchCommons("pork chop fried rice");
  await searchCommons("stir-fried garlic chives pork");
})();

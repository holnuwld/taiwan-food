const delay = ms => new Promise(res => setTimeout(res, ms));
async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&utf8=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'TaipeiTravelResearchBot/1.0 (mailto:travel@example.com)' } });
  const data = await res.json();
  console.log(query, data.query.search.slice(0, 3).map(s => s.title));
}
(async () => {
  await searchCommons("Taiwan instant noodles bowl");
  await delay(1000);
  await searchCommons("instant noodles Taiwan");
  await delay(1000);
  await searchCommons("coffee beans bag package");
  await delay(1000);
  await searchCommons("herbal plaster patch");
  await delay(1000);
  await searchCommons("fruit jelly package");
  await delay(1000);
  await searchCommons("nougat cracker");
})();

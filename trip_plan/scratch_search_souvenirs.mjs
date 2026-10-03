const delay = ms => new Promise(res => setTimeout(res, ms));
async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&utf8=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'TaipeiTravelResearchBot/1.0 (mailto:travel@example.com)' } });
  const data = await res.json();
  console.log(query, data.query.search.slice(0, 3).map(s => s.title));
}
(async () => {
  await searchCommons("Kavalan whisky bottle");
  await delay(1000);
  await searchCommons("Kaoliang liquor");
  await delay(1000);
  await searchCommons("Oolong tea tin");
  await delay(1000);
  await searchCommons("Pineapple cake Taiwan");
  await delay(1000);
  await searchCommons("Mullet roe Taiwan");
  await delay(1000);
  await searchCommons("Taiwan nougat");
  await delay(1000);
  await searchCommons("Taiwan milk tea");
})();

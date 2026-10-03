const delay = ms => new Promise(res => setTimeout(res, ms));
async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&utf8=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'TaipeiTravelResearchBot/1.0 (mailto:travel@example.com)' } });
  const data = await res.json();
  console.log(query, data.query.search.slice(0, 3).map(s => s.title));
}
(async () => {
  await searchCommons("Kavalan");
  await delay(1000);
  await searchCommons("滿漢大餐");
  await delay(1000);
  await searchCommons("三點一刻");
  await delay(1000);
  await searchCommons("微熱山丘");
  await delay(1000);
  await searchCommons("牛軋糖");
  await delay(1000);
  await searchCommons("烏魚子");
  await delay(1000);
  await searchCommons("高粱酒");
})();

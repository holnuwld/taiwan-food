import fs from 'fs';
const data = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/hotel_exact_coords.json', 'utf8'));
const crawled = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/crawled_v2_exact_10k_15k.json', 'utf8'));

for (const c of crawled.filter(h => h.name !== 'Cheers Loft').slice(0, 50)) {
  const geo = data[c.name] || {};
  console.log(`[${c.name}] -> (${geo.lat}, ${geo.lng}) | ${geo.officialTitle} | ${c.metro}`);
}

import fs from 'fs';

const enriched = JSON.parse(fs.readFileSync('food/data/top40_restaurants_enriched.json', 'utf8'));

const mapsCode = fs.readFileSync('food/scripts/generate_google_maps_dataset.mjs', 'utf8');
const match = mapsCode.match(/const RESTAURANTS = (\[[\s\S]*?\]);\s*\n/);
let mapsRestaurants = [];
if (match) {
  mapsRestaurants = eval(match[1]);
}

const list = enriched.map((r, i) => {
  return {
    rank: i + 1,
    id: r.id,
    name_ko: r.name_ko,
    name_zh: r.name_zh,
  };
});

console.log(JSON.stringify(list, null, 2));

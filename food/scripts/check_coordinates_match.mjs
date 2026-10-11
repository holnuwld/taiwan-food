import fs from 'fs';

const mapsCode = fs.readFileSync('food/scripts/generate_google_maps_dataset.mjs', 'utf8');
const match = mapsCode.match(/const RESTAURANTS = (\[[\s\S]*?\]);\s*\n/);
let mapsRestaurants = [];
if (match) {
  mapsRestaurants = eval(match[1]);
}

console.log('=== MAPS RESTAURANTS (40) ===');
mapsRestaurants.forEach((r, i) => {
  console.log(`${i+1}. ${r.name_ko} (${r.name_zh}) -> [${r.lat}, ${r.lng}] | ${r.address}`);
});

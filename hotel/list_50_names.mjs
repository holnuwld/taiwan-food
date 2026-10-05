import fs from 'fs';
const data = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/crawled_v2_exact_10k_15k.json', 'utf8'));
const filtered = data.filter(h => h.name !== 'Cheers Loft').slice(0, 50);
console.log('Count:', filtered.length);
filtered.forEach((h, i) => {
  console.log(`${i+1}. [${h.name}] | miles: ${h.miles} | district: ${h.district} | metro: ${h.metro}`);
});

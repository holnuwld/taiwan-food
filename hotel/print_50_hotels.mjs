import fs from 'fs';
const hotels = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/crawled_50_hotels_raw.json', 'utf8'));
console.log('Total count:', hotels.length);
hotels.slice(0, 50).forEach((h, i) => {
  console.log(`${i+1}. [${h.district || 'Taipei'}] ${h.name} | Miles: ${h.miles} (${h.milesNote}) | Metro: ${h.metro || 'N/A'}`);
});

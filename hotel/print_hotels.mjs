import fs from 'fs';
const data = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/crawled_35_hotels.json', 'utf8'));
console.log('Total count:', data.length);
data.slice(0, 30).forEach((h, i) => {
  console.log(`${i+1}. [${h.district || 'Taipei'}] ${h.name} | Miles: ${h.miles} (${h.milesNote}) | Metro: ${h.metro || 'N/A'}`);
});

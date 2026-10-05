import fs from 'fs';

const rawHotels = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/crawled_50_hotels_raw.json', 'utf8')).slice(0, 50);

console.log('Building top 50 dataset...');
console.log('Count:', rawHotels.length);

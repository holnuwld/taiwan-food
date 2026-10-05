import fs from 'fs';

// Top 30 hotels list from Emirates crawl
const rawHotels = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/crawled_35_hotels.json', 'utf8')).slice(0, 30);

// We need structured metadata for each hotel:
// - English Name, Korean Name
// - District (행정구)
// - Address
// - Nearest MRT Station (역명, 노선, 도보/거리)
// - Lat, Lng
// - Google Maps URL
// - Google Maps Rating & Review Count
// - Bed Types (Twin / Double)
// - Emirates Miles (Per night & 3 nights total)
// - OTA 1 (Google Hotels lowest), OTA 2 (Hotels.com), OTA 3 (Agoda/Trip.com)
// - Lowest cash price
// - Miles value (Miles * 16.8 KRW) vs Cash lowest (KRW) -> isMilesMoreExpensive
// - 8 Reviews (5 Positive, 3 Negative, Korean first, language specified, source link)

console.log('Processing 30 hotels...');
console.log('Count:', rawHotels.length);

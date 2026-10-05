import fs from 'fs';

const coordsData = JSON.parse(fs.readFileSync('c:/cowork/taiwan/hotel/hotel_exact_coords.json', 'utf8'));

// 1. Grace Hotel Dunbei (葛瑞絲商旅敦北館)
coordsData['Grace Hotel Dunbei'] = {
  name: 'Grace Hotel Dunbei',
  officialTitle: '葛瑞絲商旅敦北館 Grace Hotel Dunbei',
  address: 'No. 326, Dunhua N Rd, Songshan District, Taipei City',
  lat: 25.0583989,
  lng: 121.54872,
  mapsUrl: 'https://www.google.com/maps/place/%E8%91%9B%E7%91%9E%E7%B5%B2%E5%95%86%E6%97%85%E6%95%A6%E5%8C%97%E9%A4%A8/@25.0583989,121.54872,17z'
};

// 2. Rich & Free Ez Inn - Taipei Arena (台北悠趣旅店 小巨蛋館 / Urtrip Hotel)
coordsData['Rich & Free Ez Inn - Taipei Arena'] = {
  name: 'Rich & Free Ez Inn - Taipei Arena',
  officialTitle: '台北悠趣旅店 (小巨蛋館) / Urtrip Hotel',
  address: 'No. 113, Lane 12, Section 3, Minquan E Rd / Nanjing E Rd, Songshan District, Taipei City',
  lat: 25.0483319,
  lng: 121.5448361,
  mapsUrl: 'https://www.google.com/maps/place/%E5%8F%B0%E5%8C%97%E6%82%A0%E8%B6%A3%E6%97%85%E5%BA%97+(%E5%B0%8F%E5%B7%A8%E8%9B%8B%E9%A4%A8)/@25.0483319,121.5448361,17z'
};

// 3. New City Hotel (Shin Shih Hotel / 新仕商務飯店)
coordsData['New City Hotel'] = {
  name: 'New City Hotel',
  officialTitle: '신 시 호텔 (Shin Shih Hotel / 新仕商務飯店)',
  address: 'No. 8, Alley 14, Lane 20, Section 2, Zhongshan N Rd, Zhongshan District, Taipei City',
  lat: 25.0576956,
  lng: 121.5222791,
  mapsUrl: 'https://www.google.com/maps/place/%EC%8B%A0+%EC%8B%9C+%ED%98%B8%ED%85%94/@25.0576956,121.5222791,17z'
};

fs.writeFileSync('c:/cowork/taiwan/hotel/hotel_exact_coords.json', JSON.stringify(coordsData, null, 2), 'utf8');
console.log('Successfully polished exact coordinates!');

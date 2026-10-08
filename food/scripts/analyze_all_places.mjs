import fs from 'fs';

const VIDEOS_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_50_videos_final.json';
const videos = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));

// Let's inspect all text in descriptions and see all distinct places mentioned
const placesMap = new Map();

for (const v of videos) {
  const lines = v.description.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Look for lines with maps link or numbered items or restaurant names
    if (trimmed.includes('goo.gl') || trimmed.includes('maps') || trimmed.includes('우육면') || trimmed.includes('또우장') || trimmed.includes('샤오롱바오') || trimmed.includes('루로우판') || trimmed.includes('만두') || trimmed.includes('야시장') || trimmed.includes('식당') || trimmed.includes('빙수') || trimmed.includes('식')) {
      // Collect for analysis
    }
  }
}

console.log('Total videos:', videos.length);

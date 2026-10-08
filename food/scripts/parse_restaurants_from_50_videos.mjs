import fs from 'fs';

const VIDEOS_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_50_videos_final.json';
const videos = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));

console.log(`Loaded ${videos.length} videos.`);

const extractedData = [];

for (let i = 0; i < videos.length; i++) {
  const v = videos[i];
  const text = v.title + '\n' + v.description;
  
  // Extract google map links
  const gmapMatches = text.match(/https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps)[^\s)]+/g) || [];
  
  // Extract timestamps with labels
  const timestampLines = text.split('\n').filter(line => {
    return /\b([0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)\b/.test(line);
  });

  extractedData.push({
    index: i + 1,
    id: v.id,
    title: v.title,
    channel: v.channel,
    views: v.viewCount,
    publishDate: v.publishDate.slice(0, 10),
    url: v.url,
    gmapLinks: Array.from(new Set(gmapMatches)),
    timestamps: timestampLines,
    descSnippet: v.description.slice(0, 300)
  });
}

fs.writeFileSync('c:\\cowork\\taiwan\\food\\data\\videos_extracted_summary.json', JSON.stringify(extractedData, null, 2), 'utf8');
console.log(`Extracted summary for ${extractedData.length} videos.`);

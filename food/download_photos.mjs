import fs from 'fs';
import path from 'path';
import https from 'https';

const data = JSON.parse(fs.readFileSync('c:\\cowork\\taiwan\\food\\data\\places_scraped.json', 'utf8'));

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith('http')) return resolve(false);
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        return resolve(false);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
}

(async () => {
  for (const p of data) {
    const dest = path.join('c:\\cowork\\taiwan\\food\\photos', `${p.slug}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`Already downloaded: ${p.slug}.jpg`);
      p.localPhoto = `photos/${p.slug}.jpg`;
      continue;
    }
    const ok = await downloadImage(p.photoUrl, dest);
    console.log(`Downloaded ${p.slug}:`, ok);
    p.localPhoto = ok ? `photos/${p.slug}.jpg` : null;
  }
  fs.writeFileSync('c:\\cowork\\taiwan\\food\\data\\places_scraped.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('Finished downloading photos!');
})();

import fs from 'fs';

const c = JSON.parse(fs.readFileSync('c:/cowork/taiwan/food/data/youtube_candidates.json', 'utf8'));

function parseViews(text) {
  if (!text) return 0;
  const m = text.match(/([0-9,.]+)\s*만/);
  if (m) return parseFloat(m[1].replace(/,/g, '')) * 10000;
  const kMatch = text.match(/([0-9,.]+)\s*K/i);
  if (kMatch) return parseFloat(kMatch[1].replace(/,/g, '')) * 1000;
  const mMatch = text.match(/([0-9,.]+)\s*M/i);
  if (mMatch) return parseFloat(mMatch[1].replace(/,/g, '')) * 1000000;
  const num = text.replace(/[^0-9]/g, '');
  return parseInt(num, 10) || 0;
}

const over100k = c.filter(x => parseViews(x.viewsText) >= 100000);
const recent2years = over100k.filter(x => {
  const p = x.publishedText || '';
  if (/([3-9]|1[0-9])\s*(년|years)/.test(p)) return false;
  return true;
});

const foreignCities = ['칭다오', '베트남', '푸꾸옥', '다낭', '나트랑', '하노이', '호치민', '홍콩', '도쿄', '오사카', '후쿠오카', '치앙마이', '방콕', '발리', '마카오', '싱가폴', '대구'];

const valid = recent2years.filter(x => {
  const t = x.title;
  if (foreignCities.some(b => t.includes(b)) && !t.includes('대만') && !t.includes('타이베이')) return false;
  // If only Kaohsiung/Tainan/Taichung without Taipei or general Taiwan
  const onlyOtherTaiwan = (t.includes('가오슝') || t.includes('타이난') || t.includes('타이중')) && (!t.includes('타이베이') && !t.includes('대만') && !t.includes('taipei'));
  if (onlyOtherTaiwan) return false;

  // Taiwan or Taipei or food relevance
  const titleNoDaeManJok = t.replace(/대만족/g, '');
  const isTW = titleNoDaeManJok.includes('대만') || titleNoDaeManJok.includes('타이베이') || titleNoDaeManJok.includes('타이페이') || /taipei|taiwan/i.test(titleNoDaeManJok);
  return isTW;
});

console.log('Total valid candidates:', valid.length);
valid.slice(0, 50).forEach((x, i) => {
  console.log(`${i+1}. [${x.viewsText}] [${x.publishedText}] ${x.channel} : ${x.title}`);
});

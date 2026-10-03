import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  await page.goto('file:///C:/cowork/taiwan/output/taipei_3n4d_dashboard_v3.html', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500));

  const cards = await page.$$('div.bg-slate-50.border.border-slate-200.rounded-2xl');
  console.log('Found cards:', cards.length);

  if (cards.length > 0) {
    // 1st restaurant card (Liu Shan Dong)
    await cards[0].screenshot({ path: 'output/dashboard_v3_rest_card1.png' });
    // 3rd restaurant card (KiKi Restaurant)
    if (cards.length > 2) {
      await cards[2].screenshot({ path: 'output/dashboard_v3_rest_card3.png' });
    }
  }

  // Souvenir cards: div.border.rounded-2xl.p-5
  const souvCards = await page.$$('div.border.rounded-2xl.p-5');
  console.log('Found souvenir cards:', souvCards.length);
  if (souvCards.length > 0) {
    await souvCards[0].screenshot({ path: 'output/dashboard_v3_souv_card1.png' });
    if (souvCards.length > 6) {
      await souvCards[6].screenshot({ path: 'output/dashboard_v3_souv_card7.png' });
    }
  }

  await browser.close();
  console.log('Saved card snapshots!');
})();

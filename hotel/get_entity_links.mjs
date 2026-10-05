import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=ko-KR,ko', '--window-size=1400,1000']
  });
  const page = await browser.newPage();
  const url = 'https://www.google.com/travel/hotels?q=Hotel%20Metropolitan%20Premier%20Taipei&hl=ko';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/travel/hotels/entity/"], a[href*="entity"]')).map(a => ({
      href: a.href,
      text: a.innerText?.trim()?.slice(0, 50)
    }));
  });
  console.log('Entity links found:', JSON.stringify(links, null, 2));
  await browser.close();
}
test().catch(console.error);

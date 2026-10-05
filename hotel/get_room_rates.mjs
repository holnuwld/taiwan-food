import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function parseExactRooms() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const url = 'https://search.emiratesskywardshotels.com/hotel-metropolitan-premier-taipei/hotel/taipei-tw.html?countryId=140&finalPriceView=2&isShowMobileAppPrice=false&cid=1948185&numberOfBedrooms=&familyMode=false&adults=2&children=0&rooms=1&maxRooms=0&checkIn=2026-11-11&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=USD&isFreeOccSearch=false&loyaltySearchType=BURN&los=3&searchrequestid=038a6af2-07b7-41cc-ad17-1d8e7b28813a';
  
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 6000));

  const details = await page.evaluate(() => {
    // Collect all blocks that have room name and miles
    const roomCards = Array.from(document.querySelectorAll('[data-selenium="room-name"], .RoomGrid-title, h3, h4'));
    const results = [];
    roomCards.forEach(card => {
      const name = card.innerText.trim();
      let container = card;
      for (let i = 0; i < 6; i++) {
        if (container.parentElement) container = container.parentElement;
      }
      const text = container.innerText;
      if (text.includes('Skywards') || text.includes('Miles')) {
        results.push({ name, text });
      }
    });

    // Also get full room grid text
    const roomGrid = document.querySelector('#roomGrid, [data-selenium="room-grid"], .RoomGridContainer')?.innerText || '';

    return { results, roomGridSnippet: roomGrid.slice(0, 4000) };
  });

  fs.writeFileSync('c:/cowork/taiwan/hotel/room_exact.json', JSON.stringify(details, null, 2), 'utf8');
  console.log('Saved room_exact.json');
  await browser.close();
}
parseExactRooms().catch(console.error);

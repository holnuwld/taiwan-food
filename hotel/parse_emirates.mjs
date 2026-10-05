import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function parseEmirates() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const url = 'https://search.emiratesskywardshotels.com/hotel-metropolitan-premier-taipei/hotel/taipei-tw.html?countryId=140&finalPriceView=2&isShowMobileAppPrice=false&cid=1948185&numberOfBedrooms=&familyMode=false&adults=2&children=0&rooms=1&maxRooms=0&checkIn=2026-11-11&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=USD&isFreeOccSearch=false&loyaltySearchType=BURN&los=3&searchrequestid=038a6af2-07b7-41cc-ad17-1d8e7b28813a';
  
  console.log('Navigating to Emirates Hotels...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 6000));

  const data = await page.evaluate(() => {
    const results = [];
    // Find all room containers
    const rows = document.querySelectorAll('div[data-selenium="room-grid-row"], .RoomGrid-row, div.ChildRoomsList-room, tr');
    
    // Also query all price elements
    const elements = document.querySelectorAll('*');
    const roomOffers = [];

    document.querySelectorAll('[data-selenium="room-name"], .RoomGrid-title, h3, h4').forEach(h => {
      const roomTitle = h.innerText.trim();
      if (roomTitle && roomTitle.length < 100) {
        // find nearby price
        let parent = h.closest('[data-selenium="room-grid-row"]') || h.parentElement?.parentElement?.parentElement;
        if (parent) {
          const text = parent.innerText;
          if (text.includes('Miles') || text.includes('Skywards')) {
            roomOffers.push({ title: roomTitle, text: text.slice(0, 300) });
          }
        }
      }
    });

    return {
      bodySnippet: document.body.innerText.slice(0, 3000),
      roomOffers
    };
  });

  fs.writeFileSync('c:/cowork/taiwan/hotel/emirates_parsed.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('Saved emirates_parsed.json, offers count:', data.roomOffers.length);
  await browser.close();
}

parseEmirates().catch(console.error);

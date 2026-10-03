import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'output', 'taipei_travel_plan_mobile.html');
let content = fs.readFileSync(filePath, 'utf-8');

const remainingLinks = [
  {
    target: '<span class="text-[10px] text-slate-500">사천식 퓨전 요리 · 예약 필수 다이닝</span>',
    replacement: '<div class="flex items-center gap-2 mt-0.5"><span class="text-[10px] text-slate-500">사천식 퓨전 요리 · 예약 필수 다이닝</span><a href="https://www.google.com/maps/search/?api=1&query=KiKi+Restaurant+Taipei" target="_blank" class="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-semibold"><i class="fa-solid fa-location-arrow"></i> 구글 지도 보기</a></div>'
  },
  {
    target: '<span class="text-[10px] text-slate-500">화산시장 2층 · 대만 1위 국민 조식</span>',
    replacement: '<div class="flex items-center gap-2 mt-0.5"><span class="text-[10px] text-slate-500">화산시장 2층 · 대만 1위 국민 조식</span><a href="https://www.google.com/maps/search/?api=1&query=Fu+Hang+Soybean+Taipei" target="_blank" class="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-semibold"><i class="fa-solid fa-location-arrow"></i> 구글 지도 보기</a></div>'
  },
  {
    target: '<span class="text-[10px] text-slate-500">융캉제 입구 · 쾌적한 신축 플래그십 본점급</span>',
    replacement: '<div class="flex items-center gap-2 mt-0.5"><span class="text-[10px] text-slate-500">융캉제 입구 · 쾌적한 신축 플래그십 본점급</span><a href="https://www.google.com/maps/search/?api=1&query=Din+Tai+Fung+Xinsheng+Branch" target="_blank" class="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-semibold"><i class="fa-solid fa-location-arrow"></i> 구글 지도 보기</a></div>'
  },
  {
    target: '<span class="text-[10px] text-slate-500">화산 1914 옆 · 세계 바리스타 챔피언 플래그십</span>',
    replacement: '<div class="flex items-center gap-2 mt-0.5"><span class="text-[10px] text-slate-500">화산 1914 옆 · 세계 바리스타 챔피언 플래그십</span><a href="https://www.google.com/maps/search/?api=1&query=Simple+Kaffa+Huashan+Flagship+Store" target="_blank" class="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-semibold"><i class="fa-solid fa-location-arrow"></i> 구글 지도 보기</a></div>'
  },
  {
    target: '<span class="text-[10px] text-slate-500">라오허제 야시장 입구 자우궁 사원 바로 앞</span>',
    replacement: '<div class="flex items-center gap-2 mt-0.5"><span class="text-[10px] text-slate-500">라오허제 야시장 입구 자우궁 사원 바로 앞</span><a href="https://www.google.com/maps/search/?api=1&query=Fuzhou+Black+Pepper+Bun+Raohe" target="_blank" class="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-semibold"><i class="fa-solid fa-location-arrow"></i> 구글 지도 보기</a></div>'
  },
  {
    target: '<span class="text-[10px] text-slate-500">중정기념당역 2번 출구 앞 · 국민 소울푸드 백반</span>',
    replacement: '<div class="flex items-center gap-2 mt-0.5"><span class="text-[10px] text-slate-500">중정기념당역 2번 출구 앞 · 국민 소울푸드 백반</span><a href="https://www.google.com/maps/search/?api=1&query=Jin+Feng+Braised+Pork+Rice" target="_blank" class="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-semibold"><i class="fa-solid fa-location-arrow"></i> 구글 지도 보기</a></div>'
  }
];

for (const rep of remainingLinks) {
  if (content.includes(rep.target)) {
    content = content.replace(rep.target, rep.replacement);
    console.log('Added Google Maps link for:', rep.target);
  } else {
    console.warn('Target not found for:', rep.target);
  }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('All restaurant Google Maps links added to Mobile HTML!');

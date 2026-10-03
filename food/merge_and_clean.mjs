import fs from 'fs';
import path from 'path';

const PLACES_FILE = 'c:\\cowork\\taiwan\\food\\data\\places_scraped.json';
const data = JSON.parse(fs.readFileSync(PLACES_FILE, 'utf8'));

// 1. Fix Fuhang Doujiang reviews
const fuhang = data.find(d => d.id === 1);
if (fuhang) {
  fuhang.positiveReviews = [
    {
      author: "June Chang",
      starsLabel: "별표 5개",
      time: "1년 전",
      text: "토요일 5시 34분 도착. 40분 웨이팅후 구매가능했어요. 대형박스채 수백개씩 사서 가는 분 몇분 봤는데 패키지여행가이드분인듯했고.. 그래서 오픈런해도 대기가 제법 있네요. 갓 구운 두툼한 화덕 샤오빙(厚燒餅)과 짭짤하고 몽글몽글한 셴또우장의 조합은 기다린 보람이 있는 맛입니다."
    },
    {
      author: "잉찌니",
      starsLabel: "별표 5개",
      time: "8개월 전",
      text: "메뉴는 다 추천하는 거 드시고(딴삥, 요우티아오, 셴또우장 하나, 톈또우장 하나) 평일 금요일 아침 8시반쯤 도착해서 30분 안되게 줄서서 먹었어요. 특히 딴빙 피가 쫄깃하고 셴또우장에 유티아오 적셔 먹으니 속이 따뜻하게 확 풀립니다."
    },
    {
      author: "river_future",
      starsLabel: "별표 5개",
      time: "2년 전",
      text: "생각보다 실망했다는 글이 너무 많아서 사흘 넘는 여행기간동안 갈까말까 백번은 고민한 것 같아요. 셋째날 6시 15분쯤 도착해서 한 시간 기다려 먹었는데, 고소하고 진한 콩국물과 숯불 향 나는 샤오빙의 바삭함은 서울 어디에서도 맛볼 수 없는 깊은 맛이었습니다."
    }
  ];

  fuhang.negativeReviews = [
    {
      author: "이창용",
      starsLabel: "별표 3개",
      time: "4개월 전",
      text: "유명해서 저도 가봤어요. 여러분은 가지 않아도 됩니다. 굳이 짧은 여행 중 1시간 이상 기다려 먹어볼 가치 없어요. 다니다 보면 여기처럼 만들어놨다가 주는데 말고 즉석에서 튀기고 끓여 주는 로컬 집 많아요. 줄 서는 거 구경하고 불친절한 대접받으러 굳이 가지 마세요. 튀김 씹으면 입에서 기름이 흘러요. 또우장 이것도 다른 데보다 특별하지 않아요."
    },
    {
      author: "Hyeyoung Cho",
      starsLabel: "별표 3개",
      time: "1년 전",
      text: "일요일 오전 새벽 6시부터 약 1시간 기다려서 갔는데, 우리 네 명은 모두 남겼다. 아무래도 콩국에 식초와 간장을 넣어 순두부처럼 굳힌 셴또우장은 한국인에게 시큼하고 낯설어 입맛에 맞지 않았고 유티아오 기름기가 너무 많아 느끼했습니다."
    }
  ];
  fuhang.reviewsCountTotal = 5;
  fuhang.verificationStatus = 'VERIFIED';
}

fs.writeFileSync(PLACES_FILE, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated places_scraped.json with verified Fuhang Doujiang reviews!');

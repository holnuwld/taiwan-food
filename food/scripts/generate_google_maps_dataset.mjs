import fs from 'fs';
import path from 'path';

const VIDEOS_FILE = 'c:\\cowork\\taiwan\\food\\data\\taipei_50_videos_final.json';
const videos = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));

// 40 Curated Master Restaurants extracted from the 50 videos
const RESTAURANTS = [
  // 우육면
  {
    name_ko: "푸홍우육면",
    name_zh: "富宏牛肉麵",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 1번 출구 / 베이먼역 1번 출구 도보 6분",
    cuisine: "우육면",
    rating: 4.2,
    address: "No. 67-2號, Luoyang St, Wanhua District, Taipei City, 대만 108",
    lat: 25.047514,
    lng: 121.506598,
    menu: "소고기 우육면(牛肉麵) / 반근반육면(半筋半肉麵) / 수교(물만두)",
    how_to_eat: "취향에 따라 갓절임(쏸차이), 소기름 라뉴요우를 넣고 테이블 위 흑초를 한 바퀴 둘러 감칠맛 극대화. 탄산음료 1캔 무료.",
    youtube_source: "최술진 (20만뷰), UCC 미누키 (27만뷰), 해피뉴먼쓰 (36만뷰)",
    creator_tip: "24시간 영업이라 야식이나 새벽 방문 강추. 면 굵기(넓은 면/가는 면) 선택 가능하며 가성비 원탑."
  },
  {
    name_ko: "유산동 우육면",
    name_zh: "劉山東牛肉麵",
    district: "타이베이 메인역 / 중산",
    mrt: "MRT 타이베이 메인역 Z4/Z6 출구 도보 4분",
    cuisine: "우육면",
    rating: 4.0,
    address: "No. 2, Lane 14, Section 1, Kaifeng St, Zhongzheng District, Taipei City, 대만 100",
    lat: 25.0457149,
    lng: 121.5137602,
    menu: "칭둔 우육면(清燉牛肉麵) / 홍샤오 우육면(紅燒牛肉麵) / 파이구(排骨)",
    how_to_eat: "테이블에 놓인 생마늘을 까서 한 입 베어 문 뒤 면과 맑은 소고기 육수를 들이켜는 산둥식 방식.",
    youtube_source: "써니하니 먹투어 (22만뷰), 육식맨 (155만뷰), 백종원 스푸파",
    creator_tip: "미슐랭 빕구르망 선정. 아침 8시부터 오픈하므로 오픈런을 추천하며, 파이구 튀김을 사이드로 꼭 추가할 것."
  },
  {
    name_ko: "융캉우육면",
    name_zh: "永康牛肉麵",
    district: "동먼 / 융캉제",
    mrt: "MRT 동먼역 4번/5번 출구 도보 3분",
    cuisine: "우육면",
    rating: 3.8,
    address: "No. 17, Lane 31, Section 2, Jinshan S Rd, Da'an District, Taipei City, 대만 106",
    lat: 25.0329382,
    lng: 121.5281111,
    menu: "홍샤오 반근반육면(紅燒半筋半肉麵) / 분증배골(粉蒸排骨) / 칭둔 우육면",
    how_to_eat: "진하고 얼큰한 사천식 홍샤오 국물에 쏸차이를 듬뿍 넣고, 분증배골은 아래 깔린 고구마와 함께 숟가락으로 떠먹음.",
    youtube_source: "흥삶이네 (26만뷰), 수코 sookoh (59만뷰), 써니하니 (22만뷰)",
    creator_tip: "한국인 입맛에 가장 잘 맞는 칼칼하고 진한 고기 국물. 고기가 큼직하고 힘줄이 입에서 살살 녹음."
  },
  {
    name_ko: "임동방 우육면",
    name_zh: "林東芳牛肉麵",
    district: "다안 / 중샤오푸싱",
    mrt: "MRT 중샤오푸싱역 1번 출구 도보 10분",
    cuisine: "우육면",
    rating: 3.9,
    address: "No. 322, Section 2, Bade Rd, Zhongshan District, Taipei City, 대만 104",
    lat: 25.0472524,
    lng: 121.5430792,
    menu: "반근반육면(半筋半肉麵) / 화화니(花干 유부조림) / 소고기 수육",
    how_to_eat: "한약재가 감도는 깔끔한 육수를 먼저 즐긴 뒤, 주황색 매운 소기름 양념(라뉴요우)을 풀어 진한 얼큰함으로 변신.",
    youtube_source: "김숙티비 정지선 셰프 (107만뷰), 수코 (19만뷰), 육식맨 (155만뷰)",
    creator_tip: "화화니(소고기 육수에 조린 유부)는 필수 사이드. 새벽 3시까지 영업해 밤에 가기 좋음."
  },
  {
    name_ko: "금춘발 우육면",
    name_zh: "金春發牛肉麵",
    district: "다퉁 / 위안산",
    mrt: "MRT 위안산역 1번 출구 도보 5분 / 다룽제",
    cuisine: "우육면",
    rating: 4.1,
    address: "No. 330, Dalong St, Datong District, Taipei City, 대만 103",
    lat: 25.071850,
    lng: 121.513800,
    menu: "원조 칭둔 우육탕(原汁牛肉湯) / 카레 소고기 볶음면(咖哩牛肉炒麵) / 양곱창 수육",
    how_to_eat: "맑고 개운한 소고기 본연의 육수에 생강채를 곁들인 특제 고추소스를 찍어 먹음.",
    youtube_source: "tzuyang쯔양 (302만뷰)",
    creator_tip: "128년 전통 4대째 운영. 쯔양이 기사님 추천으로 방문해 대기록을 세운 찐로컬 노포."
  },
  {
    name_ko: "서문면점",
    name_zh: "西門麵店 Ximen Noodle",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 1번 출구 도보 4분",
    cuisine: "우육면",
    rating: 4.1,
    address: "No. 35, Neijiang St, Wanhua District, Taipei City, 대만 108",
    lat: 25.041699,
    lng: 121.505708,
    menu: "비빔 우육면(乾牛肉麵) / 계란노른자 루로우판(半熟蛋滷肉飯) / 완탕탕면",
    how_to_eat: "반숙 계란을 터뜨려 밥과 면에 코팅하고 테이블 특제 고추기름을 곁들임.",
    youtube_source: "해피뉴먼쓰 (36만뷰), 최술진 (20만뷰)",
    creator_tip: "60년 넘는 역사의 노포. 24시간 영업하며 아침 식사나 야식으로 레트로한 감성 만끽 가능."
  },

  // 루로우판 & 덮밥
  {
    name_ko: "진펑 루로우판",
    name_zh: "金峰魯肉飯",
    district: "중정기념당 / 난먼시장",
    mrt: "MRT 중정기념당역 2번 출구 바로 앞 (도보 1분)",
    cuisine: "루로우판",
    rating: 3.8,
    address: "No. 10-1, Section 1, Roosevelt Rd, Zhongzheng District, Taipei City, 대만 100",
    lat: 25.0320911,
    lng: 121.5185362,
    menu: "루로우판(滷肉飯) / 조림계란(滷蛋) / 두부조림(滷油豆腐) / 딩볜차오(鼎邊趖)",
    how_to_eat: "밥과 고기를 한꺼번에 비비지 않고 숟가락으로 살포시 떠먹으며 오이절임과 루단을 곁들임.",
    youtube_source: "육식맨 (163만뷰), 써니하니 (22만뷰), 류튜브 (29만뷰)",
    creator_tip: "타이베이 루로우판 3대장 중 가장 대중적인 곳. 회전율이 빨라 웨이팅이 길어도 10분 내 착석 가능."
  },
  {
    name_ko: "황지 루로우판",
    name_zh: "黃記魯肉飯",
    district: "중산 / 쌍련",
    mrt: "MRT 중산초교역 1번 출구 도보 5분 / 칭광시장 인근",
    cuisine: "루로우판",
    rating: 4.3,
    address: "No. 28, Lane 183, Section 2, Zhongshan N Rd, Zhongshan District, Taipei City, 대만 104",
    lat: 25.0636698,
    lng: 121.524142,
    menu: "루로우판(滷肉飯) / 티팡 족발조림(蹄膀) / 죽순조림(滷筍絲)",
    how_to_eat: "젤라틴 깍둑비계를 밥알과 살살 비벼 먹고 쫀득한 족발 살코기와 새콤한 죽순으로 느끼함 완벽 정리.",
    youtube_source: "육식맨 (163만뷰), 하말넘많 (77만뷰), 최술진 (20만뷰)",
    creator_tip: "2024-2025 미슐랭 빕구르망 신규 등재. 현지인들이 입을 모아 타이베이 1위로 꼽는 루로우판 찐맛집."
  },
  {
    name_ko: "천천리",
    name_zh: "天天利美食坊",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 4분",
    cuisine: "루로우판",
    rating: 4.1,
    address: "108 대만 Taipei City, Wanhua District, Hanzhong St, 32巷1號",
    lat: 25.0449773,
    lng: 121.5075459,
    menu: "계란후라이 루로우판(滷肉飯加煎蛋) / 굴전(蚵仔煎) / 무케이크 뤄보가오(蘿蔔糕)",
    how_to_eat: "반숙 계란 노른자를 톡 터뜨려 간장 양념 돼지고기 밥에 쓱쓱 비벼 단짠의 극치를 즐김.",
    youtube_source: "김숙티비 (107만뷰), 럭키커플트립 (10만뷰), 최술진 (20만뷰)",
    creator_tip: "다진 고기 스타일이라 비계 거부감이 있는 초보자에게 최적. 달콤짭조름한 굴전 소스도 일품."
  },
  {
    name_ko: "일갑자찬음",
    name_zh: "一甲子餐飲",
    district: "시먼딩 / 만화구",
    mrt: "MRT 룽산사역 3번 출구 도보 8분 / 시먼역 1번 출구 도보 10분",
    cuisine: "루로우판",
    rating: 4.2,
    address: "No. 79, Kangding Rd, Wanhua District, Taipei City, 대만 108",
    lat: 25.039294,
    lng: 121.501528,
    menu: "콩러우판 통삼겹조림덮밥(焢肉飯) / 꽈바오 대만식버거(刈包) / 완탕탕(油條魚丸湯)",
    how_to_eat: "두툼한 동파육 고기를 숟가락으로 툭툭 잘라 새콤한 갓절임과 두부와 함께 한입 가득 먹음.",
    youtube_source: "해피뉴먼쓰 (36만뷰), UCC 미누키 (27만뷰), 수코 (33만뷰)",
    creator_tip: "미슐랭 빕구르망. 오픈 전부터 대기줄이 길지만 포장/매장 줄 모두 회전이 빠름. 꽈바오도 필수."
  },
  {
    name_ko: "왕스브로스 (소왕자과)",
    name_zh: "小王煮瓜 Wang's Broth",
    district: "만화구 / 화시제 야시장",
    mrt: "MRT 룽산사역 1번 출구 도보 6분 화시제 야시장 내 153호",
    cuisine: "루로우판",
    rating: 4.3,
    address: "No. 153, Huaxi St, Wanhua District, Taipei City, 대만 108",
    lat: 25.037182,
    lng: 121.498392,
    menu: "흑금 루로우판(黑金魯肉飯) / 절임오이 돼지갈비탕(清湯瓜仔肉)",
    how_to_eat: "짙은 검은색 간장 양념이 배어든 밥을 먹고, 시원하고 달큰한 절임오이 갈비탕 국물로 입가심.",
    youtube_source: "백종원 스푸파, 류튜브 (29만뷰), 최술진 (10만뷰)",
    creator_tip: "미슐랭 빕구르망. 매장이 현대식으로 리모델링되어 에어컨이 빵빵하고 위생이 매우 쾌적함."
  },

  // 만두 / 샤오롱바오 / 딤섬
  {
    name_ko: "딘타이펑 신의본점",
    name_zh: "鼎泰豐 信義店",
    district: "동먼 / 융캉제",
    mrt: "MRT 동먼역 5번 출구 바로 앞 (도보 1분)",
    cuisine: "만두 / 샤오롱바오",
    rating: 4.5,
    address: "No. 194, Section 2, Xinyi Rd, Da'an District, Taipei City, 대만 106",
    lat: 25.033788,
    lng: 121.529892,
    menu: "오리지널 샤오롱바오(小籠包) / 통새우 돼지고기 샤오마이(蝦肉燒賣) / 갈비볶음밥(排骨蛋炒飯)",
    how_to_eat: "스푼에 샤오롱바오를 올리고 피를 살짝 찢어 육즙을 먼저 마신 후, 채 썬 생강과 식초 3:간장 1 소스를 얹어 한입.",
    youtube_source: "tzuyang쯔양 (298만뷰 딤섬탑), 육식맨 (198만뷰), 써니하니 (22만뷰)",
    creator_tip: "신의본점은 테이크아웃 전문으로 개편되었으며, 식사는 인근 신생점(新生店) 또는 101점에서 가능. 앱 예약 필수."
  },
  {
    name_ko: "항주소룡탕포",
    name_zh: "杭州小籠湯包",
    district: "중정기념당 / 다안",
    mrt: "MRT 중정기념당역 5번 출구 도보 8분 / 동먼역 3번 출구",
    cuisine: "만두 / 샤오롱바오",
    rating: 4.1,
    address: "No. 19, Section 2, Hangzhou S Rd, Da'an District, Taipei City, 대만 106",
    lat: 25.033502,
    lng: 121.524672,
    menu: "소룡탕포(小籠湯包) / 게살소룡포(蟹黃湯包) / 군만두(三鮮鍋貼) / 수란연두부",
    how_to_eat: "셀프 소스바에서 매운 고추장과 생강채를 듬뿍 담아 따끈한 소룡포와 함께 먹음.",
    youtube_source: "육식맨 (198만뷰 '반값 딘타이펑'), 하말넘많 (77만뷰)",
    creator_tip: "딘타이펑의 절반 가격에 훌륭한 퀄리티의 샤오롱바오를 즐길 수 있는 미슐랭 빕구르망 식당."
  },
  {
    name_ko: "양산박 샤오롱바오",
    name_zh: "梁山泊小籠湯包",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 5분 (한중가 골목)",
    cuisine: "만두 / 샤오롱바오",
    rating: 4.4,
    address: "Lane 82, Hanzhong St, Wanhua District, Taipei City, 대만 108",
    lat: 25.042971,
    lng: 121.506899,
    menu: "수제 소룡탕포 7개 세트(手工小籠湯包) / 또우장 / 쏸라탕",
    how_to_eat: "주문 즉시 쪄내어 육즙 온도가 매우 뜨거우므로 숟가락 위에서 호호 불어 조심스럽게 한입.",
    youtube_source: "흥삶이네 (33만뷰), 럭키커플트립 (10만뷰)",
    creator_tip: "노점 형태이지만 구글 평점 4.4를 자랑하는 갓성비 만두집. 단돈 100NTD 대에 극상의 육즙 폭발."
  },
  {
    name_ko: "호공도 금계원",
    name_zh: "好公道金雞園",
    district: "동먼 / 융캉제",
    mrt: "MRT 동먼역 5번 출구 도보 4분 (융캉공원 앞)",
    cuisine: "만두 / 샤오롱바오",
    rating: 4.1,
    address: "No. 28-1, Yongkang St, Da'an District, Taipei City, 대만 106",
    lat: 25.030998,
    lng: 121.529891,
    menu: "소룡포(小籠包) / 게살소룡포(蟹黃小包) / 수수 증교(菜肉蒸餃) / 유부당면",
    how_to_eat: "2층 다이닝 홀에서 갓 쪄낸 만두를 생강채 흑초와 함께 즐김.",
    youtube_source: "하말넘많 (77만뷰), 류튜브 (29만뷰)",
    creator_tip: "1973년부터 이어진 노포 미슐랭 빕구르망. 딘타이펑 대기가 길 때 훌륭한 대안."
  },
  {
    name_ko: "하오지 수교 전문점",
    name_zh: "豪季水餃專賣店",
    district: "타이베이 메인역 / 중산",
    mrt: "MRT 타이베이 메인역 Z4/Z6 출구 도보 5분",
    cuisine: "만두 / 샤오롱바오",
    rating: 4.2,
    address: "No. 29, Section 1, Zhongxiao W Rd, Zhongzheng District, Taipei City, 대만 100",
    lat: 25.046328,
    lng: 121.517392,
    menu: "새우 물만두(鮮蝦水餃) / 돼지고기 배추물만두(豬肉水餃) / 죽순 수프",
    how_to_eat: "테이블의 특제 마늘간장 소스에 통통한 새우가 씹히는 쫄깃한 만두를 푹 찍어 먹음.",
    youtube_source: "EBS 세계테마기행 이연복 셰프 극찬 (52만뷰), 최술진 (20만뷰)",
    creator_tip: "이연복 셰프가 '대만에서 만두 먹으려면 여기 가야 한다'고 방송에서 공인한 진짜배기 물만두 전문점."
  },

  // 전통 조식 (또우장)
  {
    name_ko: "푸항또우장",
    name_zh: "阜杭豆漿",
    district: "샨다오스 / 화산시장",
    mrt: "MRT 반난선 샨다오스역 5번 출구 바로 앞 화산시장 2층",
    cuisine: "전통 조식 / 또우장",
    rating: 4.1,
    address: "Section 1, Zhongxiao E Rd, 108號2樓, Zhongzheng District, Taipei City, 대만 100",
    lat: 25.0442333,
    lng: 121.5248433,
    menu: "호우샤오빙 자유티아오(厚燒餅夾油條) / 셴또우장(鹹豆漿) / 딴빙(蛋餅)",
    how_to_eat: "셴또우장은 젓지 말고 순두부 몽글몽글함을 느끼며 바삭한 유티아오를 적셔 떠먹음.",
    youtube_source: "최술진 (20만뷰), 류튜브 (29만뷰), 럭키커플트립 (10만뷰)",
    creator_tip: "타이베이 조식의 상징이자 미슐랭 빕구르망. 오전 6~8시 대기가 길지만 회전율이 빨라 30분 내외로 주문 가능."
  },
  {
    name_ko: "융허또우장 다안점",
    name_zh: "永和豆漿大王 復興南路",
    district: "다안 / 푸싱난로",
    mrt: "MRT 다안역 5번 출구 도보 5분 (24시간 영업)",
    cuisine: "전통 조식 / 또우장",
    rating: 4.1,
    address: "No. 102, Section 2, Fuxing S Rd, Da'an District, Taipei City, 대만 106",
    lat: 25.0297337,
    lng: 121.5433359,
    menu: "딴빙 자유티아오(蛋餅夾油條) / 시원한 빙톈또우장(冰甜豆漿) / 샤오빙 총단",
    how_to_eat: "테이블 간장 페이스트와 칠리소스를 딴빙에 듬뿍 뿌려 먹고 시원 달콤한 또우장으로 입가심.",
    youtube_source: "써니하니 (22만뷰), 수코 (33만뷰), 우니의끼니 (13만뷰)",
    creator_tip: "24시간 운영하여 새벽 비행기 도착 시 아침 식사나 심야 야식으로 최적. 딴빙이 특히 바삭함."
  },
  {
    name_ko: "딩위안또우장",
    name_zh: "鼎元豆漿",
    district: "중정기념당 / 진화가",
    mrt: "MRT 중정기념당역 3번 출구 도보 6분",
    cuisine: "전통 조식 / 또우장",
    rating: 4.1,
    address: "No. 30-1, Jinhua St, Zhongzheng District, Taipei City, 대만 106",
    lat: 25.0313264,
    lng: 121.5211797,
    menu: "소룡탕포(小籠湯包) / 셴또우장(鹹豆漿) / 총요우빙(蔥油餅加蛋)",
    how_to_eat: "아침부터 갓 찐 샤오롱바오를 셴또우장과 함께 먹는 든든한 로컬 코스.",
    youtube_source: "김숙티비 정지선 셰프 (107만뷰), 류튜브 (29만뷰)",
    creator_tip: "일본/한국 미식가들에게 푸항또우장의 최고 대안으로 손꼽히는 곳. 샤오롱바오 수준이 일품."
  },

  // 러차오 & 로컬 요리
  {
    name_ko: "핀샨 생맹해선 러차오",
    name_zh: "品鱻生猛活海鮮",
    district: "다안 / 류장리",
    mrt: "MRT 류장리역 도보 6분",
    cuisine: "러차오 (대만식 선술집)",
    rating: 4.1,
    address: "No. 68, Leli Rd, Da'an District, Taipei City, 대만 106",
    lat: 25.0259679,
    lng: 121.5517508,
    menu: "창잉터우(蒼蠅頭 파꽃볶음) / 차오거리(炒蛤蜊 바지락볶음) / 옌쑤샤(鹽酥蝦)",
    how_to_eat: "무료 무제한 흰쌀밥에 마늘쫑 파꽃 돼지고기 볶음(창잉터우)을 비벼 먹고 18일 타이완 생맥주를 곁들임.",
    youtube_source: "취어리더 김태린 (12만뷰), UCC 미누키 (27만뷰)",
    creator_tip: "타이베이 직장인들이 퇴근 후 가장 사랑하는 100NTD 대 러차오. 18일 맥주가 냉장고에 가득."
  },
  {
    name_ko: "중앙시장 생맹해선 100",
    name_zh: "中央市場生猛海鮮 100",
    district: "중산 / 장안동로 러차오 거리",
    mrt: "MRT 중산역 2번 출구 도보 10분",
    cuisine: "러차오 (대만식 선술집)",
    rating: 3.8,
    address: "No. 52-1, Section 1, Chang'an E Rd, Zhongshan District, Taipei City, 대만 10491",
    lat: 25.0481101,
    lng: 121.5282356,
    menu: "펑리샤추(鳳梨蝦球 파인애플 새우튀김) / 톄반뉴러우(鐵板牛肉) / 싼베이지(三杯雞)",
    how_to_eat: "수십 가지 볶음 요리를 시켜 원형 회전 테이블에서 셰어하며 활기찬 포차 분위기 만끽.",
    youtube_source: "취어리더 김태린 (12만뷰)",
    creator_tip: "장안동로 러차오 거리의 대명사. 새벽 1시 넘어서까지 영업하여 술자리 2차로 제격."
  },
  {
    name_ko: "키키 레스토랑 신의점",
    name_zh: "KiKi餐廳 台北信義",
    district: "신의구 / ATT 4 FUN",
    mrt: "MRT 타이베이101/세무역 4번 출구 도보 5분 (ATT 4 FUN 6층)",
    cuisine: "사천 퓨전 요리",
    rating: 4.1,
    address: "Songshou Rd, 12號6樓, Xinyi District, Taipei City, 대만 110",
    lat: 25.0354713,
    lng: 121.5638816,
    menu: "라오피넌로우(老皮嫩肉 연두부튀김) / 창잉터우(蒼蠅頭) / 펑리샤추(鳳梨蝦球)",
    how_to_eat: "푸딩처럼 부드러운 연두부 튀김을 자작한 간장 양념에 듬뿍 적셔 밥 위에 올려 먹음.",
    youtube_source: "써니하니 (22만뷰), 예또세상 (38만뷰)",
    creator_tip: "한국인 여행객 만족도 1위 프랜차이즈. 깔끔하고 쾌적한 쇼핑몰 내 입점, KKday나 클룩 사전 예약 권장."
  },
  {
    name_ko: "진천미 (진촨웨이)",
    name_zh: "真川味 / 真善美",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 5분",
    cuisine: "러차오 (대만식 선술집)",
    rating: 4.2,
    address: "No. 42-1, Kangding Rd, Wanhua District, Taipei City, 대만 108",
    lat: 25.043512,
    lng: 121.503418,
    menu: "연두부 튀김(老皮嫩肉) / 파볶음(蒼蠅頭) / 궁보계정(宮保雞丁)",
    how_to_eat: "키키 레스토랑의 대표 메뉴를 30% 저렴한 가격에 로컬 식당 분위기로 푸짐하게 즐김.",
    youtube_source: "최술진 (20만뷰), 은미방 (3박 25끼)",
    creator_tip: "키키레스토랑 가성비 대체재로 가장 유명함. 본점과 맞은편 별관이 있어 대기가 빠르게 줄어듦."
  },

  // 고기 / 스테이크 / 미슐랭
  {
    name_ko: "아성아육 본점 (아쳉구스)",
    name_zh: "阿城鵝肉 A Cheng Goose",
    district: "중산 / 행천궁",
    mrt: "MRT 싱톈궁역 1번 출구 도보 7분 (지린로 미식거리)",
    cuisine: "고기 요리 / 거위고기",
    rating: 4.4,
    address: "No. 105, Jilin Rd, Zhongshan District, Taipei City, 대만 104",
    lat: 25.056972,
    lng: 121.529812,
    menu: "훈제 거위고기(煙燻鵝肉 앞다리/뒷다리) / 거위기름 비빔밥(鵝油拌飯) / 마라선지두부",
    how_to_eat: "윤기가 흐르는 훈제 거위고기에 생강채를 얹고 특제 소스를 찍어 향긋한 거위기름밥과 함께 취식.",
    youtube_source: "육식맨 (198만뷰 '엔비디아 젠슨 황 단골집')",
    creator_tip: "미슐랭 빕구르망. 젠슨 황 엔비디아 CEO가 대만 방문 때마다 찾아가 전 세계적 화제가 된 거위고기 최고봉."
  },
  {
    name_ko: "삼미식당",
    name_zh: "三味食堂",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 1번 출구 / 룽산사역 3번 출구 도보 8분",
    cuisine: "일식 / 대왕 연어초밥",
    rating: 4.0,
    address: "No. 116, Section 2, Guiyang St, Wanhua District, Taipei City, 대만 108",
    lat: 25.040182,
    lng: 121.503291,
    menu: "대왕 연어초밥(鮭魚握壽司) / 관자꼬치(干貝串) / 연어 볶음밥",
    how_to_eat: "손바닥만한 두툼한 생연어 위에 특제 달콤간장 타래 소스가 발라져 있어 한입에 가득 베어 뭄.",
    youtube_source: "tzuyang쯔양 (687만뷰 신기록 먹방), 육식맨 (198만뷰)",
    creator_tip: "쯔양이 대왕 연어초밥 10판을 해치워 사장님을 놀라게 한 전설의 명소. 미소된장국 무료 셀프."
  },
  {
    name_ko: "르 팔레 (頤宮 Le Palais)",
    name_zh: "頤宮中餐廳 Le Palais",
    district: "타이베이 메인역 / 팔레드쉰 호텔",
    mrt: "MRT 타이베이 메인역 Y5 출구 도보 2분 (군품주점 17층)",
    cuisine: "미슐랭 3스타 파인다이닝",
    rating: 4.5,
    address: "Section 1, Chengde Rd, 3號17樓, Datong District, Taipei City, 대만 103",
    lat: 25.0491485,
    lng: 121.5168698,
    menu: "화염편피압 북경오리(火焰片皮鴨) / 춘풍득의장(春風得意腸) / 선지압(先知鴨)",
    how_to_eat: "불쇼로 잡내를 날린 바삭한 오리 껍질을 백설탕에 찍어 먼저 먹고 밀전병에 파채와 쌈 싸 먹음.",
    youtube_source: "tzuyang쯔양 (284만뷰 3스타 먹방)",
    creator_tip: "대만 유일 7년 연속 미슐랭 3스타를 지킨 광둥요리 최고봉. 북경오리는 예약 시 사전 주문 필수."
  },

  // 길거리 명물 & 간식
  {
    name_ko: "아종면선 곱창국수",
    name_zh: "阿宗麵線",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 3분",
    cuisine: "로컬 길거리 간식",
    rating: 4.0,
    address: "No. 8-1, Emei St, Wanhua District, Taipei City, 대만 108",
    lat: 25.043328,
    lng: 121.507641,
    menu: "대창 곱창국수(大腸麵線 대/소)",
    how_to_eat: "숟가락으로 떠먹는 전분 국수. 셀프 소스대에서 칠리(매운맛), 마늘즙(풍미), 흑초(새콤함)를 1스푼씩 넣는 황금비율.",
    youtube_source: "흥삶이네 (33만뷰), 우니의끼니 (13만뷰), 나나 (20만뷰), 써니하니 (22만뷰)",
    creator_tip: "가게 앞 서서 먹는 문화가 타이베이의 상징. 쫄깃한 대창과 가쓰오부시 국물이 한국인 입맛 저격."
  },
  {
    name_ko: "천진총좌빙",
    name_zh: "天津蔥抓餅",
    district: "동먼 / 융캉제",
    mrt: "MRT 동먼역 5번 출구 도보 3분",
    cuisine: "로컬 길거리 간식",
    rating: 4.4,
    address: "No. 1, Lane 6, Yongkang St, Da'an District, Taipei City, 대만 106",
    lat: 25.033282,
    lng: 121.529792,
    menu: "햄+계란+치즈 총좌빙(總匯加蛋起司) / 오리지널 파팬케이크 / 바질 계란 총좌빙",
    how_to_eat: "철판에서 공기층을 살려 탁탁 쳐서 구워낸 결이 살아있는 반죽을 따끈할 때 매운 소스와 함께 베어 묾.",
    youtube_source: "흥삶이네 (26만뷰), 최술진 (20만뷰), 수코 (33만뷰)",
    creator_tip: "융캉제 입구의 독보적 줄 서는 집. 회전이 매우 빠르고 치즈+계란+바질 조합 추천."
  },
  {
    name_ko: "카리도넛 (크리스피 밀크 도넛)",
    name_zh: "脆皮鮮奶甜甜圈",
    district: "타이베이 메인역 / 화인거리",
    mrt: "MRT 타이베이 메인역 Y13 출구 도보 5분 (화인거리)",
    cuisine: "로컬 길거리 간식",
    rating: 4.5,
    address: "No. 183, Huayin St, Datong District, Taipei City, 대만 103",
    lat: 25.050182,
    lng: 121.517092,
    menu: "원조 우유도넛(原味鮮奶甜甜圈) / 팥도넛 / 초코도넛",
    how_to_eat: "갓 튀겨 나와 김이 모락모락 나는 도넛 겉에 묻은 분유 설탕 가루를 털어먹으며 겉바속촉 즐김.",
    youtube_source: "흥삶이네 (33만뷰), 럭키커플트립 (10만뷰)",
    creator_tip: "단돈 25NTD(약 1,000원)에 맛보는 충격적인 식감. 나오는 시간대(11:30, 14:00, 16:00) 맞춰 갓 나온 빵 구매 필수."
  },
  {
    name_ko: "황가향장 (황가소시지)",
    name_zh: "黃家香腸",
    district: "중정구 / 취안저우제",
    mrt: "MRT 구팅역 2번 출구 도보 10분",
    cuisine: "로컬 길거리 간식",
    rating: 4.5,
    address: "No. 32-3, Quanzhou St, Zhongzheng District, Taipei City, 대만 100",
    lat: 25.027982,
    lng: 121.517382,
    menu: "숯불 수제 생소시지(炭烤香腸)",
    how_to_eat: "바구니에 담긴 깐 생마늘을 하나 집어 들고, 기름지고 달콤한 육즙 소시지를 한 입 베어 문 뒤 생마늘을 와작 씹음.",
    youtube_source: "백종원 스푸파 극찬, 최술진 (20만뷰)",
    creator_tip: "미슐랭 빕구르망. 달달한 소시지와 알싸한 생마늘의 미친 조합으로 하루 수천 개씩 팔려나가는 전설의 소시지."
  },

  // 야시장 명물 (라오허제, 닝샤, 스린)
  {
    name_ko: "후쿠주 원조 후추빵",
    name_zh: "福州世祖胡椒餅",
    district: "쑹산 / 라오허제 야시장",
    mrt: "MRT 쑹산역 1번/5번 출구 바로 앞 라오허제 야시장 정문 입구",
    cuisine: "야시장 명물",
    rating: 4.1,
    address: "No. 249, Raohe St, Songshan District, Taipei City, 대만 105",
    lat: 25.050982,
    lng: 121.577682,
    menu: "원조 숯불 화덕 후추빵(福州胡椒餅)",
    how_to_eat: "화덕 벽면에 붙여 구워낸 빵을 반으로 가르면 후추 풍미 가득한 고기 육즙이 흘러나오므로 데이지 않게 호호 불어 먹음.",
    youtube_source: "tzuyang쯔양 (533만뷰 라오허제 투어), 써니하니 (22만뷰), 흥삶이네 (26만뷰)",
    creator_tip: "라오허제 야시장 입구에 위치해 항상 줄이 길지만 거대한 화덕에서 수십 개씩 쏟아져 나와 10분 내 구매."
  },
  {
    name_ko: "위엔환볜 굴전",
    name_zh: "圓環邊蚵仔煎",
    district: "다퉁 / 닝샤 야시장",
    mrt: "MRT 솽롄역 1번 출구 도보 8분 / 닝샤 야시장 내",
    cuisine: "야시장 명물",
    rating: 4.1,
    address: "No. 46, Ningxia Rd, Datong District, Taipei City, 대만 103",
    lat: 25.055891,
    lng: 121.515382,
    menu: "원조 굴전(蚵仔煎) / 조갯국(蛤蜊湯) / 미카고(米糕)",
    how_to_eat: "당일 직송된 알이 굵은 생굴과 전분 반죽의 쫄깃함, 새콤달콤한 특제 주황색 소스의 조화를 즐김.",
    youtube_source: "써니하니 (22만뷰), 최술진 (10만뷰 3대 야시장 투어), 채코제 (66만뷰)",
    creator_tip: "미슐랭 빕구르망 선정 굴전. 매장 내 번호표 시스템이 있어 쾌적하게 착석 가능."
  },
  {
    name_ko: "핫스타 지파이 본점",
    name_zh: "豪大大雞排",
    district: "스린 야시장",
    mrt: "MRT 젠탄역 1번 출구 도보 5분 스린 야시장 중심부",
    cuisine: "야시장 명물",
    rating: 4.0,
    address: "No. 113, Wenlin Rd, Shilin District, Taipei City, 대만 111",
    lat: 25.088192,
    lng: 121.524391,
    menu: "원조 대왕 닭튀김 지파이(大雞排 오리지널 / 매운맛)",
    how_to_eat: "얼굴 크기보다 큰 바삭한 닭가슴살 튀김에 매콤한 고춧가루를 팍팍 뿌려 맥주와 함께 길거리에서 뜯어먹음.",
    youtube_source: "흥삶이네 (33만뷰), 채코제 (66만뷰)",
    creator_tip: "대만 지파이의 원조 브랜드. 갓 튀겨낸 바삭함과 육즙이 최고."
  },

  // 훠궈
  {
    name_ko: "마라시안 훠궈 시먼점",
    name_zh: "馬辣頂級麻辣鴛鴦火鍋 漢口店",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 5분",
    cuisine: "훠궈",
    rating: 4.2,
    address: "2F, No. 30, Xining S Rd, Wanhua District, Taipei City, 대만 108",
    lat: 25.044182,
    lng: 121.506182,
    menu: "원앙 훠궈(마라 홍탕 + 야채 백탕) 무한리필 / 와규 / 하겐다즈 아이스크림 16종",
    how_to_eat: "마라 육수에는 차돌박이와 선지, 배추와 해산물은 담백한 백탕에 넣어 즐기고 하겐다즈로 무한 디저트.",
    youtube_source: "우니의끼니 (13만뷰), 탸퍄 (47만뷰)",
    creator_tip: "한국인에게 가장 유명한 무한리필 훠궈. 생맥주, 해산물, 아이스크림까지 완벽 무제한."
  },
  {
    name_ko: "스얼궈 시먼점 (12Hotpot)",
    name_zh: "石二鍋 台北桂林家樂福店",
    district: "시먼딩 / 까르푸 구이린점",
    mrt: "MRT 시먼역 1번 출구 도보 7분 까르푸 4층",
    cuisine: "훠궈",
    rating: 4.3,
    address: "4F, No. 1, Guilin Rd, Wanhua District, Taipei City, 대만 108",
    lat: 25.037192,
    lng: 121.501382,
    menu: "1인 훠궈 세트(개인 냄비) / 레몬동과 슬러시 무한리필",
    how_to_eat: "혼자서도 부담 없이 고기와 야채를 원하는 육수에 끓여 먹고 상큼한 레몬동과차로 입가심.",
    youtube_source: "현주zip (12만뷰 '혼자 여행 훠궈 맛집'), 수코 (19만뷰)",
    creator_tip: "대만 요식업 대기업 왕품그룹의 1인 훠궈 브랜드. 단돈 200NTD 대(1만원 이하)로 엄청난 가성비."
  },

  // 디저트 & 빙수 & 음료
  {
    name_ko: "스무시하우스 본점",
    name_zh: "思慕昔 本館",
    district: "동먼 / 융캉제",
    mrt: "MRT 동먼역 5번 출구 도보 3분",
    cuisine: "디저트 / 망고빙수",
    rating: 4.0,
    address: "No. 15, Yongkang St, Da'an District, Taipei City, 대만 106",
    lat: 25.032692,
    lng: 121.529841,
    menu: "슈퍼 망고 눈꽃빙수(超級雪酪芒果雪花冰) / 푸딩 망고빙수",
    how_to_eat: "달콤한 우유 얼음 위에 망고 과육과 셔벗 아이스크림을 함께 떠서 부드럽게 녹여 먹음.",
    youtube_source: "흥삶이네 (26만뷰), 수코 (30만뷰), 써니하니 (22만뷰)",
    creator_tip: "CNN이 보도한 타이베이 대표 망고빙수. 사계절 내내 망고빙수를 맛볼 수 있는 노란색 건물."
  },
  {
    name_ko: "빙찬 (빙잔)",
    name_zh: "冰讚",
    district: "중산 / 쌍련역",
    mrt: "MRT 솽롄역 2번 출구 도보 3분",
    cuisine: "디저트 / 망고빙수",
    rating: 4.5,
    address: "No. 2, Shuanglian St, Datong District, Taipei City, 대만 103",
    lat: 25.058392,
    lng: 121.520982,
    menu: "생망고 눈꽃빙수(芒果雪花冰) / 푸딩 추가",
    how_to_eat: "입안에서 사르르 녹는 눈꽃 얼음에 신선한 생애플망고와 연유의 조화를 즐김.",
    youtube_source: "수코 (30만뷰 '최고의 망빙을 찾아서'), 고요비 (25만뷰), 현주zip (13만뷰)",
    creator_tip: "4월 중순부터 10월까지만 한시적으로 영업하는 '생망고 전문점'. 냉동을 쓰지 않아 현지인/여행자 모두 최고로 평가."
  },
  {
    name_ko: "행복당 본점 (싱푸탕)",
    name_zh: "幸福堂 旗艦店",
    district: "시먼딩 / 만화구",
    mrt: "MRT 시먼역 6번 출구 도보 3분",
    cuisine: "디저트 / 버블티",
    rating: 4.4,
    address: "No. 29, Chengdu Rd, Wanhua District, Taipei City, 대만 108",
    lat: 25.042892,
    lng: 121.507382,
    menu: "원조 흑당 버블 밀크티(黑糖珍珠鮮奶) / 토치 크림 흑당버블티",
    how_to_eat: "가마솥에서 즉석으로 졸여낸 따뜻하고 쫄깃한 타피오카 펄을 차가운 우유와 함께 18번 저어서 마심.",
    youtube_source: "해피뉴먼쓰 (36만뷰), 우니의끼니 (13만뷰), 써니하니 (22만뷰)",
    creator_tip: "시먼딩 중심부 화려한 금빛 매장. 토치로 흑당을 캐러멜라이징해 주는 퍼포먼스도 볼거리."
  },
  {
    name_ko: "춘수당 중산점",
    name_zh: "春水堂 南西店",
    district: "중산 / 신광미츠코시",
    mrt: "MRT 중산역 2번 출구 신광미츠코시백화점 본관 B2",
    cuisine: "디저트 / 버블티 & 식사",
    rating: 4.2,
    address: "B2, No. 12, Nanjing W Rd, Zhongshan District, Taipei City, 대만 104",
    lat: 25.052691,
    lng: 121.520482,
    menu: "원조 진주 밀크티(珍珠奶茶) / 공부면(功夫麵) / 우육면",
    how_to_eat: "자잘하고 쫀득한 원조 타피오카 펄과 차 향이 짙은 밀크티를 마시며 대만식 자장면(공부면) 식사 병행.",
    youtube_source: "우니의끼니 (13만뷰), tzuyang쯔양 (298만뷰)",
    creator_tip: "1983년 대만 최초로 버블티를 발명한 역사적 브랜드. 식사 메뉴도 매우 훌륭함."
  },
  {
    name_ko: "라뜰리에 루터스",
    name_zh: "L'Atelier Lotus",
    district: "동먼 / 융캉제",
    mrt: "MRT 동먼역 5번 출구 도보 7분 (진화공원 인근)",
    cuisine: "디저트 / 기념품",
    rating: 4.6,
    address: "No. 10, Lane 143, Jinhua St, Da'an District, Taipei City, 대만 106",
    lat: 25.031582,
    lng: 121.530182,
    menu: "수제 대파 누가크래커(牛軋餅)",
    how_to_eat: "갓 만든 부드러운 연유 누가가 파향 가득한 바삭한 야채 크래커 사이에 듬뿍 샌드되어 커피/차와 곁들임.",
    youtube_source: "고요비 (25만뷰), 현주zip (13만뷰), 타이거투어 (50만뷰)",
    creator_tip: "타이베이에서 가장 인기 있는 파 누가크래커. 아침 9시 오픈이지만 8시 이전 줄 서는 오픈런 필수."
  }
];

console.log(`Curated master restaurants: ${RESTAURANTS.length}`);

// 1. Generate CSV for Google My Maps
function generateCSV() {
  const headers = [
    "Name",
    "Original_Name",
    "District",
    "MRT_Access",
    "Cuisine_Category",
    "Google_Rating",
    "Address",
    "Latitude",
    "Longitude",
    "Featured_Menus",
    "How_To_Eat_Tip",
    "YouTube_Source",
    "Creator_Tip",
    "Google_Maps_URL"
  ];

  const rows = [headers.join(",")];

  for (const r of RESTAURANTS) {
    const mapUrl = `https://www.google.com/maps?q=${r.lat},${r.lng}`;
    const row = [
      `"${r.name_ko}"`,
      `"${r.name_zh}"`,
      `"${r.district}"`,
      `"${r.mrt}"`,
      `"${r.cuisine}"`,
      r.rating,
      `"${r.address}"`,
      r.lat,
      r.lng,
      `"${r.menu}"`,
      `"${r.how_to_eat}"`,
      `"${r.youtube_source}"`,
      `"${r.creator_tip}"`,
      `"${mapUrl}"`
    ];
    rows.push(row.join(","));
  }

  const csvContent = rows.join("\n");
  const csvPath = 'c:\\cowork\\taiwan\\food\\taipei_youtube_restaurants_for_google_maps.csv';
  fs.writeFileSync(csvPath, "\uFEFF" + csvContent, 'utf8'); // Add UTF-8 BOM for Excel / Google My Maps Korean support
  console.log(`Generated CSV: ${csvPath}`);
}

// 2. Generate KML for Google My Maps / Earth
function generateKML() {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>타이베이 유튜브 인기 맛집 50선 지도 (Google My Maps)</name>
    <description>조회수 10만회 이상, 2024~2026 최신 유튜브 미식/여행 영상에 소개된 타이베이 대표 맛집 모음</description>
`;

  // Define Category styles
  const categories = Array.from(new Set(RESTAURANTS.map(r => r.cuisine)));
  const colors = {
    "우육면": "ff0000ff", // Red
    "루로우판": "ff0080ff", // Orange
    "만두 / 샤오롱바오": "ff00d7ff", // Yellow
    "전통 조식 / 또우장": "ff00ff00", // Green
    "러차오 (대만식 선술집)": "ffff0000", // Blue
    "사천 퓨전 요리": "ffff0080",
    "고기 요리 / 거위고기": "ff800080", // Purple
    "일식 / 대왕 연어초밥": "ffff8000",
    "미슐랭 3스타 파인다이닝": "ff000080",
    "로컬 길거리 간식": "ff808000",
    "야시장 명물": "ff004080",
    "훠궈": "ff0000b0",
    "디저트 / 망고빙수": "ff80ffff",
    "디저트 / 버블티": "ff80c0ff",
    "디저트 / 버블티 & 식사": "ff80c0ff",
    "디저트 / 기념품": "ffc080ff"
  };

  for (const [cat, col] of Object.entries(colors)) {
    kml += `    <Style id="style_${encodeURIComponent(cat)}">
      <IconStyle>
        <color>${col}</color>
        <scale>1.1</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/wht-blank.png</href>
        </Icon>
      </IconStyle>
    </Style>\n`;
  }

  for (const r of RESTAURANTS) {
    const mapUrl = `https://www.google.com/maps?q=${r.lat},${r.lng}`;
    const descHtml = `<![CDATA[
      <h3>${r.name_ko} (${r.name_zh})</h3>
      <p><b>분류:</b> ${r.cuisine} | <b>평점:</b> ⭐ ${r.rating}</p>
      <p><b>구역:</b> ${r.district} (${r.mrt})</p>
      <p><b>주소:</b> ${r.address}</p>
      <hr/>
      <p><b>대표 메뉴:</b> ${r.menu}</p>
      <p><b>맛있게 먹는 법:</b> ${r.how_to_eat}</p>
      <p><b>유튜브 출처:</b> 🎥 ${r.youtube_source}</p>
      <p><b>크리에이터 팁:</b> ${r.creator_tip}</p>
      <p><a href="${mapUrl}" target="_blank">👉 구글 지도에서 위치 보기</a></p>
    ]]>`;

    const styleId = colors[r.cuisine] ? `style_${encodeURIComponent(r.cuisine)}` : 'style_우육면';

    kml += `    <Placemark>
      <name>${r.name_ko} (${r.name_zh})</name>
      <description>${descHtml}</description>
      <styleUrl>#${styleId}</styleUrl>
      <Point>
        <coordinates>${r.lng},${r.lat},0</coordinates>
      </Point>
    </Placemark>\n`;
  }

  kml += `  </Document>
</kml>`;

  const kmlPath = 'c:\\cowork\\taiwan\\food\\taipei_youtube_restaurants_for_google_maps.kml';
  fs.writeFileSync(kmlPath, kml, 'utf8');
  console.log(`Generated KML: ${kmlPath}`);
}

generateCSV();
generateKML();

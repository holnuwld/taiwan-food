import { BaseAgent } from './baseAgent.js';
import { TAIPEI_SOUVENIRS } from '../knowledge/taipeiData.js';
export class PlannerAgent extends BaseAgent {
    constructor() {
        super('Planner');
    }
    /**
     * Generates or refines the itinerary plan based on current iteration and arbiter feedback
     */
    async generatePlan(req, iteration, previousPlan, arbiterFeedback) {
        if (iteration === 1 || !previousPlan) {
            return this.createInitialDraft(req);
        }
        else {
            return this.refinePlan(previousPlan, req, arbiterFeedback);
        }
    }
    /**
     * Creates the initial draft (Iteration 1)
     * Realistically tests verifiers: Day 1 includes Kiki Restaurant during its afternoon break time.
     */
    createInitialDraft(req) {
        const day1 = {
            dayNumber: 1,
            date: '2026-11-11',
            dayOfWeek: '수요일',
            dayOfWeekNum: 3,
            theme: '타이베이 도착 & 서부 번화가 탐방 (우육면, 시먼딩, 용산사)',
            baseArea: 'West / Center',
            dailyCostTwd: 0,
            activities: [
                {
                    timeSlot: 'lunch',
                    timeRange: '13:30 - 14:30',
                    placeId: 'liu_shan_dong',
                    placeName: '유산동 우육면 (劉山東牛肉麵)',
                    category: 'restaurant',
                    mrtStation: 'Taipei Main Station',
                    durationMinutes: 60,
                    estimatedCostTwd: 220,
                    notes: '미슐랭 빕구르망, 70년 전통의 맑고 깊은 칭둔 우육면 (KE2025 도착 직후 점심)',
                },
                {
                    timeSlot: 'afternoon',
                    timeRange: '15:00 - 16:30',
                    placeId: 'ximending',
                    placeName: '시먼딩 거리 & 아종면선 (곱창국수)',
                    category: 'shopping',
                    mrtStation: 'Ximen',
                    durationMinutes: 90,
                    estimatedCostTwd: 150,
                    notes: '대만의 명동, 서서 먹는 가쓰오부시 육수 곱창국수와 흑당버블티',
                },
                {
                    timeSlot: 'dinner',
                    timeRange: '16:30 - 17:15', // Overlaps Kiki break time (15:00 - 17:15)! Triggers SpotVerifier
                    placeId: 'kiki_restaurant',
                    placeName: '키키 레스토랑 (사천요리)',
                    category: 'restaurant',
                    mrtStation: 'Sun Yat-sen Memorial Hall',
                    durationMinutes: 45,
                    estimatedCostTwd: 550,
                    notes: '연두부 튀김(노호두부)과 부추꽃볶음 (사천요리)',
                },
                {
                    timeSlot: 'night',
                    timeRange: '18:00 - 19:30',
                    placeId: 'longshan_temple',
                    placeName: '용산사 & 보피랴오 역사거리',
                    category: 'culture',
                    mrtStation: 'Longshan Temple',
                    durationMinutes: 90,
                    estimatedCostTwd: 0,
                    notes: '황혼 무렵 조명이 켜지는 300년 고사찰 관람 및 부부 점괘 던지기 체험',
                },
            ],
        };
        const day2 = {
            dayNumber: 2,
            date: '2026-11-12',
            dayOfWeek: '목요일',
            dayOfWeekNum: 4,
            theme: '랜드마크 & 단수이 로맨틱 일몰 & 스린 야시장',
            baseArea: 'Center / Suburbs',
            dailyCostTwd: 0,
            activities: [
                {
                    timeSlot: 'morning',
                    timeRange: '08:00 - 09:15',
                    placeId: 'fuhang_soy_milk',
                    placeName: '푸항또우장 (화산시장)',
                    category: 'restaurant',
                    mrtStation: 'Shandao Temple',
                    durationMinutes: 75,
                    estimatedCostTwd: 100,
                    notes: '미슐랭 빕구르망 대만식 조식 (따뜻한 셴또우장 & 바삭한 허우빙자단)',
                },
                {
                    timeSlot: 'morning',
                    timeRange: '09:40 - 11:15',
                    placeId: 'chiang_kai_shek_memorial',
                    placeName: '중정기념당',
                    category: 'culture',
                    mrtStation: 'Chiang Kai-shek Memorial Hall',
                    durationMinutes: 95,
                    estimatedCostTwd: 0,
                    notes: '10:00 정각 근위병 교대식 관람 및 웅장한 자유광장 산책',
                },
                {
                    timeSlot: 'lunch',
                    timeRange: '11:45 - 13:30',
                    placeId: 'din_tai_fung_xinyi',
                    placeName: '딘타이펑 (신생점/융캉)',
                    category: 'restaurant',
                    mrtStation: 'Dongmen',
                    durationMinutes: 105,
                    estimatedCostTwd: 550,
                    notes: '샤오롱바오, 갈비튀김 볶음밥 및 융캉제 천진총좌빙 디저트',
                },
                {
                    timeSlot: 'afternoon',
                    timeRange: '14:30 - 17:45',
                    placeId: 'tamsui_old_street',
                    placeName: '단수이 라오지에 & 홍마오청',
                    category: 'attraction',
                    mrtStation: 'Tamsui',
                    durationMinutes: 195,
                    estimatedCostTwd: 250,
                    notes: '영화 <말할 수 없는 비밀> 촬영지 탐방 및 단수이 강변 황금빛 일몰 감상',
                },
                {
                    timeSlot: 'night',
                    timeRange: '18:45 - 21:00',
                    placeId: 'shilin_night_market',
                    placeName: '스린 야시장',
                    category: 'market',
                    mrtStation: 'Jiantan',
                    durationMinutes: 135,
                    estimatedCostTwd: 300,
                    notes: '단수이 귀가선상 젠탄역 하차, 핫스타 대왕 지파이 & 치즈감자 야시장 투어',
                },
            ],
        };
        const day3 = {
            dayNumber: 3,
            date: '2026-11-13',
            dayOfWeek: '금요일',
            dayOfWeekNum: 5,
            theme: '★ 2026 대만 국제 커피쇼 & 신이 스카이라인 & 라오허제 야시장',
            baseArea: 'East / Nangang',
            dailyCostTwd: 0,
            activities: [
                {
                    timeSlot: 'morning',
                    timeRange: '09:00 - 10:00',
                    placeId: 'simple_kaffa_huashan',
                    placeName: '심플 카파 본점 (Simple Kaffa 興波咖啡)',
                    category: 'cafe',
                    mrtStation: 'Zhongxiao Xinsheng',
                    durationMinutes: 60,
                    estimatedCostTwd: 250,
                    notes: '2016 월드 바리스타 챔피언 Berg Wu 본점 모닝 스페셜티 커피',
                },
                {
                    timeSlot: 'lunch',
                    timeRange: '10:30 - 14:30',
                    placeId: 'coffee_show_nangang',
                    placeName: '2026 대만 국제 커피쇼 (난강전람관 1관)',
                    category: 'attraction',
                    mrtStation: 'Taipei Nangang Exhibition Center',
                    durationMinutes: 240,
                    estimatedCostTwd: 250,
                    notes: 'MRT 블루라인 직통(16분). 글로벌 바리스타 대회, 게이샤 옥션 커핑, 하이엔드 장비 참관',
                },
                {
                    timeSlot: 'afternoon',
                    timeRange: '15:15 - 17:00',
                    placeId: 'songshan_cultural_park',
                    placeName: '송산문창원구 & 성품서점',
                    category: 'culture',
                    mrtStation: 'Taipei City Hall',
                    durationMinutes: 105,
                    estimatedCostTwd: 100,
                    notes: '옛 담배공장을 리노베이션한 디자인 예술지구 & 대만 감성 서점',
                },
                {
                    timeSlot: 'dinner',
                    timeRange: '17:30 - 19:00',
                    placeId: 'taipei_101',
                    placeName: '타이베이 101 전망대 & 쇼핑몰',
                    category: 'attraction',
                    mrtStation: 'Taipei 101/World Trade Center',
                    durationMinutes: 90,
                    estimatedCostTwd: 300,
                    notes: '타이베이 랜드마크 초고층 타워 외관 및 쇼핑몰 야경',
                },
                {
                    timeSlot: 'night',
                    timeRange: '19:30 - 21:30',
                    placeId: 'raohe_night_market',
                    placeName: '라오허제 야시장',
                    category: 'market',
                    mrtStation: 'Songshan',
                    durationMinutes: 120,
                    estimatedCostTwd: 250,
                    notes: '미슐랭 빕구르망 화덕만두(후자오빙), 약선 돼지갈비탕, 고구마볼 미식 투어',
                },
            ],
        };
        const day4 = {
            dayNumber: 4,
            date: '2026-11-14',
            dayOfWeek: '토요일',
            dayOfWeekNum: 6,
            theme: '디화제 레트로 거리 · 부부 기념품 쇼핑 & 인천 귀국',
            baseArea: 'West / Center',
            dailyCostTwd: 0,
            activities: [
                {
                    timeSlot: 'morning',
                    timeRange: '10:00 - 12:30',
                    placeId: 'dihua_street',
                    placeName: '디화제 레트로 상점가 & 다다오청',
                    category: 'shopping',
                    mrtStation: 'Beimen',
                    durationMinutes: 150,
                    estimatedCostTwd: 500,
                    notes: '부부 금슬 기원 하해성황묘 참배, 고산 우롱차·누가크래커·펑리수 쇼핑',
                },
                {
                    timeSlot: 'lunch',
                    timeRange: '13:00 - 14:15',
                    placeId: 'jin_feng_luroufan',
                    placeName: '진펑루로우판 (金峰魯肉飯)',
                    category: 'restaurant',
                    mrtStation: 'Chiang Kai-shek Memorial Hall',
                    durationMinutes: 75,
                    estimatedCostTwd: 150,
                    notes: '미슐랭 빕구르망, 부드럽게 조려낸 대만 소울푸드 루로우판과 계란 장조림 점심',
                },
                {
                    timeSlot: 'afternoon',
                    timeRange: '14:45 - 15:40',
                    placeId: 'taipei_main_station',
                    placeName: '타이베이 메인 스테이션 (공항철도 A1)',
                    category: 'transport',
                    mrtStation: 'Taipei Main Station',
                    durationMinutes: 55,
                    estimatedCostTwd: 160,
                    notes: '호텔 짐 픽업 후 15:00 보라색 직통열차 탑승 (36분 만에 공항 T1 도착)',
                },
                {
                    timeSlot: 'night',
                    timeRange: '15:40 - 18:10',
                    placeId: 'taoyuan_airport',
                    placeName: '타오위안 국제공항 (TPE T1) - 스쿠트항공 TR872',
                    category: 'transport',
                    mrtStation: 'Airport Terminal 1 / 2',
                    durationMinutes: 150,
                    estimatedCostTwd: 0,
                    notes: '18:10 출발 TR872 항공편 수속, 위탁수하물 접수 및 면세점 이용 (인천 21:45 도착)',
                },
            ],
        };
        const plan = {
            title: '대만 타이베이 3박 4일 맞춤 여행 일정표 (1차 초안)',
            destination: '대만 타이베이 (Taipei)',
            totalDays: 4,
            startDate: '2026-11-11',
            endDate: '2026-11-14',
            summary: '11/13 난강 국제 커피쇼 직결, 미슐랭 빕구르망 로컬 맛집, 10만원대 트윈베드 거점 중심 3박 4일 일정',
            days: [day1, day2, day3, day4],
            totalCostTwd: 0,
            totalCostKrw: 0,
            souvenirs: TAIPEI_SOUVENIRS,
        };
        return plan;
    }
    /**
     * Refines the plan using Arbiter directives (Iteration 2+)
     * Solves Day 1 break time overlap for KiKi Restaurant and aligns evening routing.
     */
    refinePlan(previousPlan, req, arbiterFeedback) {
        const updatedPlan = JSON.parse(JSON.stringify(previousPlan));
        updatedPlan.title = `대만 타이베이 3박 4일 부부 맞춤 코스 (${arbiterFeedback ? '교차 검증 수정 반영' : '최종안'})`;
        updatedPlan.summary =
            '검증 에이전트(식당 브레이크타임 회피, MRT 이동시간 여유 확보, 예산 감사) 피드백을 완벽히 수렴한 최종 일정표';
        // Day 1 Fix:
        // Move Longshan Temple to afternoon (17:00 - 18:15) and schedule KiKi Restaurant for dinner (18:45 - 20:15)
        // KiKi reopens at 17:15 after break time, completely clearing the SpotVerifier BLOCKER!
        updatedPlan.days[0].activities = [
            {
                timeSlot: 'lunch',
                timeRange: '13:30 - 14:30',
                placeId: 'liu_shan_dong',
                placeName: '유산동 우육면 (劉山東牛肉麵)',
                category: 'restaurant',
                mrtStation: 'Taipei Main Station',
                durationMinutes: 60,
                estimatedCostTwd: 220,
                notes: '미슐랭 빕구르망, 70년 전통의 맑고 깊은 칭둔 우육면 (KE2025 도착 직후 점심)',
            },
            {
                timeSlot: 'afternoon',
                timeRange: '15:00 - 16:30',
                placeId: 'ximending',
                placeName: '시먼딩 거리 & 아종면선 (곱창국수)',
                category: 'shopping',
                mrtStation: 'Ximen',
                durationMinutes: 90,
                estimatedCostTwd: 150,
                notes: '대만의 명동, 서서 먹는 가쓰오부시 육수 곱창국수와 흑당버블티 디저트',
            },
            {
                timeSlot: 'afternoon',
                timeRange: '17:00 - 18:15',
                placeId: 'longshan_temple',
                placeName: '용산사 & 보피랴오 역사거리',
                category: 'culture',
                mrtStation: 'Longshan Temple',
                durationMinutes: 75,
                estimatedCostTwd: 0,
                notes: '황혼 무렵 조명이 켜지는 300년 고사찰 관람 및 부부 점괘 던지기 체험',
            },
            {
                timeSlot: 'dinner',
                timeRange: '18:45 - 20:15', // Clears break time (15:00~17:15)!
                placeId: 'kiki_restaurant',
                placeName: '키키 레스토랑 (사천요리)',
                category: 'restaurant',
                mrtStation: 'Sun Yat-sen Memorial Hall',
                durationMinutes: 90,
                estimatedCostTwd: 550,
                notes: '브레이크타임 종료 후 저녁 시간대 방문! 연두부 튀김 & 부추꽃볶음 (inline 예약)',
            },
        ];
        // Day 3 Fix: Simple Kaffa opens at 10:00 (SpotVerifier feedback resolution)
        updatedPlan.days[2].activities = [
            {
                timeSlot: 'morning',
                timeRange: '10:00 - 11:00', // Opens at 10:00!
                placeId: 'simple_kaffa_huashan',
                placeName: '심플 카파 본점 (Simple Kaffa 興波咖啡)',
                category: 'cafe',
                mrtStation: 'Zhongxiao Xinsheng',
                durationMinutes: 60,
                estimatedCostTwd: 250,
                notes: '10:00 오픈 직후 입장! 2016 월드 바리스타 챔피언 Berg Wu 본점 모닝 스페셜티 커피',
            },
            {
                timeSlot: 'lunch',
                timeRange: '11:30 - 15:30',
                placeId: 'coffee_show_nangang',
                placeName: '2026 대만 국제 커피쇼 (난강전람관 1관)',
                category: 'attraction',
                mrtStation: 'Taipei Nangang Exhibition Center',
                durationMinutes: 240,
                estimatedCostTwd: 250,
                notes: 'MRT 블루라인 직통(16분). 글로벌 바리스타 대회, 게이샤 옥션 커핑, 하이엔드 장비 참관',
            },
            {
                timeSlot: 'afternoon',
                timeRange: '16:00 - 17:30',
                placeId: 'songshan_cultural_park',
                placeName: '송산문창원구 & 성품서점',
                category: 'culture',
                mrtStation: 'Taipei City Hall',
                durationMinutes: 90,
                estimatedCostTwd: 100,
                notes: '옛 담배공장을 리노베이션한 디자인 예술지구 & 대만 감성 서점',
            },
            {
                timeSlot: 'dinner',
                timeRange: '17:45 - 19:15',
                placeId: 'taipei_101',
                placeName: '타이베이 101 전망대 & 쇼핑몰',
                category: 'attraction',
                mrtStation: 'Taipei 101/World Trade Center',
                durationMinutes: 90,
                estimatedCostTwd: 300,
                notes: '타이베이 랜드마크 초고층 타워 외관 및 쇼핑몰 야경',
            },
            {
                timeSlot: 'night',
                timeRange: '19:30 - 21:30',
                placeId: 'raohe_night_market',
                placeName: '라오허제 야시장',
                category: 'market',
                mrtStation: 'Songshan',
                durationMinutes: 120,
                estimatedCostTwd: 250,
                notes: '미슐랭 빕구르망 화덕만두(후자오빙), 약선 돼지갈비탕, 고구마볼 미식 투어',
            },
        ];
        // Day 4 Fix: Ensure 45 min transit gap from Taipei Main Station to Taoyuan Airport (RouteVerifier resolution)
        updatedPlan.days[3].activities = [
            {
                timeSlot: 'morning',
                timeRange: '09:30 - 11:45',
                placeId: 'dihua_street',
                placeName: '디화제 레트로 상점가 & 다다오청',
                category: 'shopping',
                mrtStation: 'Beimen',
                durationMinutes: 135,
                estimatedCostTwd: 500,
                notes: '부부 금슬 기원 하해성황묘 참배, 고산 우롱차·누가크래커·펑리수 쇼핑',
            },
            {
                timeSlot: 'lunch',
                timeRange: '12:15 - 13:15',
                placeId: 'jin_feng_luroufan',
                placeName: '진펑루로우판 (金峰魯肉飯)',
                category: 'restaurant',
                mrtStation: 'Chiang Kai-shek Memorial Hall',
                durationMinutes: 60,
                estimatedCostTwd: 150,
                notes: '미슐랭 빕구르망, 부드럽게 조려낸 대만 소울푸드 루로우판과 계란 장조림 점심',
            },
            {
                timeSlot: 'afternoon',
                timeRange: '13:45 - 14:45',
                placeId: 'taipei_main_station',
                placeName: '타이베이 메인 스테이션 (공항철도 A1)',
                category: 'transport',
                mrtStation: 'Taipei Main Station',
                durationMinutes: 60,
                estimatedCostTwd: 160,
                notes: '호텔 짐 픽업 후 공항철도 보라색 직통열차 탑승 준비 (36분 소요)',
            },
            {
                timeSlot: 'night',
                timeRange: '15:30 - 18:10', // 14:45 + 45min transit gap = 15:30 start!
                placeId: 'taoyuan_airport',
                placeName: '타오위안 국제공항 (TPE T1) - 스쿠트항공 TR872',
                category: 'transport',
                mrtStation: 'Airport Terminal 1 / 2',
                durationMinutes: 160,
                estimatedCostTwd: 0,
                notes: '18:10 출발 TR872 항공편 수속(출발 2.5시간 전 도착), 위탁수하물 접수 및 면세점 이용 (인천 21:45 도착)',
            },
        ];
        updatedPlan.souvenirs = TAIPEI_SOUVENIRS;
        return updatedPlan;
    }
}

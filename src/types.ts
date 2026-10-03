export type TimeSlot = 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'night';

export type PlaceCategory =
  | 'attraction'
  | 'restaurant'
  | 'cafe'
  | 'market'
  | 'shopping'
  | 'nature'
  | 'culture'
  | 'transport';

export type IssueSeverity = 'BLOCKER' | 'WARNING' | 'SUGGESTION';

export type AgentName =
  | 'Planner'
  | 'RouteVerifier'
  | 'SpotVerifier'
  | 'BudgetVerifier'
  | 'Arbiter'
  | 'ReviewHarvester'
  | 'HotelRetailCurator'
  | 'PhotoVerifier'
  | 'FrontendBuilder'
  | 'ArtifactVerifier';

export interface PhotoAuditItem {
  id: string;
  name: string;
  title: string;
  category: 'dish' | 'souvenir' | 'hotel' | 'spot';
  targetFilename: string;
  localPath: string;
  originalUrl: string;
  evidenceScreenshot: string;
  fileSize: number;
  magicHeaderValid: boolean;
  isAiGenerated: false;
  status: 'PASS' | 'FAIL';
  attempts: number;
}

export interface PhotoAuditSummary {
  totalPhotos: number;
  passedCount: number;
  failedCount: number;
  allRealPhotos: boolean;
  zeroAiGenerated: boolean;
  items: PhotoAuditItem[];
}

export interface CostBreakdown {
  transitCostTwd: number;  // 교통비 (MRT, 공항철도, 페리, 버스 등)
  foodCostTwd: number;     // 식비 (식당, 간식, 야시장, 카페)
  ticketCostTwd: number;   // 입장료 (박물관, 전망대 등)
  shoppingCostTwd: number; // 쇼핑 및 기타 (소품, 기념품)
}

export interface AgentRoleDefinition {
  name: AgentName;
  className: string;
  roleTitle: string;
  skills?: string[];
  coreResponsibilities: string[];
  validationCriteria: string[];
  outputDescription: string;
}

export interface CrawledReview {
  author: string;
  badge?: string;
  starNum: number;
  starsLabel?: string;
  time: string;
  text: string;
  isNegative?: boolean;
}

export interface CrawledPlaceReport {
  placeName: string;
  placeZh: string;
  category: 'restaurant' | 'hotel' | 'attraction';
  evidenceFile?: string;
  reviews: CrawledReview[];
  photos: string[];
}

export interface Place {
  id: string;
  name: string;
  nameZh: string;
  category: PlaceCategory;
  area: 'West' | 'East' | 'North' | 'Center' | 'South' | 'Suburbs';
  mrtStation: string;
  mrtLine: string; // e.g. 'Red', 'Blue', 'Green', 'Orange', 'Brown'
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
  breakTimeStart?: string; // "15:00"
  breakTimeEnd?: string; // "17:00"
  closedDays: number[]; // 0=Sunday, 1=Monday, 2=Tuesday, etc.
  requiresReservation: boolean;
  approxCostTwd: number;
  recommendedDurationMin: number;
  description: string;
  notes?: string;
}

export interface Activity {
  timeSlot: TimeSlot;
  timeRange: string; // e.g. "09:30 - 11:30"
  placeId?: string;
  placeName: string;
  placeNameZh?: string;
  category: PlaceCategory;
  mrtStation: string;
  durationMinutes: number;
  estimatedCostTwd: number;
  notes: string;
  transitToNext?: {
    destination: string;
    transitType: 'MRT' | 'Walk' | 'Bus' | 'Taxi';
    estimatedMin: number;
    costTwd: number;
    transitRoute: string;
  };
}

export interface DayItinerary {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // e.g. 'Monday', 'Tuesday'
  dayOfWeekNum: number; // 0=Sun, 1=Mon, ..., 6=Sat
  theme: string;
  themeTags?: string[]; // e.g. ['미식', '역사/문화']
  baseArea: string;
  activities: Activity[];
  dailyCostTwd: number;
  costBreakdown?: CostBreakdown;
}

export interface SouvenirItem {
  category: 'must_buy' | 'parents' | 'colleagues';
  categoryLabel: string;
  name: string;
  nameZh?: string;
  targetRecipient: string;
  priceKrw: string;
  priceTwd: string;
  purchaseLocation: string;
  description: string;
  tips: string;
}

export interface ItineraryPlan {
  title: string;
  destination: string;
  totalDays: number;
  startDate: string;
  endDate: string;
  summary: string;
  days: DayItinerary[];
  totalCostTwd: number;
  totalCostKrw: number;
  costBreakdown?: CostBreakdown;
  souvenirs?: SouvenirItem[];
}

export interface ValidationIssue {
  sourceAgent: AgentName;
  severity: IssueSeverity;
  dayNumber: number;
  timeSlot?: TimeSlot;
  placeName: string;
  issue: string;
  evidence: string;
  suggestedFix: string;
}

export interface AgentReport {
  agent: AgentName;
  roleTitle?: string;
  passed: boolean;
  blockersCount: number;
  warningsCount: number;
  issues: ValidationIssue[];
  summary: string;
  metrics?: Record<string, any>;
}

export interface ArbiterSynthesis {
  iteration: number;
  overallPassed: boolean;
  blockersCount: number;
  warningsCount: number;
  verdict: 'APPROVED' | 'REVISE_REQUIRED' | 'MAX_ITERATIONS_REACHED';
  keyIssues: ValidationIssue[];
  revisionDirectives: string[];
}

export interface UserTravelRequirements {
  destination: string;
  city: string;
  durationDays: number;
  startDate: string; // e.g. "2026-10-15" (Thursday)
  partySize: number;
  budgetPerPersonTwd: number; // in TWD
  budgetPerPersonKrw: number; // in KRW
  travelPace: 'relaxed' | 'moderate' | 'packed';
  preferredThemes: string[];
  mustVisitSpots: string[];
  flightArrival?: {
    airport: string; // TPE (Taoyuan) or TSA (Songshan)
    time: string; // e.g. "11:30"
  };
  flightDeparture?: {
    airport: string;
    time: string; // e.g. "17:00"
  };
}

export interface MultiAgentState {
  requirements: UserTravelRequirements;
  currentIteration: number;
  maxIterations: number;
  history: Array<{
    iteration: number;
    plan: ItineraryPlan;
    reports: AgentReport[];
    arbiterSynthesis: ArbiterSynthesis;
  }>;
  currentPlan?: ItineraryPlan;
  currentReports: AgentReport[];
  arbiterSynthesis?: ArbiterSynthesis;
  isComplete: boolean;
}

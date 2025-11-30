// MyPage 관련 타입 정의

export interface GrassData {
  recordDate: string;
  attendance: boolean;
  videoWatch: boolean;
  measurement: boolean;
}

export interface Recipe {
  id: number;
  recipeTitle: string;
  recipeIntro: string;
  difficulty: string;
  durationMin: number;
  fitnessGrade: string;
  exerciseCount: number;
}

export interface MeasurementHistory {
  fitnessGrade: string;
  fitnessScore: number;
  measuredAt: string;
}

export interface MyPageData {
  profile: {
    userId: number;
    name: string;
    email: string;
    fitnessGrade: string | null;
    fitnessScore: number | null;
  };
  ranking: {
    totalUsers: number;
    userRank: number;
    topPercent: number;
  };
  streak: {
    currentStreak: number;
  };
  badgeInfo: string;
  weeklyVideoWatch: number;
  grass: GrassData[];
  recipes: Recipe[];
  measurementHistory: MeasurementHistory[];
}

// 배지 정의
export interface BadgeItem {
  id: string;
  icon: string;
  name: string;
  earned?: boolean;
}

export const BADGE_LIST: BadgeItem[] = [
  { id: '1', icon: '🔥', name: '7일 연속' },
  { id: '2', icon: '⭐', name: '1등급 달성' },
  { id: '3', icon: '🏆', name: '전체 상위 2%' },
  { id: '4', icon: '💪', name: '30일 완주' },
  { id: '5', icon: '🎯', name: '체력측정 3회' },
  { id: '6', icon: '👑', name: '프리미엄' },
];

// 잔디 상세 정보 타입
export interface GrassDetail {
  date: string;
  attendance: boolean;
  videoWatch: boolean;
  measurement: boolean;
  intensity: number;
}

// 캘린더 일 데이터 타입
export interface CalendarDay {
  intensity: number;
  date: string;
  attendance: boolean;
  videoWatch: boolean;
  measurement: boolean;
  isCurrentYear: boolean;
}

// 월별 캘린더 일 데이터 타입
export interface MonthlyCalendarDay extends CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  dayOfWeek: number;
}

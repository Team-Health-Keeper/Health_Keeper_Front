'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Award,
  BookOpen,
  TrendingUp,
  Trophy,
  Clock,
  Dumbbell,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SiteHeader } from '@/components/site-header';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 배지 정의 (서버의 badge_info에 맞춤)
const BADGE_LIST = [
  { id: '1', icon: '🔥', name: '7일 연속' },
  { id: '2', icon: '⭐', name: '1등급 달성' },
  { id: '3', icon: '🏆', name: '전체 상위 2%' },
  { id: '4', icon: '💪', name: '30일 완주' },
  { id: '5', icon: '🎯', name: '체력측정 3회' },
  { id: '6', icon: '👑', name: '프리미엄' },
];

// 타입 정의
interface GrassData {
  recordDate: string;
  attendance: boolean;
  videoWatch: boolean;
  measurement: boolean;
}

interface Recipe {
  id: number;
  recipeTitle: string;
  recipeIntro: string;
  difficulty: string;
  durationMin: number;
  fitnessGrade: string;
  exerciseCount: number;
}

interface MeasurementHistory {
  fitnessGrade: string;
  fitnessScore: number;
  measuredAt: string;
}

interface MyPageData {
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

export default function MyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myPageData, setMyPageData] = useState<MyPageData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  ); // 0-11

  // 세션 스토리지에서 유저 정보 가져오기
  const getUserFromSession = () => {
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch {
      // ignore
    }
    return null;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMyPageData();
  }, []);

  // API 호출
  const fetchMyPageData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = sessionStorage.getItem('authToken');
      if (!token) {
        setError('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/mypage`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '데이터를 불러오는데 실패했습니다.');
      }

      if (result.success) {
        setMyPageData(result.data);
      } else {
        throw new Error(result.message || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 잔디 데이터를 캘린더 형식으로 변환 (선택된 연도 기준 1월~12월)
  const calendarData = useMemo(() => {
    const weeks: Array<
      Array<{
        intensity: number;
        date: string;
        attendance: boolean;
        videoWatch: boolean;
        measurement: boolean;
        isCurrentYear: boolean;
      }>
    > = [];

    // 선택된 연도의 1월 1일부터 12월 31일까지
    const start = new Date(selectedYear, 0, 1); // 1월 1일
    const end = new Date(selectedYear, 11, 31); // 12월 31일

    // 1월 1일이 속한 주의 월요일 찾기
    const startDay = start.getDay() === 0 ? 7 : start.getDay();
    const startMonday = new Date(start);
    startMonday.setDate(start.getDate() - (startDay - 1));

    // grass 데이터를 Map으로 변환 (빠른 조회용)
    const grassMap = new Map<string, GrassData>();
    if (myPageData?.grass) {
      myPageData.grass.forEach((g) => {
        const dateStr = new Date(g.recordDate).toISOString().split('T')[0];
        grassMap.set(dateStr, g);
      });
    }

    // 12월 31일이 속한 주의 일요일까지 계산
    const endDay = end.getDay() === 0 ? 7 : end.getDay();
    const endSunday = new Date(end);
    endSunday.setDate(end.getDate() + (7 - endDay));

    // 주 단위로 계산
    const totalDays =
      Math.ceil(
        (endSunday.getTime() - startMonday.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    for (let w = 0; w < totalWeeks; w++) {
      const days: Array<{
        intensity: number;
        date: string;
        attendance: boolean;
        videoWatch: boolean;
        measurement: boolean;
        isCurrentYear: boolean;
      }> = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startMonday);
        date.setDate(startMonday.getDate() + w * 7 + d);
        const dateStr = date.toISOString().split('T')[0];

        const grassItem = grassMap.get(dateStr);
        const attendance = grassItem?.attendance ?? false;
        const videoWatch = grassItem?.videoWatch ?? false;
        const measurement = grassItem?.measurement ?? false;

        // intensity 계산: 활동 개수에 따라 0~3
        let intensity = 0;
        if (attendance) intensity++;
        if (videoWatch) intensity++;
        if (measurement) intensity++;

        // 선택된 연도에 해당하는 날짜인지 확인
        const isCurrentYear = date.getFullYear() === selectedYear;

        days.push({
          intensity,
          date: dateStr,
          attendance,
          videoWatch,
          measurement,
          isCurrentYear,
        });
      }
      weeks.push(days);
    }
    return weeks;
  }, [myPageData?.grass, selectedYear]);

  // 월 라벨 생성
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    const months = [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ];

    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = new Date(selectedYear, month, 1);
      const start = new Date(selectedYear, 0, 1);
      const startDay = start.getDay() === 0 ? 7 : start.getDay();
      const startMonday = new Date(start);
      startMonday.setDate(start.getDate() - (startDay - 1));

      const daysDiff = Math.floor(
        (firstDayOfMonth.getTime() - startMonday.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const weekIndex = Math.floor(daysDiff / 7);

      labels.push({ label: months[month], weekIndex });
    }
    return labels;
  }, [selectedYear]);

  // 모바일용 월별 캘린더 데이터 (선택된 월의 날짜만)
  const monthlyCalendarData = useMemo(() => {
    const days: Array<{
      intensity: number;
      date: string;
      day: number;
      attendance: boolean;
      videoWatch: boolean;
      measurement: boolean;
      isCurrentMonth: boolean;
      dayOfWeek: number;
    }> = [];

    // 선택된 월의 첫날과 마지막 날
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

    // 첫 주의 시작 (월요일 기준)
    const firstDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - (firstDayOfWeek - 1));

    // 마지막 주의 끝 (일요일)
    const lastDayOfWeek = lastDay.getDay() === 0 ? 7 : lastDay.getDay();
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (7 - lastDayOfWeek));

    // grass 데이터를 Map으로 변환
    const grassMap = new Map<string, GrassData>();
    if (myPageData?.grass) {
      myPageData.grass.forEach((g) => {
        const dateStr = new Date(g.recordDate).toISOString().split('T')[0];
        grassMap.set(dateStr, g);
      });
    }

    // 날짜 생성
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const grassItem = grassMap.get(dateStr);
      const attendance = grassItem?.attendance ?? false;
      const videoWatch = grassItem?.videoWatch ?? false;
      const measurement = grassItem?.measurement ?? false;

      let intensity = 0;
      if (attendance) intensity++;
      if (videoWatch) intensity++;
      if (measurement) intensity++;

      days.push({
        intensity,
        date: dateStr,
        day: current.getDate(),
        attendance,
        videoWatch,
        measurement,
        isCurrentMonth: current.getMonth() === selectedMonth,
        dayOfWeek: current.getDay() === 0 ? 7 : current.getDay(),
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [myPageData?.grass, selectedYear, selectedMonth]);

  // 월 이름 배열
  const monthNames = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  // 배지 earned 여부 계산
  const badges = useMemo(() => {
    const earnedIds = myPageData?.badgeInfo
      ? myPageData.badgeInfo.split(',').filter((id) => id.trim() !== '')
      : [];
    return BADGE_LIST.map((badge) => ({
      ...badge,
      earned: earnedIds.includes(badge.id),
    }));
  }, [myPageData?.badgeInfo]);

  // 잔디 통계 계산 (출석, 영상시청, 측정 횟수)
  const grassStats = useMemo(() => {
    if (!myPageData?.grass) {
      return { attendance: 0, videoWatch: 0, measurement: 0 };
    }
    return myPageData.grass.reduce(
      (acc, item) => {
        if (item.attendance) acc.attendance++;
        if (item.videoWatch) acc.videoWatch++;
        if (item.measurement) acc.measurement++;
        return acc;
      },
      { attendance: 0, videoWatch: 0, measurement: 0 }
    );
  }, [myPageData?.grass]);

  // 출석/영상시청 날짜 목록 계산
  const attendanceDates = useMemo(() => {
    if (!myPageData?.grass) return [];
    return myPageData.grass
      .filter((item) => item.attendance)
      .map((item) => item.recordDate)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [myPageData?.grass]);

  const videoWatchDates = useMemo(() => {
    if (!myPageData?.grass) return [];
    return myPageData.grass
      .filter((item) => item.videoWatch)
      .map((item) => item.recordDate)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [myPageData?.grass]);

  // 팝오버/모달 상태
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [showVideoWatchPopup, setShowVideoWatchPopup] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);

  // 잔디 상세 표시 상태
  const [activeDetail, setActiveDetail] = useState<null | {
    date: string;
    attendance: boolean;
    videoWatch: boolean;
    measurement: boolean;
    intensity: number;
  }>(null);
  const [pinnedDate, setPinnedDate] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayCellRef = useRef<HTMLDivElement | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // 현재 연도일 경우 오늘 날짜로 스크롤
    if (selectedYear === new Date().getFullYear()) {
      el.scrollLeft = el.scrollWidth;
      if (todayCellRef.current) {
        todayCellRef.current.scrollIntoView({
          behavior: 'auto',
          inline: 'end',
          block: 'nearest',
        });
      }
    } else {
      // 다른 연도는 시작점으로
      el.scrollLeft = 0;
    }
  }, [calendarData, selectedYear]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">로딩 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchMyPageData}>다시 시도</Button>
        </div>
      </div>
    );
  }

  // 세션에서 유저 이름 가져오기 (API 데이터 우선, 없으면 세션)
  const sessionUser = getUserFromSession();
  const displayName = myPageData?.profile.name || sessionUser?.name || '사용자';

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SiteHeader />

      <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-12 overflow-hidden">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary">
            마이페이지
          </Badge>
          <h1 className="mb-3 sm:mb-4 text-balance text-2xl sm:text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            나의 체력 관리
          </h1>
          <p className="text-pretty text-base sm:text-lg text-muted-foreground">
            운동 기록과 성과를 확인하세요
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Left Column - Profile & Stats */}
          <div className="space-y-6 lg:col-span-1">
            {/* Profile Card */}
            <Card className="border-primary/20">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-3 sm:mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10 text-xl sm:text-2xl font-bold text-primary">
                    {displayName?.[0] ?? '유'}
                  </div>
                </div>
                <h3 className="mb-1 text-lg sm:text-xl font-bold text-foreground">
                  {displayName}
                </h3>
                <p className="mb-3 sm:mb-4 text-sm text-muted-foreground">
                  {displayName}님, 환영합니다!
                </p>

                <div className="space-y-2 sm:space-y-3 rounded-lg bg-muted/50 p-3 sm:p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">체력 등급</span>
                    <Badge className="bg-primary text-primary-foreground">
                      {myPageData?.profile.fitnessGrade || '-'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">전체 순위</span>
                    <span className="font-semibold text-foreground">
                      상위 {myPageData?.ranking.topPercent || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">연속 출석</span>
                    <span className="font-semibold text-accent">
                      {myPageData?.streak.currentStreak || 0}일
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  성취 배지
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`flex flex-col items-center gap-1 sm:gap-2 rounded-lg border p-2 sm:p-3 text-center transition-all hover:scale-105 ${
                        badge.earned
                          ? 'border-accent/50 bg-accent/5'
                          : 'border-border bg-muted/30 opacity-50'
                      }`}
                    >
                      <span className="text-lg sm:text-2xl">{badge.icon}</span>
                      <span className="text-[10px] sm:text-xs font-medium">
                        {badge.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  활동 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {/* 출석 - 클릭 가능 */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAttendancePopup(!showAttendancePopup)
                      }
                      className="w-full text-center p-2 sm:p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors cursor-pointer"
                    >
                      <div className="text-lg sm:text-2xl font-bold text-green-600">
                        {grassStats.attendance}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        출석
                      </div>
                    </button>
                    {/* 출석 날짜 팝업 */}
                    {showAttendancePopup && (
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover border rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-green-600">
                            출석 날짜
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAttendancePopup(false)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        {attendanceDates.length > 0 ? (
                          <div className="space-y-1">
                            {attendanceDates.slice(0, 10).map((date) => (
                              <div
                                key={date}
                                className="text-xs text-muted-foreground"
                              >
                                {new Date(date).toLocaleDateString('ko-KR')}
                              </div>
                            ))}
                            {attendanceDates.length > 10 && (
                              <div className="text-xs text-muted-foreground">
                                ... 외 {attendanceDates.length - 10}일
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            기록 없음
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 영상시청 - 클릭 가능 */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowVideoWatchPopup(!showVideoWatchPopup)
                      }
                      className="w-full text-center p-2 sm:p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors cursor-pointer"
                    >
                      <div className="text-lg sm:text-2xl font-bold text-blue-600">
                        {grassStats.videoWatch}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        영상시청
                      </div>
                    </button>
                    {/* 영상시청 날짜 팝업 */}
                    {showVideoWatchPopup && (
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover border rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-blue-600">
                            영상시청 날짜
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowVideoWatchPopup(false)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        {videoWatchDates.length > 0 ? (
                          <div className="space-y-1">
                            {videoWatchDates.slice(0, 10).map((date) => (
                              <div
                                key={date}
                                className="text-xs text-muted-foreground"
                              >
                                {new Date(date).toLocaleDateString('ko-KR')}
                              </div>
                            ))}
                            {videoWatchDates.length > 10 && (
                              <div className="text-xs text-muted-foreground">
                                ... 외 {videoWatchDates.length - 10}일
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            기록 없음
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 체력측정 - 클릭 가능 */}
                  <button
                    type="button"
                    onClick={() => setShowMeasurementModal(true)}
                    className="text-center p-2 sm:p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors cursor-pointer"
                  >
                    <div className="text-lg sm:text-2xl font-bold text-purple-600">
                      {grassStats.measurement}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      체력측정
                    </div>
                  </button>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">
                      이번 주 영상 시청
                    </span>
                    <span className="font-semibold text-primary">
                      {myPageData?.weeklyVideoWatch || 0}회
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 체력측정 이력 모달 */}
            {showMeasurementModal &&
              createPortal(
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setShowMeasurementModal(false)}
                  />
                  <div className="relative bg-background border rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                    {/* 모달 헤더 */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        체력측정 이력
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowMeasurementModal(false)}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* 모달 내용 */}
                    <div className="p-4 overflow-y-auto max-h-[60vh]">
                      {myPageData?.measurementHistory &&
                      myPageData.measurementHistory.length > 0 ? (
                        <>
                          {/* 그래프 영역 */}
                          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-2">
                              점수 변화
                            </div>
                            <div className="flex items-end gap-2 h-32">
                              {myPageData.measurementHistory
                                .slice(-10)
                                .map((item, idx) => {
                                  const recentData =
                                    myPageData.measurementHistory.slice(-10);
                                  const maxScore = Math.max(
                                    ...recentData.map((h) => h.fitnessScore)
                                  );
                                  const minScore = Math.min(
                                    ...recentData.map((h) => h.fitnessScore)
                                  );
                                  const range = maxScore - minScore || 1;
                                  // 최소 20px, 최대 80px 높이
                                  const barHeight = Math.round(
                                    ((item.fitnessScore - minScore) / range) *
                                      60 +
                                      20
                                  );
                                  return (
                                    <div
                                      key={idx}
                                      className="flex-1 flex flex-col items-center justify-end"
                                    >
                                      <div className="text-[9px] text-muted-foreground mb-1">
                                        {item.fitnessScore}
                                      </div>
                                      <div
                                        className="w-full rounded-t"
                                        style={{
                                          height: `${barHeight}px`,
                                          background:
                                            'linear-gradient(to top, #9333ea, #c084fc)',
                                        }}
                                      />
                                      <div className="text-[8px] text-muted-foreground truncate w-full text-center mt-1">
                                        {new Date(
                                          item.measuredAt
                                        ).toLocaleDateString('ko-KR', {
                                          month: 'short',
                                          day: 'numeric',
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                          {/* 상세 목록 */}
                          <div className="space-y-2">
                            {myPageData.measurementHistory
                              .slice(-10)
                              .reverse()
                              .map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                                >
                                  <div>
                                    <div className="text-sm font-medium">
                                      {new Date(
                                        item.measuredAt
                                      ).toLocaleDateString('ko-KR')}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(
                                        item.measuredAt
                                      ).toLocaleTimeString('ko-KR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                                      {item.fitnessGrade}
                                    </Badge>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {item.fitnessScore}점
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {myPageData.measurementHistory.length > 10 && (
                              <div className="text-xs text-center text-muted-foreground pt-2">
                                최근 10개 기록만 표시됩니다
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-4xl mb-2">📊</div>
                          <p className="text-sm">
                            아직 체력측정 기록이 없습니다.
                          </p>
                          <p className="text-xs mt-1">
                            체력측정을 완료하면 이력을 확인할 수 있어요!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>,
                document.body
              )}
          </div>

          {/* Right Column - Activity */}
          <div className="space-y-6 lg:col-span-2 min-w-0">
            <Card className="min-w-0 w-full">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    운동 활동 기록
                  </CardTitle>
                  {/* 모바일: 연도만 표시 */}
                  <div className="flex sm:hidden items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setSelectedYear(selectedYear - 1)}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-xs font-medium min-w-[50px] text-center">
                      {selectedYear}년
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setSelectedYear(selectedYear + 1)}
                      disabled={selectedYear >= new Date().getFullYear()}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* 데스크톱: 연도 선택 */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedYear(selectedYear - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[60px] text-center">
                      {selectedYear}년
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedYear(selectedYear + 1)}
                      disabled={selectedYear >= new Date().getFullYear()}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 min-w-0">
                {/* 모바일: 월별 뷰 */}
                <div className="block sm:hidden">
                  {/* 월 선택 */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        if (selectedMonth === 0) {
                          setSelectedMonth(11);
                          setSelectedYear(selectedYear - 1);
                        } else {
                          setSelectedMonth(selectedMonth - 1);
                        }
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="text-sm font-medium bg-background border rounded-md px-3 py-1.5"
                    >
                      {monthNames.map((name, idx) => (
                        <option key={idx} value={idx}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        if (selectedMonth === 11) {
                          setSelectedMonth(0);
                          setSelectedYear(selectedYear + 1);
                        } else {
                          setSelectedMonth(selectedMonth + 1);
                        }
                      }}
                      disabled={
                        selectedYear >= new Date().getFullYear() &&
                        selectedMonth >= new Date().getMonth()
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 요일 헤더 */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs text-muted-foreground font-medium py-1"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* 월별 잔디 그리드 */}
                  <div className="grid grid-cols-7 gap-1">
                    {monthlyCalendarData.map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all ${
                          !day.isCurrentMonth
                            ? 'text-muted-foreground/30'
                            : day.intensity === 0
                            ? 'bg-muted text-muted-foreground'
                            : day.intensity === 1
                            ? 'bg-primary/30 text-primary-foreground'
                            : day.intensity === 2
                            ? 'bg-primary/60 text-primary-foreground'
                            : 'bg-primary text-primary-foreground'
                        } ${
                          day.isCurrentMonth
                            ? 'cursor-pointer active:scale-95'
                            : 'cursor-default'
                        }`}
                        disabled={!day.isCurrentMonth}
                        onClick={() => {
                          if (!day.isCurrentMonth) return;
                          if (pinnedDate === day.date) {
                            setPinnedDate(null);
                            setActiveDetail(null);
                          } else {
                            setPinnedDate(day.date);
                            setActiveDetail({
                              date: day.date,
                              attendance: day.attendance,
                              videoWatch: day.videoWatch,
                              measurement: day.measurement,
                              intensity: day.intensity,
                            });
                          }
                        }}
                      >
                        {day.day}
                      </button>
                    ))}
                  </div>

                  {/* 선택된 날짜 상세 정보 */}
                  {activeDetail && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
                      <div className="font-medium mb-2">
                        {activeDetail.date}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded ${
                            activeDetail.attendance
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          출석 {activeDetail.attendance ? 'O' : 'X'}
                        </span>
                        <span
                          className={`px-2 py-1 rounded ${
                            activeDetail.videoWatch
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          영상 {activeDetail.videoWatch ? 'O' : 'X'}
                        </span>
                        <span
                          className={`px-2 py-1 rounded ${
                            activeDetail.measurement
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          측정 {activeDetail.measurement ? 'O' : 'X'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 범례 */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span>적음</span>
                    <div className="h-4 w-4 rounded bg-muted" />
                    <div className="h-4 w-4 rounded bg-primary/30" />
                    <div className="h-4 w-4 rounded bg-primary/60" />
                    <div className="h-4 w-4 rounded bg-primary" />
                    <span>많음</span>
                  </div>
                </div>

                {/* 데스크톱: 연간 뷰 */}
                <div
                  className="hidden sm:block overflow-x-auto max-w-full"
                  ref={scrollContainerRef}
                >
                  <div className="relative inline-flex flex-col gap-1 min-w-max">
                    {/* 월 라벨 */}
                    <div className="flex gap-1 mb-2 relative h-5">
                      {monthLabels.map((item, idx) => (
                        <div
                          key={idx}
                          className="absolute text-xs text-muted-foreground whitespace-nowrap"
                          style={{ left: `${item.weekIndex * 16}px` }}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {calendarData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                          {week.map((day, dayIndex) => (
                            <div
                              key={dayIndex}
                              className="relative"
                              ref={(node) => {
                                if (node) {
                                  const todayStr = new Date()
                                    .toISOString()
                                    .split('T')[0];
                                  if (day.date === todayStr) {
                                    todayCellRef.current = node;
                                  }
                                }
                              }}
                            >
                              <button
                                type="button"
                                className={`h-3 w-3 rounded-sm ${
                                  !day.isCurrentYear
                                    ? 'bg-transparent'
                                    : day.intensity === 0
                                    ? 'bg-muted'
                                    : day.intensity === 1
                                    ? 'bg-primary/30'
                                    : day.intensity === 2
                                    ? 'bg-primary/60'
                                    : 'bg-primary'
                                } transition-colors ${
                                  day.isCurrentYear
                                    ? 'cursor-pointer'
                                    : 'cursor-default'
                                }`}
                                disabled={!day.isCurrentYear}
                                onMouseEnter={(e) => {
                                  if (!day.isCurrentYear) return;
                                  if (pinnedDate && pinnedDate !== day.date)
                                    return;
                                  setActiveDetail({
                                    date: day.date,
                                    attendance: day.attendance,
                                    videoWatch: day.videoWatch,
                                    measurement: day.measurement,
                                    intensity: day.intensity,
                                  });
                                  const rect = (
                                    e.currentTarget as HTMLElement
                                  ).getBoundingClientRect();
                                  setTooltipPos({
                                    x: rect.left + rect.width / 2,
                                    y: rect.top - 8,
                                  });
                                }}
                                onMouseLeave={() => {
                                  if (pinnedDate) return;
                                  setActiveDetail(null);
                                  setTooltipPos(null);
                                }}
                                onClick={(e) => {
                                  if (!day.isCurrentYear) return;
                                  if (pinnedDate === day.date) {
                                    setPinnedDate(null);
                                    setActiveDetail(null);
                                    setTooltipPos(null);
                                  } else {
                                    setPinnedDate(day.date);
                                    setActiveDetail({
                                      date: day.date,
                                      attendance: day.attendance,
                                      videoWatch: day.videoWatch,
                                      measurement: day.measurement,
                                      intensity: day.intensity,
                                    });
                                    const rect = (
                                      e.currentTarget as HTMLElement
                                    ).getBoundingClientRect();
                                    setTooltipPos({
                                      x: rect.left + rect.width / 2,
                                      y: rect.top - 8,
                                    });
                                  }
                                }}
                                aria-label={
                                  day.isCurrentYear
                                    ? `${day.date} 출석 ${
                                        day.attendance ? 'O' : 'X'
                                      }, 영상 시청 ${
                                        day.videoWatch ? 'O' : 'X'
                                      }, 체력 측정 ${
                                        day.measurement ? 'O' : 'X'
                                      }`
                                    : ''
                                }
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  {activeDetail &&
                    tooltipPos &&
                    createPortal(
                      <div
                        className="fixed z-[1000] w-max rounded-md border bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-sm"
                        style={{
                          left: tooltipPos.x,
                          top: tooltipPos.y,
                          transform: 'translate(-50%, -100%)',
                        }}
                      >
                        {activeDetail.date} · 출석{' '}
                        {activeDetail.attendance ? 'O' : 'X'} · 영상{' '}
                        {activeDetail.videoWatch ? 'O' : 'X'} · 측정{' '}
                        {activeDetail.measurement ? 'O' : 'X'}
                      </div>,
                      document.body
                    )}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>적음</span>
                    <div className="h-3 w-3 rounded-sm bg-muted" />
                    <div className="h-3 w-3 rounded-sm bg-primary/30" />
                    <div className="h-3 w-3 rounded-sm bg-primary/60" />
                    <div className="h-3 w-3 rounded-sm bg-primary" />
                    <span>많음</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                  내가 추천받은 운동 레시피
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  체력 분석 결과를 바탕으로 당신에게 필요한 운동입니다
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {myPageData?.recipes && myPageData.recipes.length > 0 ? (
                  <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                    {myPageData.recipes.map((recipe) => (
                      <Link key={recipe.id} to={`/recipes/${recipe.id}`}>
                        <Card className="group h-full cursor-pointer overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1">
                          <CardContent className="p-4 sm:p-6">
                            <div className="mb-3 sm:mb-4 flex items-start justify-between">
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                {recipe.difficulty}
                              </Badge>
                            </div>

                            <h3 className="mb-2 sm:mb-3 text-base sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {recipe.recipeTitle}
                            </h3>

                            <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                              {recipe.recipeIntro}
                            </p>

                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{recipe.durationMin}분</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{recipe.exerciseCount}개 운동</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                              <span className="font-medium text-foreground">
                                {recipe.fitnessGrade}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <p className="text-sm sm:text-base">
                      아직 추천 레시피가 없습니다.
                    </p>
                    <p className="text-xs sm:text-sm mt-1">
                      체력 측정을 완료하면 맞춤 레시피를 받을 수 있어요!
                    </p>
                  </div>
                )}

                <Button className="mt-4 sm:mt-6 w-full" size="lg" asChild>
                  <Link to="/recipes">
                    <BookOpen className="mr-2 h-5 w-5" />더 많은 레시피 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

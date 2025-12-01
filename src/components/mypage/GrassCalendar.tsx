import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  GrassData,
  GrassDetail,
  CalendarDay,
  MonthlyCalendarDay,
} from './types';

interface GrassCalendarProps {
  grass: GrassData[];
}

const MONTH_NAMES = [
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

export function GrassCalendar({ grass }: GrassCalendarProps) {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [activeDetail, setActiveDetail] = useState<GrassDetail | null>(null);
  const [pinnedDate, setPinnedDate] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayCellRef = useRef<HTMLDivElement | null>(null);

  // grass 데이터를 Map으로 변환 (빠른 조회용)
  const grassMap = useMemo(() => {
    const map = new Map<string, GrassData>();
    if (grass) {
      grass.forEach((g) => {
        // 날짜 문자열을 로컬 시간대 기준으로 파싱하여 YYYY-MM-DD 추출
        // API에서 "2025-11-30" 또는 "2025-11-30T00:00:00.000Z" 형식으로 올 수 있음
        const dateObj = new Date(g.recordDate);
        // 로컬 시간대 기준 YYYY-MM-DD 문자열 생성
        const dateStr = `${dateObj.getFullYear()}-${String(
          dateObj.getMonth() + 1
        ).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        map.set(dateStr, g);
      });
    }
    return map;
  }, [grass]);

  // 잔디 데이터를 캘린더 형식으로 변환 (선택된 연도 기준 1월~12월)
  const calendarData = useMemo(() => {
    const weeks: CalendarDay[][] = [];

    // 선택된 연도의 1월 1일부터 12월 31일까지
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31);

    // 1월 1일이 속한 주의 월요일 찾기
    const startDay = start.getDay() === 0 ? 7 : start.getDay();
    const startMonday = new Date(start);
    startMonday.setDate(start.getDate() - (startDay - 1));

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
      const days: CalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startMonday);
        date.setDate(startMonday.getDate() + w * 7 + d);
        // 로컬 시간대 기준 YYYY-MM-DD 문자열 생성
        const dateStr = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        const grassItem = grassMap.get(dateStr);
        const attendance = grassItem?.attendance ?? false;
        const videoWatch = grassItem?.videoWatch ?? false;
        const measurement = grassItem?.measurement ?? false;

        let intensity = 0;
        if (attendance) intensity++;
        if (videoWatch) intensity++;
        if (measurement) intensity++;

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
  }, [grassMap, selectedYear]);

  // 월 라벨 생성
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];

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

      labels.push({ label: MONTH_NAMES[month], weekIndex });
    }
    return labels;
  }, [selectedYear]);

  // 모바일용 월별 캘린더 데이터
  const monthlyCalendarData = useMemo(() => {
    const days: MonthlyCalendarDay[] = [];

    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

    const firstDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - (firstDayOfWeek - 1));

    const lastDayOfWeek = lastDay.getDay() === 0 ? 7 : lastDay.getDay();
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (7 - lastDayOfWeek));

    const current = new Date(startDate);
    while (current <= endDate) {
      // 로컬 시간대 기준 YYYY-MM-DD 문자열 생성
      const dateStr = `${current.getFullYear()}-${String(
        current.getMonth() + 1
      ).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
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
        isCurrentYear: current.getFullYear() === selectedYear,
        dayOfWeek: current.getDay() === 0 ? 7 : current.getDay(),
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [grassMap, selectedYear, selectedMonth]);

  // 스크롤 처리
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
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
      el.scrollLeft = 0;
    }
  }, [calendarData, selectedYear]);

  return (
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
              {MONTH_NAMES.map((name, idx) => (
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
              <div className="font-medium mb-2">{activeDetail.date}</div>
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
        <div className="hidden sm:block relative">
          <div className="overflow-x-auto max-w-full" ref={scrollContainerRef}>
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
                            const today = new Date();
                            const todayStr = `${today.getFullYear()}-${String(
                              today.getMonth() + 1
                            ).padStart(2, '0')}-${String(
                              today.getDate()
                            ).padStart(2, '0')}`;
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
                            if (pinnedDate && pinnedDate !== day.date) return;
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
                                }, 체력 측정 ${day.measurement ? 'O' : 'X'}`
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
          </div>
          {/* 범례 - 스크롤 영역 밖에 고정 */}
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
  );
}

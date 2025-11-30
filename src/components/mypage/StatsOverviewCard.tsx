import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, X } from 'lucide-react';
import type { GrassData, MeasurementHistory } from './types';
import { MeasurementModal } from './MeasurementModal';

interface StatsOverviewCardProps {
  grass: GrassData[];
  weeklyVideoWatch: number;
  measurementHistory: MeasurementHistory[];
}

export function StatsOverviewCard({
  grass,
  weeklyVideoWatch,
  measurementHistory,
}: StatsOverviewCardProps) {
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [showVideoWatchPopup, setShowVideoWatchPopup] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);

  // 잔디 통계 계산
  const grassStats = grass.reduce(
    (acc, item) => {
      if (item.attendance) acc.attendance++;
      if (item.videoWatch) acc.videoWatch++;
      if (item.measurement) acc.measurement++;
      return acc;
    },
    { attendance: 0, videoWatch: 0, measurement: 0 }
  );

  // 출석/영상시청 날짜 목록 계산
  const attendanceDates = grass
    .filter((item) => item.attendance)
    .map((item) => item.recordDate)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const videoWatchDates = grass
    .filter((item) => item.videoWatch)
    .map((item) => item.recordDate)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <>
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
                onClick={() => setShowAttendancePopup(!showAttendancePopup)}
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
                onClick={() => setShowVideoWatchPopup(!showVideoWatchPopup)}
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
              <span className="text-muted-foreground">이번 주 영상 시청</span>
              <span className="font-semibold text-primary">
                {weeklyVideoWatch || 0}회
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 체력측정 이력 모달 */}
      <MeasurementModal
        isOpen={showMeasurementModal}
        onClose={() => setShowMeasurementModal(false)}
        measurementHistory={measurementHistory}
      />
    </>
  );
}

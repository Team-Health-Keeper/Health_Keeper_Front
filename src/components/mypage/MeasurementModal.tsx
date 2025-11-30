import { createPortal } from 'react-dom';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, X } from 'lucide-react';
import type { MeasurementHistory } from './types';

interface MeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurementHistory: MeasurementHistory[];
}

export function MeasurementModal({
  isOpen,
  onClose,
  measurementHistory,
}: MeasurementModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background border rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            체력측정 이력
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {measurementHistory && measurementHistory.length > 0 ? (
            <>
              {/* 그래프 영역 */}
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-2">
                  점수 변화
                </div>
                <div className="flex items-end gap-2 h-32">
                  {measurementHistory.slice(-10).map((item, idx) => {
                    const recentData = measurementHistory.slice(-10);
                    const maxScore = Math.max(
                      ...recentData.map((h) => h.fitnessScore)
                    );
                    const minScore = Math.min(
                      ...recentData.map((h) => h.fitnessScore)
                    );
                    const range = maxScore - minScore || 1;
                    // 최소 20px, 최대 80px 높이
                    const barHeight = Math.round(
                      ((item.fitnessScore - minScore) / range) * 60 + 20
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
                          {new Date(item.measuredAt).toLocaleDateString(
                            'ko-KR',
                            {
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 상세 목록 */}
              <div className="space-y-2">
                {measurementHistory
                  .slice(-10)
                  .reverse()
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {new Date(item.measuredAt).toLocaleDateString(
                            'ko-KR'
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.measuredAt).toLocaleTimeString(
                            'ko-KR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
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
                {measurementHistory.length > 10 && (
                  <div className="text-xs text-center text-muted-foreground pt-2">
                    최근 10개 기록만 표시됩니다
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm">아직 체력측정 기록이 없습니다.</p>
              <p className="text-xs mt-1">
                체력측정을 완료하면 이력을 확인할 수 있어요!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

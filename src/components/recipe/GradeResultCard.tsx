"use client"

import { Card, CardContent } from "@/components/ui/card"

export interface GradeResultCardProps {
  grade: string
  percentile?: number | null
}

export function GradeResultCard({ grade, percentile }: GradeResultCardProps) {
  const barWidth = percentile != null ? `${100 - percentile}%` : '65%'

  // 등급 처리: 숫자 4~6은 '참가'로 표시하고, 그 밖엔 그대로 표시
  const displayGrade = (() => {
    if (grade == null) return ''
    const asNum = Number(grade)
    if (!Number.isNaN(asNum) && asNum >= 4 && asNum <= 6) return '참가'
    return String(grade)
  })()
  return (
    <Card className="mb-8 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <CardContent className="p-8 text-center">
        {/* 상단 안내 배지 */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-[12px] font-medium text-primary shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-check h-4 w-4">
              <path d="M7.5 2.5 6 5l-2.5 1.5L6 8l1.5 2.5L10 8l2.5-1.5L10 5 7.5 2.5Z" />
              <path d="M17 13l-3.5 3.5L12 15" />
              <circle cx="17" cy="13" r="5" />
            </svg>
            국민체력 인증 기준 참고 결과
          </span>
        </div>
        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">당신의 체력 등급</p>
          <div className="mb-2 text-6xl font-bold text-primary">{displayGrade}</div>
          <p className="text-sm text-muted-foreground">
            {percentile != null ? `상위 ${percentile}% (전체 기준)` : '상위 35% (전체 기준)'}
          </p>
        </div>
        {/* 간단 안내 문구 */}
        <p className="mx-auto mb-6 max-w-xl text-[12px] leading-relaxed text-gray-600 animate-fade-in">
          본 결과는 국민체력 인증 기준을 참고해 연령·성별 지표를 종합 산정한 예측 결과입니다.
          <br />
          공식 기준은 국민체력 100 누리집에서 <a href="https://nfa.kspo.or.kr/reserve/0/selectMeasureGradeItemListByAgeSe.kspo" target="_blank" rel="noopener noreferrer" className="mx-1 font-semibold text-primary hover:text-primary/80 underline underline-offset-2">확인</a>하세요.
        </p>
        <div className="mx-auto max-w-md">
          <div className="mb-2 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: barWidth }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

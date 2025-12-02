"use client"

import { Card, CardContent } from "@/components/ui/card"

export interface GradeResultCardProps {
  grade: string
  percentile?: number | null
}

export function GradeResultCard({ grade, percentile }: GradeResultCardProps) {
  const barWidth = percentile != null ? `${100 - percentile}%` : '65%'
  return (
    <Card className="mb-8 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <CardContent className="p-8 text-center">
        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">당신의 체력 등급</p>
          <div className="mb-2 text-6xl font-bold text-primary">{grade}</div>
          <p className="text-sm text-muted-foreground">
            {percentile != null ? `상위 ${percentile}% (전체 기준)` : '상위 35% (전체 기준)'}
          </p>
        </div>
        <div className="mx-auto max-w-md">
          <div className="mb-2 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: barWidth }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>F</span><span>D</span><span>C</span><span>B</span><span>A</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

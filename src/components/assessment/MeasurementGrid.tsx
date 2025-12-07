"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Video } from "lucide-react"

export interface MeasurementCode { id: number; measurement_code_name: string; guide_video: string | null }

export interface MeasurementGridProps {
  headerTitle?: string
  headerDescription?: string
  measurementCodes: MeasurementCode[]
  measurements: Record<string, string>
  currentMeasurements: Record<string, string>
  requiredMeasurementIds: string[]
  autoValues: Record<string, string>
  allRequiredFilled: boolean
  errors?: Record<string, string | null>
  onChange: (id: string, value: string) => void
  onOpenTextGuide: (id: string) => void
  onOpenVideoGuide: (label: string, videoId: string) => void
  extractYouTubeId: (url: string) => string
  hasTextGuide?: (id: string) => boolean
}

export function MeasurementGrid({
  headerTitle = "측정 항목",
  headerDescription = "연령대에 해당하는 측정 항목입니다. 필수 항목은 반드시 입력해주세요.",
  measurementCodes,
  measurements,
  currentMeasurements,
  requiredMeasurementIds,
  autoValues,
  allRequiredFilled,
  errors,
  onChange,
  onOpenTextGuide,
  onOpenVideoGuide,
  extractYouTubeId,
  hasTextGuide,
}: MeasurementGridProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{headerTitle}</CardTitle>
        <CardDescription>{headerDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!allRequiredFilled && (
          <div className="rounded-md bg-amber-100 px-4 py-2 text-sm text-amber-900">필수 측정값을 모두 입력하면 분석을 시작할 수 있어요.</div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(currentMeasurements)
            .filter(([id]) => !["1", "2", "18"].includes(id))
            .map(([id, name]) => {
              const label = String(name)
              const isRequired = requiredMeasurementIds.includes(id)
              const mc = measurementCodes.find((m) => String(m.id) === id || m.id === Number(id))
              const guideVideoRaw = mc?.guide_video || null
              const guideVideoId = guideVideoRaw ? extractYouTubeId(guideVideoRaw) : null
              const isAutoField = ["42", "28", "52"].includes(id)
              const autoValue = autoValues[id] || ""
              const errMsg = errors?.[id] || null
              return (
                <div key={id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`measurement-${id}`}>{label} {isRequired && <span className="text-destructive">*필수</span>}</Label>
                    <div className="flex items-center gap-2">
                      {(!hasTextGuide || hasTextGuide(id)) ? (
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => onOpenTextGuide(id)} title="측정 글 가이드">
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="h-8 w-8 inline-block" aria-hidden="true" />
                      )}
                      {guideVideoId && (
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => onOpenVideoGuide(label.replace(/\s*\*필수\s*$/, ""), guideVideoId!)} title="측정 영상 보기">
                          <Video className="h-4 w-4" />
                        </Button>
                      )}
                      {!guideVideoId && (
                        <span className="h-8 w-8 inline-block" aria-hidden="true" />
                      )}
                      {id === "51" && (
                        <Button
                          type="button"
                          className="h-8 px-3 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          title="3×3 버튼 테스트 열기"
                          onClick={() => {
                            const features = "popup=yes,noopener,noreferrer,width=820,height=820,resizable=yes,scrollbars=no"
                            window.open("/three-grid", "three-grid", features)
                          }}
                        >
                          3×3 테스트
                        </Button>
                      )}
                      {id === "15" && (
                        <Button
                          type="button"
                          className="h-8 px-3 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          title="T-wall 테스트 열기"
                          onClick={() => {
                            const features = "popup=yes,noopener,noreferrer,width=820,height=820,resizable=yes,scrollbars=no"
                            window.open("/twall", "twall", features)
                          }}
                        >
                          T‑wall 테스트
                        </Button>
                      )}
                    </div>
                  </div>
                  <Input
                    id={`measurement-${id}`}
                    type="number"
                    step="0.1"
                    placeholder={id === "42" ? "신장/허리둘레로 자동 계산" : (id === "28" ? "절대악력/체중으로 자동 계산" : (id === "52" ? "좌/우 악력으로 자동 계산" : "값 입력"))}
                    value={isAutoField ? autoValue : (measurements[id] || "")}
                    onChange={(e) => !isAutoField && onChange(id, e.target.value)}
                    readOnly={isAutoField}
                  />
                  {errMsg && (
                    <p className="text-xs text-destructive mt-1">{errMsg}</p>
                  )}
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}

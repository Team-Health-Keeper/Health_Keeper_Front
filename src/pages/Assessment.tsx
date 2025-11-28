"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Activity, Video, BookOpen } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Link, useNavigate } from "react-router-dom"
import { YoutubeModal } from "@/components/youtube-modal"
import { MeasurementGuideModal, guideKeyForMeasurement, hasGuideForMeasurement } from "@/components/measurement-guide-modal"
import { SiteHeader } from "@/components/site-header"

const ageGroupMeasurements = {
  유아기: {
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "9": "윗몸말아올리기(회)",
    "12": "앉아윗몸앞으로굽히기(cm)",
    "20": "왕복오래달리기(회)",
    "22": "제자리 멀리뛰기(cm)",
    "28": "상대악력(%)",
    "50": "5m 4회 왕복달리기(초)",
    "51": "3×3 버튼누르기(초)",
  },
  유소년: {
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "9": "윗몸말아올리기(회)",
    "12": "앉아윗몸앞으로굽히기(cm)",
    "20": "왕복오래달리기(회)",
    "22": "제자리 멀리뛰기(cm)",
    "28": "상대악력(%)",
    "42": "허리둘레-신장비(WHtR)",
    "43": "반복옆뛰기(회)",
    "44": "눈-손 협응력(벽패스)(초)",
  },
  청소년: {
    "3": "체지방율(%)",
    "5": "이완기혈압_최저(mmHg)",
    "6": "수축기혈압_최고(mmHg)",
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "9": "윗몸말아올리기(회)",
    "10": "반복점프(회)",
    "12": "앉아윗몸앞으로굽히기(cm)",
    "13": "일리노이(초)",
    "14": "체공시간(초)",
    "15": "협응력시간(초)",
    "16": "협응력실수횟수(회)",
    "17": "협응력계산결과값(초)",
    "20": "왕복오래달리기(회)",
    "22": "제자리 멀리뛰기(cm)",
    "28": "상대악력(%)",
    "30": "왕복오래달리기출력(VO₂max)",
  },
  성인: {
    "3": "체지방율(%)",
    "5": "이완기혈압_최저(mmHg)",
    "6": "수축기혈압_최고(mmHg)",
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "12": "앉아윗몸앞으로굽히기(cm)",
    "19": "교차윗몸일으키기(회)",
    "22": "제자리 멀리뛰기(cm)",
    "28": "상대악력(%)",
    "36": "스텝검사_회복시 심박수(bpm)",
    "37": "스텝검사_출력(VO₂max)",
    "40": "반응시간(초)",
  },
  어르신: {
    "3": "체지방률(%)",
    "5": "이완기최저혈압(mmHg)",
    "6": "수축기최고혈압(mmHg)",
    "7": "악력_좌(kg)",
    "8": "악력_우(kg)",
    "12": "앉아윗몸앞으로굽히기(cm)",
    "23": "의자에앉았다일어서기(회)",
    "25": "2분제자리걷기(회)",
    "26": "의자에앉아 3M표적 돌아오기(초)",
    "27": "8자보행(초)",
    "28": "상대악력(%)",
    "52": "절대악력(kg)",
  },
}

const requiredMeasurementIds = [
  // 기본 정보(1:신장,2:체중,4:허리둘레,18:BMI) 제거 후 실제 측정 항목만 유지
  "7",
  "8",
  "28",
  "52",
  "9",
  "12",
  "19",
  "23",
  "10",
  "14",
  "21",
  "22",
  "40",
  "41",
  "20",
  "24",
  "25",
  "15",
  "16",
  "17",
  "26",
  "27",
  "43",
  "44",
]

export default function AssessmentPage() {
  // 검증 복구: 필수값 모두 채워져야 분석 시작 가능
  const TEMP_SKIP_VALIDATION = false
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const navigate = useNavigate()
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [guideKey, setGuideKey] = useState<string | null>(null)
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [waist, setWaist] = useState("")
  const [bmi, setBmi] = useState("")

  const [ageGroup, setAgeGroup] = useState<string>("")
  const [showMeasurements, setShowMeasurements] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [ageWarning, setAgeWarning] = useState<string | null>(null)

  const [measurementValues, setMeasurementValues] = useState<Record<string, string>>({})

  // 분석 단계 전환 시 페이드 애니메이션을 위한 상태
  const [displayedStageIndex, setDisplayedStageIndex] = useState(0)
  const [isStageFading, setIsStageFading] = useState(false)
  const [transitionDir, setTransitionDir] = useState<'down' | 'up'>('down')
  const FADE_MS = 500
  // 총 분석 시간: 8초 (기존 10초에서 단축)
  const ANALYZE_MS = 8000
  // 단계별 가시 시간: (총시간 - 페이드합) / 3 = (8000 - 2000)/3 = 2000ms
  const VISIBLE_MS = Math.max(0, (ANALYZE_MS - 4 * FADE_MS) / 3)
  const elapsedMs = (progress / 100) * ANALYZE_MS
  const t1 = VISIBLE_MS
  const t2 = 2 * VISIBLE_MS + 2 * FADE_MS
  const computedStageIndex = elapsedMs < t1 ? 0 : elapsedMs < t2 ? 1 : 2
  const [ellipsisCount, setEllipsisCount] = useState(0)

  useEffect(() => {
    if (!analyzing) return
    if (displayedStageIndex === computedStageIndex) return
    const dir = computedStageIndex > displayedStageIndex ? 'down' : 'up'
    setTransitionDir(dir)
    setIsStageFading(true)
    const t = setTimeout(() => {
      setDisplayedStageIndex(computedStageIndex)
      setIsStageFading(false)
    }, FADE_MS)
    return () => clearTimeout(t)
  }, [computedStageIndex, analyzing])

  // 점점점(ellipsis) 애니메이션: 단계가 바뀌면 0부터 다시 시작
  useEffect(() => {
    if (!analyzing) {
      setEllipsisCount(0)
      return
    }
    setEllipsisCount(0)
    const iv = setInterval(() => {
      setEllipsisCount((c) => (c + 1) % 4)
    }, 350)
    return () => clearInterval(iv)
  }, [analyzing, displayedStageIndex])

  useEffect(() => {
    if (!age) {
      setAgeGroup("")
      setAgeWarning(null)
      return
    }

    const ageNum = Number.parseInt(age)
    if (ageNum >= 1 && ageNum <= 3) {
      setAgeGroup("")
      setAgeWarning("만 1–3세는 해당 나이의 데이터가 없어 측정이 불가합니다.")
    } else if (ageNum >= 4 && ageNum <= 6) {
      setAgeGroup("유아기")
      setAgeWarning(null)
    } else if (ageNum >= 7 && ageNum <= 12) {
      setAgeGroup("유소년")
      setAgeWarning(null)
    } else if (ageNum >= 13 && ageNum <= 18) {
      setAgeGroup("청소년")
      setAgeWarning(null)
    } else if (ageNum >= 19 && ageNum <= 64) {
      setAgeGroup("성인")
      setAgeWarning(null)
    } else if (ageNum >= 65) {
      setAgeGroup("어르신")
      setAgeWarning(null)
    } else {
      setAgeGroup("")
      setAgeWarning(null)
    }
  }, [age])

  // Compute BMI from height(cm) and weight(kg) instead of manual input
  useEffect(() => {
    const h = Number.parseFloat(height)
    const w = Number.parseFloat(weight)
    if (h > 0 && w > 0) {
      const bmiVal = w / Math.pow(h / 100, 2)
      setBmi(bmiVal ? bmiVal.toFixed(1) : "")
    } else {
      setBmi("")
    }
  }, [height, weight])

  useEffect(() => {
    const isBasicInfoComplete = !!(age && gender && height && weight && waist)
    setShowMeasurements(isBasicInfoComplete)

    if (!isBasicInfoComplete) {
      setMeasurementValues({})
    }
  }, [age, gender, height, weight, waist])

  const currentMeasurements = ageGroup ? ageGroupMeasurements[ageGroup as keyof typeof ageGroupMeasurements] : {}
  const requiredIdsForGroup = Object.keys(currentMeasurements)
    .filter((id) => !["1", "2", "4", "18"].includes(id))
    .filter((id) => requiredMeasurementIds.includes(id))
  const allRequiredFilled = requiredIdsForGroup.every((id) => {
    const v = measurementValues[id]
    return typeof v === "string" && v.trim() !== ""
  })

  const updateMeasurementValue = (id: string, value: string) => {
    setMeasurementValues((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleAnalyzeStart = () => {
    if (!TEMP_SKIP_VALIDATION) {
      if (!showMeasurements || analyzing || ageWarning || !allRequiredFilled) return
    } else {
      if (analyzing) return
    }
    setProgress(0)
    setAnalyzing(true)
  }

  useEffect(() => {
    if (!analyzing) return
    const duration = ANALYZE_MS
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(timer)
        navigate("/results")
      }
    }, 30)
    return () => clearInterval(timer)
  }, [analyzing, navigate])

  // 분석 중에는 별도의 전체 화면으로 전환
  if (analyzing) {
    const stages = [
      "AI가 측정 값을 읽고 있어요",
      "AI가 입력된 값을 바탕으로 운동 처방 레시피를 만들고 있어요",
      "AI가 맞춤 결과 화면을 준비하고 있어요",
    ]
    const showWipe = progress >= 75
    return (
      <div className="min-h-screen bg-background">
        <div className="relative flex h-screen w-screen flex-col items-center justify-center px-6" role="status" aria-live="polite">
          <div className="absolute inset-0 animate-bg-breathe" aria-hidden="true" />
          <div className="mb-12 relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48">
            <img src="/logo-icon.png" alt="Health Keeper" className="h-full w-full" />
            <span className="pointer-events-none absolute inset-0 rounded-full border-8 border-primary/20 border-t-primary/60 animate-spin" />
          </div>
          <div className="relative mb-10 w-full max-w-xl h-36 sm:h-40 md:h-44 flex flex-col items-center justify-center gap-4">
            {showWipe && <span className="wipe-shine" aria-hidden="true" />}
            {/* Top dots: stage 3 -> 2 dots, stage 2 -> 1 dot, stage 1 -> 0 */}
            {(() => {
              const count = displayedStageIndex === 2 ? 2 : displayedStageIndex === 1 ? 1 : 0
              if (count <= 0) return null
              return (
                <div className="flex flex-col items-center gap-1.5" aria-hidden="true">
                  {Array.from({ length: count }).map((_, i) => (
                    <span key={i} className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  ))}
                </div>
              )
            })()}
            {displayedStageIndex !== 0 && isStageFading && transitionDir === 'up' && (
              <span className="h-8 sm:h-10 w-px bg-muted-foreground/30 animate-grow-up" aria-hidden="true" />
            )}
            <div
              className={
                "flex items-center gap-4 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] " +
                (isStageFading
                  ? (transitionDir === 'down' ? 'origin-bottom ' : 'origin-top ') + 'opacity-0 scale-0'
                  : (transitionDir === 'down' ? 'origin-top ' : 'origin-bottom ') + 'opacity-100 scale-100 animate-stage-in')
              }
            >
              <div className={(displayedStageIndex === 1 ? 'text-lg sm:text-2xl md:text-3xl sm:whitespace-nowrap ' : 'text-xl sm:text-2xl md:text-3xl ') + 'font-bold text-foreground'}>
                {stages[displayedStageIndex]}
                <span aria-hidden="true" className="inline-block w-[3ch]">
                  {'.'.repeat(ellipsisCount)}
                </span>
              </div>
            </div>
            {displayedStageIndex !== 2 && isStageFading && transitionDir === 'down' && (
              <span className="h-8 sm:h-10 w-px bg-muted-foreground/30 animate-grow-down" aria-hidden="true" />
            )}
            {/* Bottom dots: stage 1 -> 2 dots, stage 2 -> 1 dot, stage 3 -> 0 */}
            {(() => {
              const count = displayedStageIndex === 0 ? 2 : displayedStageIndex === 1 ? 1 : 0
              if (count <= 0) return null
              return (
                <div className="flex flex-col items-center gap-1.5" aria-hidden="true">
                  {Array.from({ length: count }).map((_, i) => (
                    <span key={i} className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  ))}
                </div>
              )
            })()}
          </div>
          <div className="mb-4 text-4xl font-extrabold text-foreground tabular-nums">{progress}%</div>
          <div className="h-3 w-full max-w-xl rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary">체력 측정</Badge>
            <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              체력 측정 항목 입력
            </h1>
            <p className="text-pretty text-lg text-muted-foreground">
              아래 항목들을 입력하면 AI가 체력 등급을 분석합니다
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>체력 분석에 필요한 기본 정보를 입력해주세요 (모든 항목 필수)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">만 나이 *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="예: 30"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">성별 *</Label>
                  <select
                    id="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">선택하세요</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">신장 (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="예: 170.5"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">체중 (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="예: 65.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">허리둘레 (cm) *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    placeholder="예: 80.0"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-transparent"
                      onClick={() => setGuideKey('waist')}
                      title="허리둘레 측정 가이드"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmi">BMI (kg/㎡)</Label>
                  <Input id="bmi" type="text" value={bmi} readOnly placeholder="신장/체중으로 자동 계산" />
                </div>
              </div>
              {ageWarning && (
                <div className="rounded-md bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive">{ageWarning}</p>
                </div>
              )}

              {ageGroup && (
                <div className="rounded-md bg-primary/10 p-4">
                  <p className="text-sm font-medium text-primary">연령대: {ageGroup} (만 {age}세)</p>
                </div>
              )}
            </CardContent>
          </Card>

          {showMeasurements && ageGroup && Object.keys(currentMeasurements).length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>측정 항목</CardTitle>
                <CardDescription>
                  {ageGroup} 연령대에 해당하는 측정 항목입니다. 필수 항목은 반드시 입력해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!allRequiredFilled && (
                  <div className="rounded-md bg-amber-100 px-4 py-2 text-sm text-amber-900">
                    필수 측정값을 모두 입력하면 분석을 시작할 수 있어요.
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(currentMeasurements)
                    // Exclude basic info fields from measurement inputs: height(1), weight(2), waist(4), BMI(18)
                    .filter(([id]) => !["1", "2", "4", "18"].includes(id))
                    .map(([id, name]) => {
                      const label = String(name)
                    const isRequired = requiredMeasurementIds.includes(id)
                    return (
                      <div key={id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`measurement-${id}`}>
                              {label} {isRequired && <span className="text-destructive">*필수</span>}
                          </Label>
                          <div className="flex items-center gap-2">
                            {hasGuideForMeasurement(id) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => setGuideKey(guideKeyForMeasurement(id))}
                                title="측정 글 가이드"
                              >
                                <BookOpen className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => setSelectedVideo("dQw4w9WgXcQ")}
                              title="측정 영상 보기"
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Input
                          id={`measurement-${id}`}
                          type="number"
                          step="0.1"
                          placeholder="값 입력"
                          value={measurementValues[id] || ""}
                          onChange={(e) => updateMeasurementValue(id, e.target.value)}
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {!showMeasurements && (
            <Card className="mt-6">
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">기본 정보를 모두 입력하면 측정 항목이 표시됩니다.</p>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link to="/">취소</Link>
            </Button>
            <Button
              size="lg"
              onClick={handleAnalyzeStart}
              disabled={TEMP_SKIP_VALIDATION ? analyzing : (!showMeasurements || analyzing || !!ageWarning || !allRequiredFilled)}
            >
              <Activity className="mr-2 h-5 w-5" />
              {analyzing ? "분석 중..." : "AI 분석 시작"}
            </Button>
          </div>
        </div>
      </div>

      {selectedVideo && (
        <YoutubeModal videoId={selectedVideo} isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}

      {guideKey && (
        <MeasurementGuideModal isOpen={!!guideKey} onClose={() => setGuideKey(null)} guideKey={guideKey} />
      )}

      {/* 분석 중 화면은 별도 뷰로 전환되므로 Dialog 제거 */}
    </div>
  )
}
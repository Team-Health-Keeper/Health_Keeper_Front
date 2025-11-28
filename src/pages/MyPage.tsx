"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Award, BookOpen, TrendingUp, Trophy, Clock, Dumbbell } from "lucide-react"
import { Link } from "react-router-dom"
import { SiteHeader } from "@/components/site-header"
import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

export default function MyPage() {
  const [displayName, setDisplayName] = useState<string>("사용자")
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const userStr = typeof window !== "undefined" ? sessionStorage.getItem("user") : null
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user?.name && typeof user.name === "string") {
          setDisplayName(user.name)
        }
      } catch (e) {
        // keep default displayName
      }
    }
  }, [])

  const generateCalendarData = () => {
    // 정확히 365일 범위를 월(월요일)~일(일요일) 축으로 구성하고,
    // 가장 오래된 주가 왼쪽, 오늘이 포함된 최신 주가 오른쪽에 오도록 생성
    const weeks: Array<Array<{
      intensity: number
      date: string
      attendance: boolean
      videoWatch: boolean
      fitnessTest: boolean
    }>> = []

    const end = new Date()
    // 오늘을 기준으로 364일 전이 시작점
    const start = new Date(end)
    start.setDate(end.getDate() - 364)

    // 시작 날짜를 해당 주의 월요일로 보정 (월요일=1, 일요일=0/7 취급)
    const startDay = start.getDay() === 0 ? 7 : start.getDay() // 1..7
    const startMonday = new Date(start)
    startMonday.setDate(start.getDate() - (startDay - 1))

    // 52주 구성, 각 주 7일(월~일)
    for (let w = 0; w < 52; w++) {
      const days: Array<{
        intensity: number
        date: string
        attendance: boolean
        videoWatch: boolean
        fitnessTest: boolean
      }> = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(startMonday)
        date.setDate(startMonday.getDate() + w * 7 + d)
        const dateStr = date.toISOString().split("T")[0]
        const intensity = Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0
        const attendance = intensity > 0
        const videoWatch = Math.random() > 0.4
        const fitnessTest = Math.random() > 0.8
        days.push({ intensity, date: dateStr, attendance, videoWatch, fitnessTest })
      }
      weeks.push(days)
    }
    return weeks
  }

  // 1년치 잔디 데이터는 렌더마다 바뀌지 않도록 메모이즈
  const calendarData = useMemo(() => generateCalendarData(), [])

  // 상단 월 라벨: 각 주의 시작 날짜 기준 월 표시(깃허브 잔디 유사)
  const monthLabels = useMemo(() => {
    const labels: { index: number; text: string }[] = []
    for (let i = 0; i < calendarData.length; i++) {
      const week = calendarData[i]
      if (!week || week.length === 0) continue
      const firstDateStr = week[0].date
      const d = new Date(firstDateStr)
      const month = d.getMonth() + 1
      const text = `${month}월`
      // 월이 바뀌는 경계에서만 라벨 추가
      if (i === 0) {
        labels.push({ index: i, text })
      } else {
        const prevWeek = calendarData[i - 1]
        const prevD = new Date(prevWeek[0].date)
        const prevMonth = prevD.getMonth() + 1
        if (prevMonth !== month) {
          labels.push({ index: i, text })
        }
      }
    }
    return labels
  }, [calendarData])

  // 잔디 상세 표시 상태: 호버 시 보여주고, 클릭하면 고정 토글
  const [activeDetail, setActiveDetail] = useState<null | {
    date: string
    attendance: boolean
    videoWatch: boolean
    fitnessTest: boolean
    intensity: number
  }>(null)
  const [pinnedDate, setPinnedDate] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const todayCellRef = useRef<HTMLDivElement | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    // 기본으로 맨 오른쪽으로 스크롤 고정
    el.scrollLeft = el.scrollWidth
    // 오늘 셀을 우측 끝 기준으로 보이게 스크롤
    if (todayCellRef.current) {
      todayCellRef.current.scrollIntoView({ behavior: "auto", inline: "end", block: "nearest" })
    }
  }, [])

  const recommendedRecipes = [
    {
      id: 1,
      slug: "flexibility-basic",
      recipe_title: "기초 유연성 향상 프로그램",
      category_name: "유연성",
      duration_min: 30,
      fitness_grade: "초급",
      recipe_intro: "전신 유연성을 향상시키는 단계별 스트레칭 프로그램",
      exerciseCount: 8,
    },
    {
      id: 2,
      slug: "lower-body-strength",
      recipe_title: "하체 근력 강화 프로그램",
      category_name: "근력",
      duration_min: 40,
      fitness_grade: "중급",
      recipe_intro: "스쿼트, 런지 등 하체 근력을 집중적으로 강화하는 운동",
      exerciseCount: 10,
    },
    {
      id: 3,
      slug: "full-body-endurance",
      recipe_title: "전신 지구력 훈련",
      category_name: "지구력",
      duration_min: 45,
      fitness_grade: "중급",
      recipe_intro: "유산소와 근력 운동을 결합한 전신 지구력 향상 프로그램",
      exerciseCount: 12,
    },
    {
      id: 4,
      slug: "agility-training",
      recipe_title: "순발력 향상 트레이닝",
      category_name: "순발력",
      duration_min: 35,
      fitness_grade: "초급-중급",
      recipe_intro: "민첩성과 반응속도를 높이는 고강도 인터벌 운동",
      exerciseCount: 9,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary">마이페이지</Badge>
          <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            나의 체력 관리
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">운동 기록과 성과를 확인하세요</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Left Column - Profile & Stats */}
          <div className="space-y-6 lg:col-span-1">
            {/* Profile Card */}
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {displayName?.[0] ?? "유"}
                  </div>
                </div>
                <h3 className="mb-1 text-xl font-bold text-foreground">{displayName}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{displayName}님, 환영합니다!</p>

                <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">체력 등급</span>
                    <Badge className="bg-primary text-primary-foreground">B+</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">지역 순위</span>
                    <span className="font-semibold text-foreground">상위 35%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">연속 출석</span>
                    <span className="font-semibold text-accent">7일</span>
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
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 1, icon: "🔥", badge_info: "7일 연속", earned: true },
                    { id: 2, icon: "⭐", badge_info: "A등급", earned: false },
                    { id: 3, icon: "🏆", badge_info: "지역 1위", earned: false },
                    { id: 4, icon: "💪", badge_info: "30일 완주", earned: false },
                    { id: 5, icon: "🎯", badge_info: "목표 달성", earned: true },
                    { id: 6, icon: "👑", badge_info: "프리미엄", earned: false },
                  ].map((badge) => (
                    <div
                      key={badge.id}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:scale-105 ${
                        badge.earned ? "border-accent/50 bg-accent/5" : "border-border bg-muted/30 opacity-50"
                      }`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-xs font-medium">{badge.badge_info}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="space-y-4">
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">이번 주 운동 영상 시청</span>
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">12회</p>
                  <p className="mt-1 text-xs text-muted-foreground">목표: 주 10회 이상</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Activity */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  운동 활동 기록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto" ref={scrollContainerRef}>
                  {/* 상단 월 라벨 제거: 초기 구조로 복원 */}
                  <div className="relative inline-flex flex-col gap-1">
                    {/* 요일 라벨 제거 */}
                    <div className="flex gap-1">
                      {calendarData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                          {week.map((day, dayIndex) => (
                            <div
                              key={dayIndex}
                              className="relative"
                              ref={(node) => {
                                // 오늘 날짜 셀 참조 저장
                                if (node) {
                                  const todayStr = new Date().toISOString().split("T")[0]
                                  if (day.date === todayStr) {
                                    todayCellRef.current = node
                                  }
                                }
                              }}
                            >
                              <button
                              key={dayIndex}
                              type="button"
                              className={`h-3 w-3 rounded-sm ${
                                day.intensity === 0
                                  ? "bg-muted"
                                  : day.intensity === 1
                                    ? "bg-primary/30"
                                    : day.intensity === 2
                                      ? "bg-primary/60"
                                      : "bg-primary"
                              } transition-colors cursor-pointer`}
                              onMouseEnter={(e) => {
                                // If a date is pinned, ignore hover from other cells
                                if (pinnedDate && pinnedDate !== day.date) return
                                setActiveDetail({
                                  date: day.date,
                                  attendance: day.attendance,
                                  videoWatch: day.videoWatch,
                                  fitnessTest: day.fitnessTest,
                                  intensity: day.intensity,
                                })
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                                setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
                              }}
                              onMouseLeave={() => {
                                // If any date is pinned, do not clear on hover out
                                if (pinnedDate) return
                                setActiveDetail(null)
                                setTooltipPos(null)
                              }}
                              onClick={(e) => {
                                if (pinnedDate === day.date) {
                                  setPinnedDate(null)
                                  setActiveDetail(null)
                                  setTooltipPos(null)
                                } else {
                                  setPinnedDate(day.date)
                                  setActiveDetail({
                                    date: day.date,
                                    attendance: day.attendance,
                                    videoWatch: day.videoWatch,
                                    fitnessTest: day.fitnessTest,
                                    intensity: day.intensity,
                                  })
                                  // Position based on the clicked button
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                                  setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
                                }
                              }}
                              aria-label={`${day.date} 출석 ${day.attendance ? "O" : "X"}, 영상 시청 ${day.videoWatch ? "O" : "X"}, 체력 측정 ${day.fitnessTest ? "O" : "X"}`}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  {activeDetail && tooltipPos && createPortal(
                    <div
                      className="fixed z-[1000] w-max rounded-md border bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-sm"
                      style={{ left: tooltipPos.x, top: tooltipPos.y, transform: "translate(-50%, -100%)" }}
                    >
                      {activeDetail.date} · 출석 {activeDetail.attendance ? "O" : "X"} · 영상 {activeDetail.videoWatch ? "O" : "X"} · 측정 {activeDetail.fitnessTest ? "O" : "X"}
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
                {/* per-cell tooltip handled inline above */}
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Award className="h-6 w-6" />
                  추천 운동 레시피
                </CardTitle>
                <p className="text-sm text-muted-foreground">체력 분석 결과를 바탕으로 당신에게 필요한 운동입니다</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  {recommendedRecipes.map((recipe) => (
                    <Link key={recipe.id} to={`/recipes/${recipe.slug}`}>
                      <Card className="group h-full cursor-pointer overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="mb-4 flex items-start justify-between">
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              {recipe.category_name}
                            </Badge>
                          </div>

                          <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {recipe.recipe_title}
                          </h3>

                          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{recipe.recipe_intro}</p>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{recipe.duration_min}분</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Dumbbell className="h-4 w-4" />
                              <span>{recipe.exerciseCount}개 운동</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground">{recipe.fitness_grade}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <Button className="mt-6 w-full" size="lg" asChild>
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
  )
}
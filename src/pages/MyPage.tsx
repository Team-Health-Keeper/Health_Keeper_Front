"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Award, BookOpen, TrendingUp, Trophy, Clock, Dumbbell } from "lucide-react"
import { Link } from "react-router-dom"
import { SiteHeader } from "@/components/site-header"
import { useEffect, useState } from "react"

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
    const weeks = []
    const today = new Date()

    for (let week = 0; week < 52; week++) {
      const days = []
      for (let day = 0; day < 7; day++) {
        const intensity = Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0
        const date = new Date(today)
        date.setDate(date.getDate() - (51 - week) * 7 - (6 - day))
        const dateStr = date.toISOString().split("T")[0]
        const attendance = intensity > 0
        const videoWatch = Math.random() > 0.4
        const fitnessTest = Math.random() > 0.8
        days.push({
          intensity,
          date: dateStr,
          attendance,
          videoWatch,
          fitnessTest,
        })
      }
      weeks.push(days)
    }
    return weeks
  }

  const calendarData = generateCalendarData()

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

        <div className="grid gap-8 lg:grid-cols-3">
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
                <div className="overflow-x-auto">
                  <div className="inline-flex flex-col gap-1">
                    <div className="flex gap-1">
                      {["월", "화", "수", "목", "금", "토", "일"].map((day, i) => (
                        <div key={i} className="flex w-3 items-center justify-center text-[10px] text-muted-foreground">
                          {i % 2 === 0 ? day : ""}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {calendarData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                          {week.map((day, dayIndex) => (
                            <div
                              key={dayIndex}
                              className={`h-3 w-3 rounded-sm ${
                                day.intensity === 0
                                  ? "bg-muted"
                                  : day.intensity === 1
                                    ? "bg-primary/30"
                                    : day.intensity === 2
                                      ? "bg-primary/60"
                                      : "bg-primary"
                              } transition-all hover:ring-2 hover:ring-primary/50 cursor-pointer`}
                              title={`${day.date} / 출석 ${day.attendance ? "O" : "X"}, 영상 시청 ${day.videoWatch ? "O" : "X"}, 체력 측정 ${day.fitnessTest ? "O" : "X"}`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
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
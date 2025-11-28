"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowLeft, BookOpen, Calendar, Clock, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"

export default function MyRecipesPage() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("weekly")

  const recipesByPeriod = {
    daily: [
      {
        id: 1,
        title: "아침 스트레칭 루틴",
        duration: "10분",
        level: "초급",
        time: "오전 7:00",
        description: "하루를 시작하는 가벼운 스트레칭으로 몸을 깨워보세요",
        calories: "30kcal",
        category: "유연성",
      },
      {
        id: 2,
        title: "점심 시간 걷기",
        duration: "15분",
        level: "초급",
        time: "오후 12:30",
        description: "식후 가벼운 산책으로 소화를 돕고 활력을 충전하세요",
        calories: "60kcal",
        category: "유산소",
      },
      {
        id: 3,
        title: "저녁 코어 운동",
        duration: "20분",
        level: "중급",
        time: "오후 6:00",
        description: "복부와 허리 근력을 강화하는 코어 집중 운동",
        calories: "120kcal",
        category: "근력",
      },
      {
        id: 4,
        title: "취침 전 요가",
        duration: "15분",
        level: "초급",
        time: "오후 10:00",
        description: "편안한 수면을 위한 릴렉스 요가 루틴",
        calories: "40kcal",
        category: "유연성",
      },
    ],
    weekly: [
      {
        id: 5,
        title: "월요일 - 전신 근력 운동",
        duration: "40분",
        level: "중급",
        time: "주 2회",
        description: "상체와 하체를 골고루 단련하는 전신 근력 프로그램",
        calories: "250kcal",
        category: "근력",
      },
      {
        id: 6,
        title: "화요일 - 유산소 달리기",
        duration: "30분",
        level: "초급-중급",
        time: "주 3회",
        description: "심폐 지구력 향상을 위한 인터벌 러닝",
        calories: "300kcal",
        category: "유산소",
      },
      {
        id: 7,
        title: "수요일 - 하체 집중 트레이닝",
        duration: "35분",
        level: "중급",
        time: "주 2회",
        description: "스쿼트, 런지 등 하체 근력을 집중적으로 강화",
        calories: "280kcal",
        category: "근력",
      },
      {
        id: 8,
        title: "목요일 - HIIT 인터벌",
        duration: "25분",
        level: "중급-고급",
        time: "주 2회",
        description: "고강도 인터벌 트레이닝으로 체력 극대화",
        calories: "350kcal",
        category: "지구력",
      },
      {
        id: 9,
        title: "금요일 - 유연성 스트레칭",
        duration: "20분",
        level: "초급",
        time: "주 3회",
        description: "관절 가동범위를 넓히고 근육을 이완시키는 스트레칭",
        calories: "80kcal",
        category: "유연성",
      },
    ],
    monthly: [
      {
        id: 10,
        title: "1주차 - 기초 체력 다지기",
        duration: "주 5회",
        level: "초급",
        time: "4주 프로그램",
        description: "운동 습관 형성과 기초 체력 향상에 초점",
        calories: "1000kcal/주",
        category: "종합",
      },
      {
        id: 11,
        title: "2주차 - 근력 향상 집중",
        duration: "주 4회",
        level: "중급",
        time: "4주 프로그램",
        description: "웨이트 트레이닝으로 근육량 증가 목표",
        calories: "1200kcal/주",
        category: "근력",
      },
      {
        id: 12,
        title: "3주차 - 지구력 강화",
        duration: "주 4회",
        level: "중급",
        time: "4주 프로그램",
        description: "유산소 운동 중심으로 심폐 기능 향상",
        calories: "1400kcal/주",
        category: "지구력",
      },
      {
        id: 13,
        title: "4주차 - 종합 체력 완성",
        duration: "주 5회",
        level: "중급-고급",
        time: "4주 프로그램",
        description: "근력, 유산소, 유연성을 통합한 최종 단계",
        calories: "1500kcal/주",
        category: "종합",
      },
    ],
  }

  const currentRecipes = recipesByPeriod[activeTab]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="국민체력지키미" className="h-10 w-auto" />
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/my">
              <ArrowLeft className="mr-2 h-4 w-4" />
              마이페이지로
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <Badge className="mb-4 bg-primary/10 text-primary">추천 운동 레시피</Badge>
          <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            맞춤 운동 프로그램
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            체력 분석 결과를 바탕으로 추천된 운동 레시피를 확인하세요
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-2 rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex-1 rounded-md px-6 py-3 text-sm font-medium transition-all ${
              activeTab === "daily"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Calendar className="mb-1 inline-block h-4 w-4" />
            <span className="ml-2">일별 루틴</span>
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 rounded-md px-6 py-3 text-sm font-medium transition-all ${
              activeTab === "weekly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <TrendingUp className="mb-1 inline-block h-4 w-4" />
            <span className="ml-2">주간 프로그램</span>
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex-1 rounded-md px-6 py-3 text-sm font-medium transition-all ${
              activeTab === "monthly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <BookOpen className="mb-1 inline-block h-4 w-4" />
            <span className="ml-2">월간 챌린지</span>
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="group overflow-hidden transition-all hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg"
            >
              <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="outline" className="bg-background/80 text-primary">
                    {recipe.level}
                  </Badge>
                  <Badge variant="secondary" className="bg-background/80">
                    {recipe.category}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary">{recipe.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-sm text-muted-foreground">{recipe.description}</p>

                <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      소요 시간
                    </span>
                    <span className="font-semibold text-foreground">{recipe.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      소모 칼로리
                    </span>
                    <span className="font-semibold text-foreground">{recipe.calories}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      권장 빈도
                    </span>
                    <span className="font-semibold text-foreground">{recipe.time}</span>
                  </div>
                </div>

                <Button className="mt-4 w-full bg-transparent" variant="outline" asChild>
                  <Link to={`/recipes`}>자세히 보기</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="inline-block border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <h3 className="mb-2 text-xl font-bold text-foreground">더 많은 운동이 필요하신가요?</h3>
              <p className="mb-4 text-muted-foreground">다양한 운동 레시피를 확인하고 나만의 루틴을 만들어보세요</p>
              <Button size="lg" asChild>
                <Link to="/recipes">
                  <BookOpen className="mr-2 h-5 w-5" />
                  전체 레시피 둘러보기
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
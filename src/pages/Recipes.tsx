"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Activity, Clock, Search, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function RecipesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [selectedCategory, setSelectedCategory] = useState("전체")

  const categories = ["전체", "유연성", "근력", "지구력", "순발력", "균형", "심폐지구력"]

  const recipes = [
    {
      id: 1,
      slug: "flexibility-basic",
      recipe_title: "기초 유연성 향상 프로그램",
      category_id: 1,
      category_name: "유연성",
      duration_min: 30,
      fitness_grade: "초급",
      difficulty: "초급",
      recipe_intro: "전신 유연성을 향상시키는 단계별 스트레칭 프로그램",
      exerciseCount: 8,
    },
    {
      id: 2,
      slug: "lower-body-strength",
      recipe_title: "하체 근력 강화 프로그램",
      category_id: 2,
      category_name: "근력",
      duration_min: 40,
      fitness_grade: "중급",
      difficulty: "중급",
      recipe_intro: "스쿼트, 런지 등 하체 근력을 집중적으로 강화하는 운동",
      exerciseCount: 10,
    },
    {
      id: 3,
      slug: "full-body-endurance",
      recipe_title: "전신 지구력 훈련",
      category_id: 3,
      category_name: "지구력",
      duration_min: 45,
      fitness_grade: "중급",
      difficulty: "중급",
      recipe_intro: "유산소와 근력 운동을 결합한 전신 지구력 향상 프로그램",
      exerciseCount: 12,
    },
    {
      id: 4,
      slug: "agility-training",
      recipe_title: "순발력 향상 트레이닝",
      category_id: 4,
      category_name: "순발력",
      duration_min: 35,
      fitness_grade: "초급-중급",
      difficulty: "중급",
      recipe_intro: "민첩성과 반응속도를 높이는 고강도 인터벌 운동",
      exerciseCount: 9,
    },
    {
      id: 5,
      slug: "core-strength",
      recipe_title: "코어 근력 집중 운동",
      category_id: 5,
      category_name: "근력",
      duration_min: 30,
      fitness_grade: "중급",
      difficulty: "중급",
      recipe_intro: "복부와 허리 주변 근육을 강화하는 코어 운동",
      exerciseCount: 7,
    },
    {
      id: 6,
      slug: "cardio-interval",
      recipe_title: "심폐 지구력 인터벌",
      category_id: 6,
      category_name: "심폐지구력",
      duration_min: 40,
      fitness_grade: "고급",
      difficulty: "고급",
      recipe_intro: "고강도 유산소 운동으로 심폐 기능을 향상시키는 프로그램",
      exerciseCount: 11,
    },
    {
      id: 7,
      slug: "balance-improvement",
      recipe_title: "균형감각 향상 운동",
      category_id: 7,
      category_name: "균형",
      duration_min: 25,
      fitness_grade: "초급",
      difficulty: "초급",
      recipe_intro: "중심 잡기와 안정성을 높이는 균형 운동",
      exerciseCount: 6,
    },
    {
      id: 8,
      slug: "upper-body-strength",
      recipe_title: "상체 근력 프로그램",
      category_id: 8,
      category_name: "근력",
      duration_min: 35,
      fitness_grade: "중급",
      difficulty: "중급",
      recipe_intro: "팔, 어깨, 가슴 근육을 발달시키는 상체 운동",
      exerciseCount: 8,
    },
  ]

  const filteredRecipes =
    selectedCategory === "전체" ? recipes : recipes.filter((r) => r.category_name === selectedCategory)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <Badge className="mb-4 bg-accent/10 text-accent">운동 레시피</Badge>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            맞춤형 운동 레시피
          </h1>
          <p className="text-pretty text-lg text-muted-foreground mx-auto max-w-2xl">
            체력 부위별, 목적별로 분류된 다양한 운동 프로그램을 만나보세요
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-10 space-y-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="운동 레시피 검색..." className="pl-11 h-12 text-base" />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                  category === selectedCategory
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <Link key={recipe.id} to={`/recipes/${recipe.slug}`}>
              <Card className="group h-full cursor-pointer overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <Badge className="bg-primary/10 text-primary border-primary/20">{recipe.category_name}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {recipe.difficulty === "easy" && "⭐"}
                      {recipe.difficulty === "medium" && "⭐⭐"}
                      {recipe.difficulty === "hard" && "⭐⭐⭐"}
                    </div>
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
                      <Activity className="h-4 w-4" />
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

        {/* CTA Section */}
        <Card className="mt-16 border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">아직 체력 측정을 하지 않으셨나요?</h3>
              <p className="text-muted-foreground">AI 분석으로 당신에게 가장 필요한 운동을 추천받으세요</p>
            </div>
            <Button size="lg" asChild className="h-12 px-8">
              <Link to="/assessment">
                <Activity className="mr-2 h-5 w-5" />
                체력 측정 시작하기
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <SiteFooter />
    </div>
  )
}
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
import { HeroSection } from "@/components/common/HeroSection"

export default function RecipesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(9)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiRecipes, setApiRecipes] = useState<Array<{
    id: number
    recipe_title: string
    recipe_intro: string
    difficulty?: string
    duration_min?: number
    card_count?: number
    slug?: string
    category_name?: string
  }>>([])
  const [totalPages, setTotalPages] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [count, setCount] = useState(0)

  const categories = ["전체", "유연성", "근력", "지구력", "순발력", "균형", "심폐지구력"]

  // API 결과에 카테고리 필터 적용(클라이언트 측)
  const filteredApiRecipes =
    selectedCategory === "전체" ? apiRecipes : apiRecipes.filter((r) => r.category_name === selectedCategory)

  // Fetch recipes from backend with debounce for search
  useEffect(() => {
    let ignore = false
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", String(limit))
        if (search.trim()) params.set("recipe_title", search.trim())
        const token = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null
        const res = await fetch(`http://localhost:3001/api/recipes?${params.toString()}`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            signal: controller.signal,
          }
        )
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const data = await res.json()
        if (ignore) return
        const list = Array.isArray(data?.data) ? data.data : []
        setApiRecipes(list)
        setCount(Number(data?.count ?? list.length))
        setTotalPages(Number(data?.totalPages ?? 1))
        setHasNextPage(Boolean(data?.hasNextPage ?? false))
      } catch (err: any) {
        if (err?.name === 'AbortError') return
        console.error('Failed to fetch recipes:', err)
        if (!ignore) {
          setError('레시피 목록을 불러오지 못했습니다.')
          setApiRecipes([])
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }, 350)

    return () => {
      ignore = true
      controller.abort()
      clearTimeout(timer)
    }
  }, [page, limit, search])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SiteHeader />

      <HeroSection
        badgeIcon={Activity}
        badgeText="운동 레시피"
        title="맞춤형"
        highlight="운동 레시피"
        description="체력 부위별, 목적별로 분류된 다양한 운동 프로그램을 만나보세요"
        centered
        className="py-12"
      />

      <div className="mx-auto max-w-6xl px-4 py-12">

        {/* Search and Filter */}
        <div className="mb-10 space-y-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="운동 레시피 검색..."
              className="pl-11 h-12 text-base"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
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

        {/* Results Grid */}
        {loading && (
          <div className="py-10 text-center text-muted-foreground">불러오는 중...</div>
        )}
        {!loading && error && (
          <div className="py-10 text-center text-destructive">{error}</div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApiRecipes.map((recipe: any) => {
            // 항상 id 기반 상세 페이지로 이동
            const linkTo = `/recipes/${recipe.id}`
            const duration = recipe.duration_min ?? recipe.durationMin ?? recipe.duration ?? undefined
            const exerciseCount = recipe.card_count ?? recipe.exerciseCount
            const categoryName = recipe.category_name ?? recipe.categoryName ?? ""
            return (
              <Link key={recipe.id} to={linkTo}>
                <Card className="group h-full cursor-pointer overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <Badge className="bg-primary/10 text-primary border-primary/20">{categoryName || '운동'}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground" />
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {recipe.recipe_title}
                    </h3>

                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{recipe.recipe_intro}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      {duration !== undefined && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{duration}분</span>
                        </div>
                      )}
                      {exerciseCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          <span>{exerciseCount}개 운동</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{recipe.difficulty}</span>
                    </div>

                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Pagination (only when API returned results) */}
        {apiRecipes.length > 0 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              이전
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={!hasNextPage || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        )}

        {/* Empty state when no results */}
        {!loading && !error && filteredApiRecipes.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            표시할 레시피가 없습니다. 검색어나 카테고리를 변경해 보세요.
          </div>
        )}

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
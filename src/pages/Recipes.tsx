"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { RecipeFilterBar } from "@/components/recipe/RecipeFilterBar"
import { RecipeCard } from "@/components/recipe/RecipeCard"
import { RecipePagination } from "@/components/recipe/RecipePagination"
import { ApiRecipe } from "@/components/recipe/types"
import { LoadingState } from "@/components/common/LoadingState"
import { EmptyState } from "@/components/common/EmptyState"
import { getApiBase, apiFetch } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/common/HeroSection"
import { LoginModal } from "@/components/login-modal"
import { useAuth } from "@/hooks/useAuth"

export default function RecipesPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { isAuthenticated, login } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) {
      setLoginModalOpen(true)
    }
  }, [isAuthenticated])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(9)
  const [forMe, setForMe] = useState<'Y' | 'N'>('N') // 전체 보기: N, 내 레시피: Y
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiRecipes, setApiRecipes] = useState<ApiRecipe[]>([])
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
        params.set("for_me", forMe)
        if (search.trim()) params.set("recipe_title", search.trim())
        const token = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null
        const data = await apiFetch<any>(`/api/recipes?${params.toString()}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        })
        if (ignore) return
        const list: ApiRecipe[] = Array.isArray(data?.data) ? data.data : []
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
  }, [page, limit, search, forMe])

  if (loginModalOpen && !isAuthenticated) {
    return (
      <>
        <SiteHeader />
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={(data) => {
            login(data);
            setLoginModalOpen(false);
          }}
        />
      </>
    )
  }

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

        <RecipeFilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={(c) => { setPage(1); setSelectedCategory(c) }}
          search={search}
          onSearchChange={(v) => { setPage(1); setSearch(v) }}
          forMe={forMe}
          onToggleForMe={() => { setPage(1); setForMe(prev => prev === 'Y' ? 'N' : 'Y') }}
        />

        {/* Results Grid */}
        {loading && <LoadingState className="py-10" />}
        {!loading && error && <EmptyState message={error} className="py-10" />}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApiRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        {/* Pagination (only when API returned results) */}
        <RecipePagination
          show={apiRecipes.length > 0}
          page={page}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          loading={loading}
          onPrev={() => setPage(p => Math.max(1, p - 1))}
          onNext={() => setPage(p => p + 1)}
        />

        {/* Empty state when no results */}
        {!loading && !error && filteredApiRecipes.length === 0 && (
          <EmptyState message="표시할 레시피가 없습니다. 검색어나 카테고리를 변경해 보세요." className="py-12" />
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
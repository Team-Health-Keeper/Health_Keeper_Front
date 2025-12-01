"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, Play, TrendingUp } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { YoutubeModal } from "@/components/youtube-modal"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

interface RecipeExercise {
  exercise_name: string
  description: string
  video_url: string
  image_url?: string | null
  video_duration?: number | null
  fitness_category?: string | null
  equipment?: string | null
  body_part?: string | null
  target_audience?: string | null
  phase?: 'warmup' | 'main' | 'cooldown' | string | null // 새 API에 단계 정보가 있다면 사용
}

interface RecipeDetailResponse {
  success: boolean
  recipe_title: string
  recipe_intro: string
  difficulty: string // "초급" | "중급" | "고급" 중 하나라고 가정
  duration_min: number
  card_count: number
  category?: string | null // API에 카테고리 값이 있으면 사용, 없으면 숨김
  // 신규 스키마
  warm_up_cards?: RecipeExercise[]
  main_cards?: RecipeExercise[]
  cool_down_cards?: RecipeExercise[]
  // 구 스키마 호환
  data?: RecipeExercise[]
}

function extractYouTubeId(input: string): string {
  try {
    const trimmed = (input || "").trim()
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
    const u = new URL(trimmed)
    // youtu.be short links
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").split("/")[0]
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : ""
    }
    // watch?v=ID
    if (u.searchParams.has("v")) {
      const id = u.searchParams.get("v") || ""
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : ""
    }
    // embed/ID
    if (u.pathname.includes("/embed/")) {
      const id = u.pathname.split("/embed/")[1]?.split("/")[0] || ""
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : ""
    }
    // shorts/ID
    if (u.pathname.includes("/shorts/")) {
      const id = u.pathname.split("/shorts/")[1]?.split("/")[0] || ""
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : ""
    }
    return ""
  } catch (_) {
    return ""
  }
}

export default function RecipeDetailPage() {
  const params = useParams()
  const idParam = params?.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<{
    recipe_title: string
    recipe_intro: string
    difficulty: string
    duration_min: number
    card_count: number
    category?: string | null
  } | null>(null)
  const [exercises, setExercises] = useState<RecipeExercise[]>([])
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; videoId: string } | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let ignore = false
    const controller = new AbortController()
    async function fetchDetail() {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null
        const res = await fetch(`http://localhost:3001/api/recipes/${idParam}`, {
          headers: {
            "Accept": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: RecipeDetailResponse = await res.json()
        if (ignore) return
        if (!data.success) throw new Error("API returned success=false")
        setMeta({
          recipe_title: data.recipe_title,
          recipe_intro: data.recipe_intro,
          difficulty: data.difficulty,
          duration_min: data.duration_min,
          card_count: data.card_count,
          category: data.category ?? null,
        })
        // 새 스키마(warm_up_cards/main_cards/cool_down_cards) 우선 사용, 없으면 구 스키마(data) 사용
        const warm = Array.isArray(data.warm_up_cards) ? data.warm_up_cards.map((e) => ({ ...e, phase: 'warmup' as const })) : []
        const main = Array.isArray(data.main_cards) ? data.main_cards.map((e) => ({ ...e, phase: 'main' as const })) : []
        const cool = Array.isArray(data.cool_down_cards) ? data.cool_down_cards.map((e) => ({ ...e, phase: 'cooldown' as const })) : []
        if (warm.length + main.length + cool.length > 0) {
          setExercises([...warm, ...main, ...cool])
        } else {
          setExercises(Array.isArray(data.data) ? data.data : [])
        }
      } catch (e: any) {
        if (!ignore) setError(e.message || "레시피를 불러오지 못했습니다")
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    if (idParam) fetchDetail()
    return () => {
      ignore = true
      controller.abort()
    }
  }, [idParam])

  const openVideo = (ex: RecipeExercise) => {
    const vid = extractYouTubeId(ex.video_url)
    if (!vid) return
    const idx = playlist.findIndex((p) => p.videoId === vid)
    if (idx !== -1) setCurrentIndex(idx)
    setSelectedVideo({ title: ex.exercise_name, videoId: vid })
  }

  // 섹션 분류 (phase 값이 없다면 전부 main 으로 간주)
  const warmupExercises = exercises.filter(e => (e.phase || 'main') === 'warmup')
  const mainExercises = exercises.filter(e => (e.phase || 'main') === 'main')
  const cooldownExercises = exercises.filter(e => (e.phase || 'main') === 'cooldown')

  // phase 정보가 전혀 없다면 한 번만 전체를 본운동으로 보여주기 위한 플래그
  const hasPhaseInfo = exercises.some(e => !!e.phase)

  const formatDurationText = (min: number | undefined) => (typeof min === 'number' && min > 0 ? `${min}분` : '-')
  const formatVideoDuration = (sec?: number | null) => {
    if (!sec || sec <= 0) return null
    if (sec < 60) return `${sec}초`
    const m = Math.round(sec / 60)
    return `${m}분`
  }

  const totalExercises = exercises.length
  const startFirstVideo = () => {
    const first = warmupExercises[0] || mainExercises[0] || cooldownExercises[0] || exercises[0]
    if (first) openVideo(first)
  }

  // 플레이리스트 구성: 준비운동 → 본운동 → 정리운동 순 (phase 없으면 전체)
  type PlaylistItem = { name: string; videoId: string; duration?: string }
  const orderedForPlaylist: RecipeExercise[] = hasPhaseInfo
    ? [...warmupExercises, ...mainExercises, ...cooldownExercises]
    : exercises
  const playlist: PlaylistItem[] = orderedForPlaylist
    .map((ex) => ({
      name: ex.exercise_name,
      videoId: extractYouTubeId(ex.video_url),
      duration: formatVideoDuration(ex.video_duration) || undefined,
    }))
    .filter((p) => !!p.videoId)

  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {loading && (
          <div className="py-20 text-center text-muted-foreground">불러오는 중...</div>
        )}
        {!loading && error && (
          <div className="py-20 text-center">
            <p className="mb-6 text-destructive font-medium">{error}</p>
            <Button asChild>
              <Link to="/recipes">목록으로 돌아가기</Link>
            </Button>
          </div>
        )}

        {!loading && !error && meta && (
          <>
            <div className="mb-10">
              {meta.category && (
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{meta.category}</Badge>
              )}
              <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground">
                {meta.recipe_title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">{meta.recipe_intro}</p>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">총 소요시간</span>
                  <span className="text-muted-foreground">{formatDurationText(meta.duration_min)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">난이도</span>
                  <span className="text-muted-foreground">{meta.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">운동 개수</span>
                  <span className="text-muted-foreground">{totalExercises}개</span>
                </div>
              </div>
            </div>

            {/* 준비 운동 섹션 */}
            {hasPhaseInfo && warmupExercises.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-1 bg-green-500 rounded-full" />
                  <h2 className="text-2xl font-bold text-foreground">준비 운동</h2>
                  <Badge variant="secondary">{warmupExercises.length}개</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {warmupExercises.map((ex, idx) => (
                    <ExerciseCard key={`warmup-${idx}`} ex={ex} onOpen={openVideo} />
                  ))}
                </div>
              </section>
            )}

            {/* 본 운동 섹션 (phase 정보 없으면 전체를 본운동으로 표시) */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-1 bg-primary rounded-full" />
                <h2 className="text-2xl font-bold text-foreground">본 운동</h2>
                <Badge variant="secondary">{hasPhaseInfo ? mainExercises.length : totalExercises}개</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(hasPhaseInfo ? mainExercises : exercises).map((ex, idx) => (
                  <ExerciseCard key={`main-${idx}`} ex={ex} onOpen={openVideo} />
                ))}
              </div>
            </section>

            {/* 마무리 운동 섹션 */}
            {hasPhaseInfo && cooldownExercises.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-1 bg-blue-500 rounded-full" />
                  <h2 className="text-2xl font-bold text-foreground">마무리 운동</h2>
                  <Badge variant="secondary">{cooldownExercises.length}개</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {cooldownExercises.map((ex, idx) => (
                    <ExerciseCard key={`cooldown-${idx}`} ex={ex} onOpen={openVideo} />
                  ))}
                </div>
              </section>
            )}

            {/* 시작 버튼 */}
            <div className="flex justify-center">
              <Button size="lg" className="h-12 px-8" onClick={startFirstVideo} disabled={exercises.length === 0}>
                <Activity className="mr-2 h-5 w-5" />
                운동 시작하기
              </Button>
            </div>
          </>
        )}
      </div>

      <SiteFooter />
      {selectedVideo && (
        <YoutubeModal
          title={selectedVideo.title}
          videoId={selectedVideo.videoId}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          playlist={playlist}
          currentIndex={currentIndex}
          onNavigate={(idx) => {
            if (idx >= 0 && idx < playlist.length) {
              setCurrentIndex(idx)
              const item = playlist[idx]
              setSelectedVideo({ title: item.name, videoId: item.videoId })
            }
          }}
        />
      )}
    </div>
  )
}

// 카드 컴포넌트 분리 (원래 스타일 유지)
function ExerciseCard({ ex, onOpen }: { ex: RecipeExercise; onOpen: (ex: RecipeExercise) => void }) {
  const vidId = extractYouTubeId(ex.video_url)
  const thumb = ex.image_url || (vidId ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` : undefined)
  const videoDurText = formatVideoDuration(ex.video_duration)

  return (
    <Card
      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm group cursor-pointer border-border transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
      onClick={() => onOpen(ex)}
    >
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {thumb && (
          <img
            alt={ex.exercise_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={thumb}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <Play className="h-6 w-6" />
          </div>
        </div>
        {videoDurText && (
          <Badge className="absolute top-2 right-2 bg-black/60 text-white border-0">
            <Clock className="mr-1 h-3 w-3" />
            {videoDurText}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-3 text-lg">
          {ex.exercise_name}
        </h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {ex.fitness_category && (
            <Badge variant="outline" className="text-xs">
              {ex.fitness_category}
            </Badge>
          )}
          {ex.equipment && (
            <Badge variant="outline" className="text-xs">
              {ex.equipment}
            </Badge>
          )}
          {ex.body_part && (
            <Badge variant="outline" className="text-xs">
              {ex.body_part}
            </Badge>
          )}
        </div>
        {ex.target_audience && (
          <p className="text-xs text-muted-foreground mb-2">
            <span className="font-semibold">대상:</span> {ex.target_audience}
          </p>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2">{ex.description}</p>
      </CardContent>
    </Card>
  )
}

// 헬퍼: 비디오 시간 포맷 (ExerciseCard에서 사용)
function formatVideoDuration(sec?: number | null) {
  if (!sec || sec <= 0) return null
  if (sec < 60) return `${sec}초`
  const m = Math.round(sec / 60)
  return `${m}분`
}
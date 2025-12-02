"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, Play, TrendingUp } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { YoutubeModal } from "@/components/youtube-modal"
import { getApiBase, apiFetch } from "@/lib/utils"
import { RecipeMetaHeader } from "@/components/recipe/RecipeMetaHeader"
import { ExerciseVideoCard } from "@/components/recipe/ExerciseVideoCard"
import { ExercisePhaseSection } from "@/components/recipe/ExercisePhaseSection"
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
        const data: RecipeDetailResponse = await apiFetch<RecipeDetailResponse>(`/api/recipes/${idParam}`, {
          headers: {
            "Accept": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        })
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

  const openVideo = (ex: RecipeExercise, preferredIndex?: number) => {
    const vid = extractYouTubeId(ex.video_url)
    if (!vid && typeof preferredIndex !== 'number') return
    let idx = typeof preferredIndex === 'number' ? preferredIndex : playlist.findIndex((p) => p.videoId === vid)
    if (idx < 0) idx = 0
    setCurrentIndex(idx)
    const item = playlist[idx]
    setSelectedVideo({ title: ex.exercise_name, videoId: item?.videoId || vid })
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

  // 유튜브 모달 열릴 때(또는 모달 내에서 다른 영상으로 전환될 때) 시청 이벤트 로깅
  useEffect(() => {
    if (!selectedVideo || !selectedVideo.videoId) return
    const controller = new AbortController()
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    (async () => {
      try {
        await apiFetch(`/api/recipes/watch`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            recipe_id: idParam,
            video_id: selectedVideo.videoId,
            title: selectedVideo.title,
          }),
          signal: controller.signal,
        })
      } catch (_) {
        // 로깅 실패는 UI에 영향 주지 않음
      }
    })()
    return () => controller.abort()
  }, [selectedVideo?.videoId])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mx-auto max-w-4xl">
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
              <RecipeMetaHeader
                category={meta.category}
                title={meta.recipe_title}
                intro={meta.recipe_intro}
                difficulty={meta.difficulty}
                durationMin={meta.duration_min}
                totalExercises={totalExercises}
              />

              {hasPhaseInfo && warmupExercises.length > 0 && (
                <ExercisePhaseSection
                  title="준비 운동"
                  color="green"
                  count={warmupExercises.length}
                  gridClassName="grid gap-4 sm:grid-cols-2"
                >
                  {warmupExercises.map((ex, idx) => {
                    const vidId = extractYouTubeId(ex.video_url)
                    const thumb = ex.image_url || (vidId ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` : undefined)
                    const durationText = formatVideoDuration(ex.video_duration)
                    return (
                      <ExerciseVideoCard
                        key={`warmup-${idx}`}
                        exercise={{
                          name: ex.exercise_name,
                          description: ex.description,
                          videoId: vidId,
                          thumbUrl: thumb,
                          durationText,
                          fitnessCategory: ex.fitness_category || undefined,
                          equipment: ex.equipment || undefined,
                          bodyPart: ex.body_part || undefined,
                          targetAge: ex.target_audience || undefined,
                        }}
                        onOpen={() => openVideo(ex, idx)}
                      />
                    )
                  })}
                </ExercisePhaseSection>
              )}

              <ExercisePhaseSection
                title="본 운동"
                color="primary"
                count={hasPhaseInfo ? mainExercises.length : totalExercises}
              >
                {(hasPhaseInfo ? mainExercises : exercises).map((ex, idx) => {
                  const vidId = extractYouTubeId(ex.video_url)
                  const thumb = ex.image_url || (vidId ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` : undefined)
                  const durationText = formatVideoDuration(ex.video_duration)
                  const offset = hasPhaseInfo ? warmupExercises.length : 0
                  return (
                    <ExerciseVideoCard
                      key={`main-${idx}`}
                      exercise={{
                        name: ex.exercise_name,
                        description: ex.description,
                        videoId: vidId,
                        thumbUrl: thumb,
                        durationText,
                        fitnessCategory: ex.fitness_category || undefined,
                        equipment: ex.equipment || undefined,
                        bodyPart: ex.body_part || undefined,
                        targetAge: ex.target_audience || undefined,
                      }}
                      onOpen={() => openVideo(ex, offset + idx)}
                    />
                  )
                })}
              </ExercisePhaseSection>

              {hasPhaseInfo && cooldownExercises.length > 0 && (
                <ExercisePhaseSection
                  title="마무리 운동"
                  color="blue"
                  count={cooldownExercises.length}
                  gridClassName="grid gap-4 sm:grid-cols-2"
                >
                  {cooldownExercises.map((ex, idx) => {
                    const vidId = extractYouTubeId(ex.video_url)
                    const thumb = ex.image_url || (vidId ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` : undefined)
                    const durationText = formatVideoDuration(ex.video_duration)
                    const offset = warmupExercises.length + mainExercises.length
                    return (
                      <ExerciseVideoCard
                        key={`cooldown-${idx}`}
                        exercise={{
                          name: ex.exercise_name,
                          description: ex.description,
                          videoId: vidId,
                          thumbUrl: thumb,
                          durationText,
                          fitnessCategory: ex.fitness_category || undefined,
                          equipment: ex.equipment || undefined,
                          bodyPart: ex.body_part || undefined,
                          targetAge: ex.target_audience || undefined,
                        }}
                        onOpen={() => openVideo(ex, offset + idx)}
                      />
                    )
                  })}
                </ExercisePhaseSection>
              )}

              <div className="flex justify-center">
                <Button size="lg" className="h-12 px-8" onClick={startFirstVideo} disabled={exercises.length === 0}>
                  <Activity className="mr-2 h-5 w-5" />
                  운동 시작하기
                </Button>
              </div>
            </>
          )}
        </div>
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

function formatVideoDuration(sec?: number | null) {
  if (!sec || sec <= 0) return null
  if (sec < 60) return `${sec}초`
  const m = Math.round(sec / 60)
  return `${m}분`
}
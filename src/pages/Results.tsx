"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/common/HeroSection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, TrendingUp, Activity, ArrowRight, BookOpen } from "lucide-react"
import { YouTubeModal } from "@/components/youtube-modal"
import { RecipeMetaHeader } from "@/components/recipe/RecipeMetaHeader"
import { GradeResultCard } from "@/components/recipe/GradeResultCard"
import { ExerciseVideoCard, ExerciseCommon } from "@/components/recipe/ExerciseVideoCard"
import { ExercisePhaseSection } from "@/components/recipe/ExercisePhaseSection"

interface MappedRecipe {
  meta: {
    title: string
    intro: string
    difficulty: string
    durationMin: number | null
    fitnessGrade: string
    percentile: number | null
  }
  warmup: ExerciseCommon[]
  main: ExerciseCommon[]
  cooldown: ExerciseCommon[]
}

function parseDuration(raw: string | undefined | null): string | null {
  if (!raw) return null
  const parts = raw.split(":").map(p => p.trim()).filter(Boolean)
  if (parts.length === 1) {
    const m = Number(parts[0])
    return Number.isFinite(m) ? `${m}분` : raw
  }
  if (parts.length === 2) {
    const m = Number(parts[0])
    const s = Number(parts[1])
    if (Number.isFinite(m) && Number.isFinite(s)) return `${m}분 ${s}초`
    return raw
  }
  if (parts.length === 3) {
    const h = Number(parts[0])
    const m = Number(parts[1])
    const s = Number(parts[2])
    if ([h, m, s].every(Number.isFinite)) {
      const seg: string[] = []
      if (h > 0) seg.push(`${h}시간`)
      if (m > 0) seg.push(`${m}분`)
      if (s > 0) seg.push(`${s}초`)
      return seg.join(' ')
    }
    return raw
  }
  return raw
}

function extractVideoId(urlStr: string | undefined | null): string {
  if (!urlStr) return ""
  try {
    const url = new URL(urlStr)
    if (url.hostname.includes("youtu")) {
      if (url.searchParams.get("v")) return url.searchParams.get("v") || ""
      const pathParts = url.pathname.split("/").filter(Boolean)
      return pathParts[pathParts.length - 1] || ""
    }
    // fallback: last path segment
    const seg = url.pathname.split("/").filter(Boolean).pop()
    return seg || ""
  } catch {
    return ""
  }
}

function mapAnalysis(raw: any): MappedRecipe | null {
  if (!raw || typeof raw !== 'object') return null
  const percentileCandidate = [
    raw.fitness_percentile,
    raw.grade_percentile,
    raw.percentile,
    raw.fitnessPercentile,
  ].find(v => typeof v === 'number' && v >= 0 && v <= 100) ?? null

  const mapArray = (arr: any): ExerciseCommon[] => {
    if (!Array.isArray(arr)) return []
    return arr.map((c: any): ExerciseCommon => {
      const videoId = extractVideoId(c.video_url)
      return {
        name: c.name || c.exercise_name || '운동',
        description: c.description || c.summary || '설명이 제공되지 않았습니다.',
        videoId,
        thumbUrl: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null,
        durationText: parseDuration(c.video_duration || c.duration),
        fitnessCategory: c.category || c.fitness_category || null,
        equipment: c.equipment || null,
        bodyPart: c.body_part || c.bodyPart || null,
        targetAge: c.target_age || null,
      }
    })
  }

  return {
    meta: {
      title: raw.recipe_title || '맞춤 운동 레시피',
      intro: raw.recipe_intro || raw.intro || '분석 결과를 기반으로 구성된 개인 맞춤형 루틴입니다.',
      difficulty: raw.difficulty || '초급',
      durationMin: typeof raw.duration_min === 'number' ? raw.duration_min : null,
      fitnessGrade: raw.fitness_grade || raw.grade || '참가',
      percentile: percentileCandidate,
    },
    warmup: mapArray(raw.warmup_exercises || raw.warmup || []),
    main: mapArray(raw.main_exercises || raw.main || []),
    cooldown: mapArray(raw.cooldown_exercises || raw.cooldown || []),
  }
}

export default function Results() {
  const [analysis, setAnalysis] = useState<MappedRecipe | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<ExerciseCommon | null>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('analysisResult')
      if (stored) {
        const raw = JSON.parse(stored)
        setAnalysis(mapAnalysis(raw))
      }
    } catch (e) {
      console.error('Failed to parse analysisResult', e)
    }
  }, [])

  // Fallback content if no analysis present
  const fallback: MappedRecipe = {
    meta: {
      title: '기초 유연성 향상 프로그램',
      intro: '전신 유연성을 단계적으로 향상시키는 스트레칭 루틴입니다.',
      difficulty: '초급',
      durationMin: 30,
      fitnessGrade: '참가',
      percentile: null,
    },
    warmup: [],
    main: [],
    cooldown: [],
  }

  const data = analysis || fallback
  const allExercises = [...data.warmup, ...data.main, ...data.cooldown]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HeroSection
        badgeIcon={Award}
        badgeText="분석 완료"
        title="체력 등급"
        highlight="분석 결과"
        description="AI가 당신의 체력을 분석했습니다"
        centered
        className="py-12"
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <GradeResultCard grade={data.meta.fitnessGrade} percentile={data.meta.percentile} />

          {/* 간단 강점/개선 (Placeholder – 실제 데이터 연동 시 대체) */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />강점
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-primary">•</span><span className="text-muted-foreground">근력: 우수</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary">•</span><span className="text-muted-foreground">지구력: 양호</span></li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />개선 필요
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-accent">•</span><span className="text-muted-foreground">유연성: 보통</span></li>
                  <li className="flex items-start gap-2"><span className="text-accent">•</span><span className="text-muted-foreground">순발력: 보통</span></li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />전체 순위
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="mb-1 text-3xl font-bold text-primary">{data.meta.percentile != null ? `${data.meta.percentile}%` : '35%'}</p>
                  <p className="text-sm text-muted-foreground">상위 랭킹</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <RecipeMetaHeader
                category={data.meta.fitnessGrade || '맞춤 레시피'}
                title={data.meta.title}
                intro={data.meta.intro}
                durationMin={data.meta.durationMin}
                difficulty={data.meta.difficulty}
                totalExercises={data.warmup.length + data.main.length + data.cooldown.length}
              />

              {data.warmup.length > 0 && (
                <ExercisePhaseSection title="준비운동" color="green" count={data.warmup.length} gridClassName="grid gap-4 sm:grid-cols-2">
                  {data.warmup.map(ex => (
                    <ExerciseVideoCard key={ex.videoId + ex.name} exercise={ex} onOpen={setSelectedVideo} />
                  ))}
                </ExercisePhaseSection>
              )}
              {data.main.length > 0 && (
                <ExercisePhaseSection title="본운동" color="primary" count={data.main.length}>
                  {data.main.map(ex => (
                    <ExerciseVideoCard key={ex.videoId + ex.name} exercise={ex} onOpen={setSelectedVideo} />
                  ))}
                </ExercisePhaseSection>
              )}
              {data.cooldown.length > 0 && (
                <ExercisePhaseSection title="정리운동" color="blue" count={data.cooldown.length} gridClassName="grid gap-4 sm:grid-cols-2">
                  {data.cooldown.map(ex => (
                    <ExerciseVideoCard key={ex.videoId + ex.name} exercise={ex} onOpen={setSelectedVideo} />
                  ))}
                </ExercisePhaseSection>
              )}
              {allExercises.length === 0 && (
                <p className="text-sm text-muted-foreground">추천 운동 데이터가 아직 없습니다.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5 mb-16">
            <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:flex-row md:justify-between md:text-left">
              <div>
                <h3 className="mb-2 text-xl font-bold text-foreground">지금 바로 운동을 시작하세요!</h3>
                <p className="text-sm text-muted-foreground">맞춤형 운동 레시피와 주변 시설 정보를 확인하세요</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/recipes">
                    <BookOpen className="mr-2 h-4 w-4" />운동 레시피 보기
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/facilities">주변 시설 찾기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedVideo && (
        <YouTubeModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          title={selectedVideo.name}
          videoId={selectedVideo.videoId}
          playlist={allExercises.map(ex => ({ name: ex.name, videoId: ex.videoId }))}
          currentIndex={allExercises.findIndex(ex => ex.videoId === selectedVideo.videoId)}
          onNavigate={(nextIdx) => {
            if (nextIdx < 0 || nextIdx >= allExercises.length) return
            setSelectedVideo(allExercises[nextIdx])
          }}
        />
      )}
    </div>
  )
}
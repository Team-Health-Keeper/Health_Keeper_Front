"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowRight, Award, BookOpen, TrendingUp, Play, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import { YouTubeModal } from "@/components/youtube-modal"

const recipesData: Record<string, any> = {
  "flexibility-basic": {
    title: "기초 유연성 향상 프로그램",
    category: "유연성",
    duration: "30분",
    level: "초급",
    difficulty: "easy",
    description:
      "전신 유연성을 향상시키는 단계별 스트레칭 프로그램입니다. 꾸준히 따라하면 몸의 유연성이 크게 향상됩니다.",
    warmup: [
      {
        name: "가벼운 조깅",
        duration: "5분",
        videoId: "D3yExRi7EME",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "청소년기 이상",
        description: "혈액 순환을 촉진하고 체온을 올리는 기본 준비운동입니다.",
      },
      {
        name: "팔 돌리기",
        duration: "2분",
        videoId: "D3yExRi7EME",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "상체",
        targetAge: "전 연령",
        description: "어깨와 팔 관절을 부드럽게 풀어주는 동작입니다.",
      },
    ],
    main: [
      {
        name: "전신 스트레칭",
        duration: "10분",
        videoId: "D3yExRi7EME",
        fitnessCategory: "유연성",
        equipment: "맨몸, 요가매트",
        bodyPart: "전신",
        targetAge: "성인기 이상",
        description: "몸 전체의 유연성을 향상시키는 종합 스트레칭입니다.",
      },
      {
        name: "하체 스트레칭",
        duration: "8분",
        videoId: "v7AYKMP6rOE",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "하체",
        targetAge: "전 연령",
        description: "다리와 엉덩이 근육을 늘려주는 하체 집중 스트레칭입니다.",
      },
      {
        name: "상체 스트레칭",
        duration: "7분",
        videoId: "D3yExRi7EME",
        fitnessCategory: "유연성",
        equipment: "맨몸",
        bodyPart: "상체",
        targetAge: "전 연령",
        description: "어깨, 가슴, 팔 부위의 긴장을 풀어주는 스트레칭입니다.",
      },
    ],
    cooldown: [
      {
        name: "호흡 정리",
        duration: "3분",
        videoId: "D3yExRi7EME",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "전신",
        targetAge: "전 연령",
        description: "심박수를 안정시키고 호흡을 정리하는 마무리 운동입니다.",
      },
      {
        name: "천천히 걷기",
        duration: "3분",
        videoId: "D3yExRi7EME",
        fitnessCategory: "심폐지구력",
        equipment: "맨몸",
        bodyPart: "하체",
        targetAge: "전 연령",
        description: "운동 후 체온을 서서히 낮추는 쿨다운 운동입니다.",
      },
    ],
  },
}

export default function ResultsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [selectedVideo, setSelectedVideo] = useState<{ name: string; videoId: string; index: number } | null>(null)
  const recommendedRecipe = recipesData["flexibility-basic"]

  const allExercises = [...recommendedRecipe.warmup, ...recommendedRecipe.main, ...recommendedRecipe.cooldown]

  const ExerciseCard = ({ exercise, type, index }: { exercise: any; type: string; index: number }) => (
    <Card
      className="group cursor-pointer border-border transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
      onClick={() => setSelectedVideo({ name: exercise.name, videoId: exercise.videoId, index })}
    >
      {/* 썸네일 영역 */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${exercise.videoId}/mqdefault.jpg`}
          alt={exercise.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <Play className="h-6 w-6" />
          </div>
        </div>
        <Badge className="absolute top-2 right-2 bg-black/60 text-white border-0">
          <Clock className="mr-1 h-3 w-3" />
          {exercise.duration}
        </Badge>
      </div>

      <CardContent className="p-4">
        {/* 제목 */}
        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-3 text-lg">
          {exercise.name}
        </h4>

        {/* 운동 정보 태그들 */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {exercise.fitnessCategory}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {exercise.equipment}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {exercise.bodyPart}
          </Badge>
        </div>

        {/* 운동 대상 */}
        <p className="text-xs text-muted-foreground mb-2">
          <span className="font-semibold">대상:</span> {exercise.targetAge}
        </p>

        {/* 운동 설명 */}
        <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Results Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <Award className="h-10 w-10 text-primary" />
              </div>
            </div>
            <Badge className="mb-4 bg-primary text-primary-foreground">분석 완료</Badge>
            <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              체력 등급 분석 결과
            </h1>
            <p className="text-pretty text-lg text-muted-foreground">AI가 당신의 체력을 분석했습니다</p>
          </div>

          {/* Grade Result */}
          <Card className="mb-8 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold text-muted-foreground">당신의 체력 등급</p>
                <div className="mb-2 text-6xl font-bold text-primary">B+</div>
                <p className="text-sm text-muted-foreground">상위 35% (지역 기준)</p>
              </div>
              <div className="mx-auto max-w-md">
                <div className="mb-2 h-3 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[65%] rounded-full bg-primary" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>F</span>
                  <span>D</span>
                  <span>C</span>
                  <span>B</span>
                  <span>A</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  강점
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-muted-foreground">근력: 우수</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-muted-foreground">지구력: 양호</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  개선 필요
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span className="text-muted-foreground">유연성: 보통</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span className="text-muted-foreground">순발력: 보통</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  지역 순위
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="mb-1 text-3xl font-bold text-primary">35%</p>
                  <p className="text-sm text-muted-foreground">상위 랭킹</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exercise Recommendations */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">맞춤 추천 운동 레시피</h2>
              <p className="text-muted-foreground">
                AI가 분석한 결과를 바탕으로 가장 적합한 운동 프로그램을 추천드립니다
              </p>
            </div>

            {/* Recipe Header */}
            <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
                  {recommendedRecipe.category}
                </Badge>
                <h3 className="text-2xl font-bold text-foreground mb-3">{recommendedRecipe.title}</h3>
                <p className="text-muted-foreground mb-4">{recommendedRecipe.description}</p>

                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">총 소요시간</span>
                    <span className="text-muted-foreground">{recommendedRecipe.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">난이도</span>
                    <span className="text-muted-foreground">{recommendedRecipe.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">운동 개수</span>
                    <span className="text-muted-foreground">
                      {recommendedRecipe.warmup.length +
                        recommendedRecipe.main.length +
                        recommendedRecipe.cooldown.length}
                      개
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warmup Exercises */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-green-500 rounded-full" />
                <h3 className="text-xl font-bold text-foreground">준비운동</h3>
                <Badge variant="secondary">{recommendedRecipe.warmup.length}개</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {recommendedRecipe.warmup.map((exercise: any, idx: number) => (
                  <ExerciseCard key={idx} exercise={exercise} type="warmup" index={idx} />
                ))}
              </div>
            </section>

            {/* Main Exercises */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h3 className="text-xl font-bold text-foreground">본운동</h3>
                <Badge variant="secondary">{recommendedRecipe.main.length}개</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedRecipe.main.map((exercise: any, idx: number) => (
                  <ExerciseCard
                    key={idx}
                    exercise={exercise}
                    type="main"
                    index={recommendedRecipe.warmup.length + idx}
                  />
                ))}
              </div>
            </section>

            {/* Cooldown Exercises */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-blue-500 rounded-full" />
                <h3 className="text-xl font-bold text-foreground">정리운동</h3>
                <Badge variant="secondary">{recommendedRecipe.cooldown.length}개</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {recommendedRecipe.cooldown.map((exercise: any, idx: number) => (
                  <ExerciseCard
                    key={idx}
                    exercise={exercise}
                    type="cooldown"
                    index={recommendedRecipe.warmup.length + recommendedRecipe.main.length + idx}
                  />
                ))}
              </div>
            </section>

            <div className="flex justify-center">
              <Button size="lg" asChild>
                <Link to="/recipes">
                  더 많은 레시피 보기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:flex-row md:justify-between md:text-left">
              <div>
                <h3 className="mb-2 text-xl font-bold text-foreground">지금 바로 운동을 시작하세요!</h3>
                <p className="text-sm text-muted-foreground">맞춤형 운동 레시피와 주변 시설 정보를 확인하세요</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/recipes">
                    <BookOpen className="mr-2 h-4 w-4" />
                    운동 레시피 보기
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/map">주변 시설 찾기</Link>
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
          playlist={allExercises}
          currentIndex={selectedVideo.index}
          onNavigate={(nextIndex) => {
            if (nextIndex < 0 || nextIndex >= allExercises.length) return
            const ex = allExercises[nextIndex]
            setSelectedVideo({ name: ex.name, videoId: ex.videoId, index: nextIndex })
          }}
        />
      )}
    </div>
  )
}
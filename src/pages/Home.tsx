"use client"

import { Button } from "@/components/ui/button"
import {
  Activity,
  Award,
  BookOpen,
  MapPin,
  TrendingUp,
  Users,
  Video,
  Dumbbell,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { LoginModal } from "@/components/login-modal"
import { SiteHeader } from "@/components/site-header"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    const token = sessionStorage.getItem("authToken")
    const storedUser = sessionStorage.getItem("user")
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    } else if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target) // Stop observing once visible
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    // Observe all sections with fade-in-section class
    const sections = document.querySelectorAll(".fade-in-section")
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  const handleLoginSuccess = (loginData: { provider: string; name: string }) => {
    const userData = { name: loginData.name }
    setUser(userData)
    sessionStorage.setItem("user", JSON.stringify(userData))
    setLoginModalOpen(false)
    navigate("/my")
  }

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    setUser(null)
    navigate("/")
  }

  const handleGetStarted = () => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null
    const userStr = typeof window !== "undefined" ? sessionStorage.getItem("user") : null
    if (token || userStr) {
      navigate("/assessment")
    } else {
      setLoginModalOpen(true)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Main Content */}
      <main className="flex-1">
        <div className="min-h-screen bg-white">
          {/* Hero Section - AI Tutor Santa Style */}
          <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32">
            <div className="container mx-auto max-w-6xl px-6">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                {/* Left Content */}
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-[#0074B7]">
                    <Sparkles className="h-4 w-4" />
                    AI 기반 맞춤형 체력 관리
                  </div>

                  <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight text-gray-900 lg:text-6xl">
                    당신의 체력을
                    <br />
                    <span className="text-[#0074B7]">AI가 분석하고</span>
                    <br />
                    맞춤 운동을
                    <br />
                    추천합니다
                  </h1>

                  <p className="text-xl leading-relaxed text-gray-600">
                    국민체력100 데이터로 학습된 AI가
                    <br />
                    체력등급을 예측하고, 당신에게
                    <br />
                    최적화된 운동 레시피를 제공합니다.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      className="bg-[#0074B7] px-8 py-6 text-base hover:bg-[#005a91]"
                      onClick={handleGetStarted}
                    >
                      무료로 시작하기
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-gray-300 px-8 py-6 text-base hover:bg-gray-50 bg-transparent"
                      asChild
                    >
                      <Link to="#how-it-works">
                        <Video className="mr-2 h-5 w-5" />
                        사용 방법 보기
                      </Link>
                    </Button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap items-center gap-6 pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">무료 체력 측정</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">AI 맞춤 추천</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">전문가 영상</span>
                    </div>
                  </div>
                </div>

                {/* Right Illustration */}
                <div className="relative">
                  <div className="relative rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 p-8">
                    <img
                      src="/3d-illustration-of-person-exercising-with-fitness-.jpg"
                      alt="체력 측정 일러스트"
                      className="h-auto w-full"
                    />
                  </div>
                  {/* Floating Cards */}
                  <div className="absolute -left-4 top-1/4 rounded-2xl bg-white p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-3">
                        <TrendingUp className="h-6 w-6 text-[#0074B7]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">체력 등급</p>
                        <p className="text-xs text-gray-600">AI 분석 완료</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 bottom-1/4 rounded-2xl bg-white p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-green-100 p-3">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">운동 완료</p>
                        <p className="text-xs text-gray-600">+15 포인트</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="fade-in-section bg-white py-20">
            <div className="container mx-auto max-w-6xl px-6">
              <div className="mb-16 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-[#0074B7]">
                  간단한 4단계
                </div>
                <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">
                  이렇게 시작하세요
                </h2>
                <p className="text-pretty text-lg text-gray-600">
                  몇 분만 투자하면 맞춤형 운동 계획을 받을 수 있습니다
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    step: "01",
                    title: "간편 로그인",
                    description: "카카오 계정으로 빠르게 시작하세요",
                    icon: Users,
                  },
                  {
                    step: "02",
                    title: "체력 측정",
                    description: "가이드 영상을 보며 항목을 입력하세요",
                    icon: Activity,
                  },
                  {
                    step: "03",
                    title: "AI 분석",
                    description: "AI가 체력 등급을 예측하고 분석합니다",
                    icon: TrendingUp,
                  },
                  {
                    step: "04",
                    title: "운동 시작",
                    description: "맞춤형 레시피로 바로 운동을 시작하세요",
                    icon: Dumbbell,
                  },
                ].map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div key={index} className="group relative">
                      <div className="rounded-2xl border-2 border-gray-100 bg-white p-8 transition-all hover:border-[#0074B7] hover:shadow-xl">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 transition-colors group-hover:bg-[#0074B7]">
                          <Icon className="h-8 w-8 text-[#0074B7] transition-colors group-hover:text-white" />
                        </div>
                        <div className="mb-3 text-sm font-bold text-gray-400">{item.step}</div>
                        <h3 className="mb-3 text-xl font-bold text-gray-900">{item.title}</h3>
                        <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="fade-in-section bg-gray-50 py-20">
            <div className="container mx-auto max-w-6xl px-6">
              <div className="mb-16 pt-8 text-center">
                <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">
                  원스톱 체력 관리 플랫폼
                </h2>
                <p className="text-pretty text-lg text-gray-600">
                  체력 측정부터 운동, 커뮤니티까지 모든 것을 한 곳에서
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: Award,
                    title: "체력 등급 & 지역 순위",
                    description: "나의 체력 등급을 확인하고 지역 내 순위를 비교해보세요",
                    color: "#0074B7",
                  },
                  {
                    icon: BookOpen,
                    title: "카테고리별 운동 레시피",
                    description: "하체 강화, 유연성 향상 등 목적에 맞는 운동 프로그램",
                    color: "#10B981",
                  },
                  {
                    icon: Video,
                    title: "전문가 운동 영상",
                    description: "국민체력100의 검증된 운동 가이드 영상 제공",
                    color: "#8B5CF6",
                  },
                  {
                    icon: MapPin,
                    title: "위치 기반 시설 찾기",
                    description: "주변 체육시설과 수강 가능한 강좌를 지도에서 확인",
                    color: "#F59E0B",
                  },
                  {
                    icon: Users,
                    title: "동호회 추천",
                    description: "관심사가 맞는 동호회를 찾고 함께 운동하세요",
                    color: "#EF4444",
                  },
                  {
                    icon: Activity,
                    title: "운동 일지 & 성취 배지",
                    description: "운동 기록을 관리하고 목표 달성 시 배지를 획득하세요",
                    color: "#06B6D4",
                  },
                ].map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={index}
                      className="group rounded-2xl border-2 border-gray-100 bg-white p-8 transition-all hover:border-gray-200 hover:shadow-lg"
                    >
                      <div
                        className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${feature.color}15` }}
                      >
                        <Icon className="h-7 w-7" style={{ color: feature.color }} />
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
                      <p className="leading-relaxed text-gray-600">{feature.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Recipe Preview Section */}
          <section id="recipes" className="fade-in-section bg-white py-20">
            <div className="container mx-auto max-w-6xl px-6">
              <div className="mb-16 pt-8 text-center">
                <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">
                  맞춤형 운동 레시피
                </h2>
                <p className="text-pretty text-lg text-gray-600">AI가 분석한 결과를 바탕으로 이렇게 추천해드립니다</p>
              </div>

              <div className="grid items-center gap-12 lg:grid-cols-2">
                {/* Left: Illustration */}
                <div className="relative">
                  <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 p-8">
                    <img
                      src="/exercise-.jpg"
                      alt="AI 기반 운동 추천 시스템"
                      className="h-auto w-full rounded-2xl shadow-lg"
                    />
                  </div>
                  {/* Floating Badge */}
                  <div className="absolute -right-4 -top-4 rounded-2xl bg-white p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-3">
                        <Sparkles className="h-6 w-6 text-[#0074B7]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">AI 분석 완료</p>
                        <p className="text-xs text-gray-600">맞춤 레시피 준비됨</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Description */}
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-[#0074B7]">
                      <Award className="h-4 w-4" />
                      스마트 추천 시스템
                    </div>
                    <h3 className="mb-4 text-3xl font-bold text-gray-900">
                      당신의 체력에 딱 맞는
                      <br />
                      운동 프로그램을 추천합니다
                    </h3>
                    <p className="mb-6 text-lg leading-relaxed text-gray-600">
                      체력 측정 결과를 AI가 분석하여 준비운동, 본운동, 정리운동으로 구성된 맞춤형 운동 레시피를
                      제공합니다. 각 운동마다 전문가 영상 가이드가 포함되어 있어 처음 운동하시는 분도 쉽게 따라할 수
                      있습니다.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-gray-900">준비운동</h4>
                        <p className="text-sm text-gray-600">부상 예방을 위한 워밍업 동작들로 시작합니다</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                        <Dumbbell className="h-6 w-6 text-[#0074B7]" />
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-gray-900">본운동</h4>
                        <p className="text-sm text-gray-600">체력 수준에 맞는 강도로 구성된 핵심 운동</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-gray-900">정리운동</h4>
                        <p className="text-sm text-gray-600">근육 회복을 돕는 쿨다운 스트레칭</p>
                      </div>
                    </div>
                  </div>

                  <Button size="lg" className="bg-[#0074B7] hover:bg-[#005a91]" onClick={handleGetStarted}>
                    무료로 체력 측정하고 추천받기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section id="start" className="fade-in-section bg-gradient-to-br from-blue-600 to-blue-700 py-20 text-white">
            <div className="container mx-auto max-w-4xl px-6 text-center">
              <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight lg:text-5xl">지금 바로 시작하세요</h2>
              <p className="mb-10 text-pretty text-xl leading-relaxed text-blue-100">
                AI가 당신의 체력을 분석하고 맞춤형 운동을 추천합니다.
                <br />
                무료로 시작해보세요.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-white px-8 py-6 text-base text-[#0074B7] hover:bg-gray-100"
                  onClick={handleGetStarted}
                >
                  <Activity className="mr-2 h-5 w-5" />
                  무료로 체력 측정하기
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white bg-transparent px-8 py-6 text-base text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/recipes">
                    <BookOpen className="mr-2 h-5 w-5" />
                    운동 레시피 둘러보기
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t bg-gray-50 py-8">
            <div className="container mx-auto max-w-6xl px-6">
              <div className="text-center text-sm text-gray-600">
                <p>&copy; 2025 국민체력지키미. All rights reserved.</p>
              </div>
            </div>
          </footer>

          {loginModalOpen && (
            <LoginModal
              isOpen={loginModalOpen}
              onClose={() => setLoginModalOpen(false)}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </div>
      </main>
    </div>
  )
}
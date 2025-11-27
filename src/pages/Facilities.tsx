"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  MapPin,
  Search,
  Navigation,
  Phone,
  Clock,
  Star,
  Dumbbell,
  Waves,
  Mountain,
  Users,
  ExternalLink,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { SiteHeader } from "@/components/site-header"

const generateMockFacilities = (startIndex: number, count: number) => {
  const types = ["종합 체육시설", "수영장", "헬스장", "요가 스튜디오", "크로스핏"]
  const names = ["강남", "역삼", "선릉", "대치", "삼성", "논현", "신사", "압구정", "청담", "도곡"]
  const facilityTypes = ["스포츠센터", "피트니스", "수영장", "요가센터", "크로스핏", "헬스클럽"]

  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i
    const randomName = names[index % names.length]
    const randomType = facilityTypes[index % facilityTypes.length]

    return {
      id: index,
      FCLTY_NM: `${randomName} ${randomType}`,
      FCLTY_TY_NM: types[index % types.length],
      FCLTY_STATE_VALUE: Math.random() > 0.3 ? "운영중" : "휴무",
      RDNMADR_ONE_NM: `서울 강남구 ${randomName}동 ${Math.floor(Math.random() * 900 + 100)}`,
      RDNMADR_TWO_NM: `${Math.floor(Math.random() * 10 + 1)}층`,
      FCLTY_TEL_NO: `02-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      POSESN_MBY_CTPRVN_NM: "서울",
      POSESN_MBY_SIGNGU_NM: "강남구",
      FCLTY_LA: 37.497942 + (Math.random() - 0.5) * 0.02,
      FCLTY_LO: 127.027621 + (Math.random() - 0.5) * 0.02,
      distance: `${(Math.random() * 3 + 0.3).toFixed(1)}km`,
      rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      reviews: Math.floor(Math.random() * 300 + 50),
      hours: index % 5 === 0 ? "24시간" : "06:00 - 22:00",
      facilities: ["헬스", "수영", "요가", "필라테스", "PT"].slice(0, Math.floor(Math.random() * 3 + 2)),
      isOpen: Math.random() > 0.3,
    }
  })
}

export default function FacilitiesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [isVisible, setIsVisible] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [facilities, setFacilities] = useState(generateMockFacilities(0, 5))
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMoreFacilities()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [isLoading, hasMore, page])

  const loadMoreFacilities = () => {
    if (isLoading) return

    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const newFacilities = generateMockFacilities(page * 5, 5)
      setFacilities((prev) => [...prev, ...newFacilities])
      setPage((prev) => prev + 1)
      setIsLoading(false)

      // Stop loading after 50 items for demo purposes
      if (page >= 10) {
        setHasMore(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="mb-8">
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-[#0074B7] transition-all duration-500 ${isVisible ? "animate-fade-in" : "opacity-0"}`}
            >
              <MapPin className="h-4 w-4" />
              위치 기반 추천
            </div>
            <h1
              className={`mb-4 text-4xl font-bold leading-tight tracking-tight text-gray-900 transition-all duration-700 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
            >
              내 주변 <span className="text-[#0074B7]">운동 시설을 찾아보세요</span>
            </h1>
            <p
              className={`text-lg leading-relaxed text-gray-600 transition-all duration-700 delay-100 ${isVisible ? "animate-fade-in" : "opacity-0"}`}
            >
              가까운 체육관, 수영장, 헬스장 정보와 운영 시간을 확인하세요
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="지역명 또는 시설명 검색..."
                  className="h-12 rounded-full border-2 pl-12 pr-4 focus-visible:ring-[#0074B7]"
                />
              </div>
              <Button size="lg" className="h-12 rounded-full bg-[#0074B7] px-6 hover:bg-[#005a91]">
                <Navigation className="mr-2 h-4 w-4" />내 위치
              </Button>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Dumbbell, label: "헬스장" },
              { icon: Waves, label: "수영장" },
              { icon: Mountain, label: "등산로" },
              { icon: Users, label: "체육관" },
            ].map((category, index) => {
              const Icon = category.icon
              return (
                <button
                  key={category.label}
                  onClick={() => setActiveCategory(category.label)}
                  className={`flex items-center gap-2 rounded-full border-2 bg-white px-4 py-2 text-sm font-medium transition-all hover:scale-105 animate-fade-in-up stagger-${index + 1} ${
                    activeCategory === category.label
                      ? "border-[#0074B7] bg-[#0074B7] text-white"
                      : "border-gray-200 text-gray-700 hover:border-[#0074B7] hover:text-[#0074B7]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-6">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Map */}
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
              <div className="h-full overflow-hidden rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-gray-50 shadow-lg">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-white/80 p-6 shadow-md backdrop-blur-sm">
                      <MapPin className="h-16 w-16 text-[#0074B7]" />
                    </div>
                    <p className="mb-2 text-lg font-semibold text-gray-900">지도가 여기에 표시됩니다</p>
                    <p className="text-sm text-gray-600">카카오맵 또는 네이버맵 API 연동</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Facilities List */}
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">내 주변 운동 시설</h2>
                <p className="text-gray-600">강남구 기준 {facilities.length}개 시설</p>
              </div>

              {facilities.map((facility, index) => (
                <Card
                  key={facility.id}
                  className="group overflow-hidden rounded-2xl border-2 border-gray-200 transition-all duration-300 hover:border-[#0074B7] hover:shadow-lg"
                >
                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2 text-xs">
                          {facility.FCLTY_TY_NM}
                        </Badge>
                        <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-[#0074B7]">
                          {facility.FCLTY_NM}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 rounded-lg bg-yellow-50 px-3 py-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-gray-900">{facility.rating}</span>
                          <span className="text-xs text-gray-600">({facility.reviews})</span>
                        </div>
                        <Badge className={facility.isOpen ? "bg-green-500" : "bg-gray-500"}>
                          {facility.FCLTY_STATE_VALUE}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                        <div>
                          <p>{facility.RDNMADR_ONE_NM}</p>
                          <p className="text-[#0074B7] font-semibold">{facility.distance}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{facility.FCLTY_TEL_NO}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{facility.hours}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {facility.facilities.map((f) => (
                          <Badge key={f} variant="secondary" className="px-2 py-0.5 text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-[#0074B7] hover:bg-[#005a91] h-10 rounded-xl">
                        <Navigation className="mr-2 h-4 w-4" />
                        길찾기
                      </Button>
                      <Button variant="outline" className="flex-1 border-2 h-10 rounded-xl bg-transparent">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        상세
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {isLoading && (
                <div className="py-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0074B7] border-r-transparent"></div>
                  <p className="mt-3 text-sm text-gray-600">더 많은 시설을 불러오는 중...</p>
                </div>
              )}

              {hasMore && <div ref={observerTarget} className="h-10" />}

              {!hasMore && (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500">모든 시설을 불러왔습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-16 text-white">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <MapPin className="h-8 w-8" />
          </div>
          <h2 className="mb-4 text-3xl font-bold">내 시설을 등록하시겠어요?</h2>
          <p className="mb-8 text-lg text-blue-100">운동 시설 운영자라면 무료로 등록하고 더 많은 회원을 만나보세요</p>
          <Button size="lg" className="bg-white px-8 text-[#0074B7] hover:bg-gray-100 rounded-full">
            <MapPin className="mr-2 h-5 w-5" />
            시설 등록하기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <img src="/logo-icon.png" alt="국민체력지키미" className="h-8 w-8" />
                <span className="text-lg font-bold text-gray-900">국민체력지키미</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">AI 기반 맞춤형 체력 관리 플랫폼</p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">서비스</h3>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                <li>
                  <Link to="/assessment" className="hover:text-[#0074B7]">
                    체력 측정
                  </Link>
                </li>
                <li>
                  <Link to="/recipes" className="hover:text-[#0074B7]">
                    운동 레시피
                  </Link>
                </li>
                <li>
                  <Link to="/facilities" className="hover:text-[#0074B7]">
                    시설 찾기
                  </Link>
                </li>
                <li>
                  <Link to="/community" className="hover:text-[#0074B7]">
                    동호회
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">고객지원</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link to="#" className="hover:text-[#0074B7]">
                    공지사항
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-[#0074B7]">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-[#0074B7]">
                    문의하기
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">회사</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link to="#" className="hover:text-[#0074B7]">
                    회사 소개
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-[#0074B7]">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-[#0074B7]">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500">
            © 2025 국민체력지키미. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
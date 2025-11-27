"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, MapPin, Calendar, Search, Filter, Heart, TrendingUp, Star, User2, Info, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { ClubDetailModal } from "@/components/club-detail-modal"
import { SiteHeader } from "@/components/site-header"

export default function ClubsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [selectedClub, setSelectedClub] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [displayedClubs, setDisplayedClubs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  const handleViewDetail = (club: any) => {
    setSelectedClub(club)
    setIsModalOpen(true)
  }

  const allClubs = [
    {
      id: 1,
      CLUB_NM: "강남 러닝크루",
      ITEM_NM: "러닝",
      ITEM_CL_NM: "유산소",
      CTPRVN_NM: "서울",
      SIGNGU_NM: "강남구",
      SEXDSTN_FLAG_NM: "전체",
      MBER_CO: 124,
      FOND_DE: "20200315",
      CLUB_DETAIL:
        "매주 2회 강남 일대에서 함께 달리는 러닝 동호회입니다. 초보자부터 마라톤 완주자까지 모두 환영합니다!",
      RGSTR_NM: "김러닝",
      RGSTR_TELNO: "010-1234-5678",
      CLUB_ADRES: "서울특별시 강남구 테헤란로 123",
      CLUB_LOCPLC_NM: "올림픽공원",
      ACTV_DAY: "화, 목",
      ACTV_BEGIN_TM: "0600",
      ACTV_END_TM: "0730",
      CLUB_STATE: "활동중",
      meetings: "주 2회",
      level: "입문-중급",
      image: "running club outdoor morning",
      isPopular: true,
    },
    {
      id: 2,
      CLUB_NM: "요가와 명상",
      ITEM_NM: "요가",
      ITEM_CL_NM: "유연성",
      CTPRVN_NM: "서울",
      SIGNGU_NM: "서초구",
      SEXDSTN_FLAG_NM: "전체",
      MBER_CO: 86,
      FOND_DE: "20210520",
      meetings: "주 3회",
      level: "전체",
      image: "yoga meditation group peaceful",
      isPopular: false,
    },
    {
      id: 3,
      CLUB_NM: "헬스 PT 스터디",
      ITEM_NM: "헬스",
      ITEM_CL_NM: "근력",
      CTPRVN_NM: "서울",
      SIGNGU_NM: "마포구",
      SEXDSTN_FLAG_NM: "전체",
      MBER_CO: 45,
      FOND_DE: "20220810",
      meetings: "주 4회",
      level: "중급-고급",
      image: "fitness gym workout group",
      isPopular: true,
    },
    {
      id: 4,
      CLUB_NM: "주말 등산모임",
      ITEM_NM: "등산",
      ITEM_CL_NM: "유산소",
      CTPRVN_NM: "서울",
      SIGNGU_NM: "송파구",
      SEXDSTN_FLAG_NM: "전체",
      MBER_CO: 203,
      FOND_DE: "20190101",
      meetings: "주말",
      level: "전체",
      image: "hiking mountain group outdoor",
      isPopular: false,
    },
    {
      id: 5,
      CLUB_NM: "새벽 수영 동호회",
      ITEM_NM: "수영",
      ITEM_CL_NM: "유산소",
      CTPRVN_NM: "서울",
      SIGNGU_NM: "강동구",
      SEXDSTN_FLAG_NM: "전체",
      MBER_CO: 67,
      FOND_DE: "20210315",
      meetings: "주 5회",
      level: "중급",
      image: "swimming pool group exercise",
      isPopular: false,
    },
    {
      id: 6,
      CLUB_NM: "한강 사이클",
      ITEM_NM: "사이클",
      ITEM_CL_NM: "유산소",
      CTPRVN_NM: "서울",
      SIGNGU_NM: "영등포구",
      SEXDSTN_FLAG_NM: "전체",
      MBER_CO: 156,
      FOND_DE: "20200701",
      meetings: "주 2회",
      level: "입문-중급",
      image: "cycling bicycle group outdoor",
      isPopular: true,
    },
  ]

  useEffect(() => {
    setDisplayedClubs(allClubs.slice(0, 6))
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMoreClubs()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [isLoading, hasMore, displayedClubs])

  const loadMoreClubs = () => {
    if (displayedClubs.length >= 30) {
      setHasMore(false)
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      const currentLength = displayedClubs.length
      const moreClubs = Array.from({ length: 6 }, (_, i) => ({
        ...allClubs[i % allClubs.length],
        id: currentLength + i + 1,
      }))
      setDisplayedClubs([...displayedClubs, ...moreClubs])
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-[#0074B7]">
              <Users className="h-4 w-4" />
              함께하는 운동
            </div>
            <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight text-gray-900">
              관심사가 맞는
              <br />
              <span className="text-[#0074B7]">동호회를 찾아보세요</span>
            </h1>
            <p className="mb-10 text-pretty text-xl leading-relaxed text-gray-600">
              혼자 운동하기 힘드신가요? 같은 목표를 가진 사람들과 함께 운동하세요
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="동호회 이름, 관심 운동 검색..."
                    className="h-14 rounded-full border-2 pl-12 pr-4 text-base focus-visible:ring-[#0074B7]"
                  />
                </div>
                <Button size="lg" className="h-14 rounded-full bg-[#0074B7] px-8 hover:bg-[#005a91]">
                  검색
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {["전체", "러닝", "요가", "헬스", "등산", "수영", "사이클"].map((category) => (
                <button
                  key={category}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    category === "전체"
                      ? "bg-[#0074B7] text-white"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#0074B7] hover:text-[#0074B7]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-white py-12">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { icon: Users, label: "활성 동호회", value: "2,547개" },
              { icon: User2, label: "전체 회원", value: "15,234명" },
              { icon: Calendar, label: "이번 주 모임", value: "342회" },
              { icon: TrendingUp, label: "신규 동호회", value: "+28개" },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                    <Icon className="h-7 w-7 text-[#0074B7]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">추천 동호회</h2>
            <Button variant="outline" className="gap-2 bg-white">
              <Filter className="h-4 w-4" />
              필터
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedClubs.map((club, index) => (
              <Card
                key={`${club.id}-${index}`}
                className="group overflow-hidden rounded-2xl border-2 transition-all hover:border-[#0074B7] hover:shadow-xl"
              >
                {/* Club Image */}
                <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-blue-50">
                  <img
                    src={`/.jpg?height=240&width=400&query=${club.image}`}
                    alt={club.CLUB_NM}
                    className="h-full w-full object-cover"
                  />
                  {club.isPopular && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-gray-900">
                      <Star className="h-3 w-3 fill-current" />
                      인기
                    </div>
                  )}
                  <button className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white">
                    <Heart className="h-5 w-5 text-gray-700" />
                  </button>
                </div>

                <CardHeader className="pb-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className="bg-[#0074B7] hover:bg-[#005a91]">{club.ITEM_NM}</Badge>
                    <Badge variant="outline">{club.level}</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{club.CLUB_NM}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {club.SIGNGU_NM}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {club.meetings}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-gray-400" />
                    회원 {club.MBER_CO}명
                  </div>

                  <div className="pt-3">
                    <Button
                      className="w-full bg-[#0074B7] hover:bg-[#005a91] gap-2"
                      onClick={() => handleViewDetail(club)}
                    >
                      <Info className="h-4 w-4" />
                      상세 정보
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div ref={observerTarget} className="mt-12 text-center">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>동호회를 불러오는 중...</span>
              </div>
            )}
            {!hasMore && displayedClubs.length > 0 && <p className="text-gray-600">모든 동호회를 불러왔습니다</p>}
          </div>
        </div>
      </section>

      {/* Create Club CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-20 text-white">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm">
            <Users className="h-10 w-10" />
          </div>
          <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight">내 동호회를 만들어보세요</h2>
          <p className="mb-10 text-pretty text-xl leading-relaxed text-blue-100">
            같은 목표를 가진 사람들과 함께 운동하고 동기를 얻으세요
          </p>
          <Button size="lg" className="bg-white px-8 py-6 text-base text-[#0074B7] hover:bg-gray-100">
            <Users className="mr-2 h-5 w-5" />
            동호회 만들기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
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
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2025 국민체력지키미. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {selectedClub && (
        <ClubDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} club={selectedClub} />
      )}
    </div>
  )
}
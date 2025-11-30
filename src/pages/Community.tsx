"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, Calendar, TrendingUp, User2, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef, useCallback } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SearchBar } from "@/components/common/SearchBar"
import { CategoryFilter } from "@/components/common/CategoryFilter"
import { EmptyState } from "@/components/common/EmptyState"
import { LoadingState } from "@/components/common/LoadingState"
import { HeroSection } from "@/components/common/HeroSection"

export default function ClubsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // API 기반 상태 관리
  interface Club {
    id: number
    clubName: string
    sidoName: string
    sigunguName: string
    itemName: string
    itemClassName: string
    genderType: string
    memberCount: number | string
    foundedDate: string
    createdAt?: string
    updatedAt?: string
  }

  const [clubs, setClubs] = useState<Club[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)
  // 대시보드 통계 상태
  const [stats, setStats] = useState<{ activeClubs: number; totalMembers: number; newClubs: number } | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)

  // 지역 목록: 표시용 name + 서버 허용값 value + 임의 count(표시용)
  const REGIONS: { name: string; value: string; count: number }[] = [
    { name: "강원도", value: "강원도", count: 1354 },
    { name: "경기도", value: "경기도", count: 4422 },
    { name: "경상남도", value: "경상남도", count: 1643 },
    { name: "경상북도", value: "경상북도", count: 1441 },
    { name: "광주시", value: "광주광역시", count: 1021 },
    { name: "대구시", value: "대구광역시", count: 1248 },
    { name: "대전시", value: "대전광역시", count: 891 },
    { name: "부산시", value: "부산광역시", count: 1290 },
    { name: "서울시", value: "서울특별시", count: 2875 },
    { name: "세종시", value: "세종특별자치시", count: 366 },
    { name: "울산시", value: "울산광역시", count: 952 },
    { name: "인천시", value: "인천광역시", count: 1182 },
    { name: "전라남도", value: "전라남도", count: 1098 },
    { name: "전라북도", value: "전라북도", count: 1464 },
    { name: "제주도", value: "제주특별자치도", count: 859 },
    { name: "충청남도", value: "충청남도", count: 1260 },
    { name: "충청북도", value: "충청북도", count: 1030 },
  ]

  const [selectedRegion, setSelectedRegion] = useState<string>("모두")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [category, setCategory] = useState<string>("전체")

  // 카테고리(종목) 개수 데이터 기반 상위 카테고리 선정
  const CATEGORY_COUNTS: Record<string, number> = {
    검도: 465,
    게이트볼: 256,
    골프: 141,
    국학기공: 109,
    궁도: 19,
    그라운드골프: 170,
    근대5종: 12,
    농구: 1343,
    당구: 1035,
    댄스스포츠: 59,
    럭비: 10,
    레슬링: 17,
    롤러: 185,
    루지: 1,
    바둑: 279,
    배구: 1066,
    배드민턴: 2521,
    보디빌딩: 215,
    복싱: 42,
    볼링: 608,
    빙상: 409,
    사격: 119,
    사이클: 17,
    산악: 156,
    세팍타크로: 64,
    소프트테니스: 243,
    "수상스키·웨이크보드": 5,
    "수상스키·웨이크스포츠": 55,
    수영: 826,
    "수중_핀수영": 41,
    스쿼시: 313,
    스키: 124,
    씨름: 90,
    아이스하키: 12,
    야구소프트볼: 724,
    "야구소프트볼(야구)": 617,
    양궁: 1,
    에어로빅힙합: 161,
    역도: 152,
    요트: 192,
    우슈: 109,
    유도: 694,
    육상: 24,
    이스포츠: 1,
    조정: 105,
    족구: 1357,
    주짓수: 44,
    줄넘기: 314,
    철인3종: 18,
    체스: 1,
    체조: 312,
    축구: 5645,
    "축구(풋살)": 214,
    치어리딩: 26,
    카누: 32,
    카라테: 3,
    컬링: 20,
    킥복싱: 13,
    탁구: 992,
    태권도: 271,
    택견: 45,
    테니스: 471,
    파워보트: 2,
    파크골프: 17,
    패러글라이딩: 58,
    펜싱: 283,
    하키: 42,
    합기도: 340,
    핸드볼: 69,
  }

  const TOP_CATEGORY_NAMES = Object.entries(CATEGORY_COUNTS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name)

  // API 호출
  const fetchClubs = useCallback(async (reset: boolean = false) => {
    if (isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      // 검색어는 keyword 파라미터로만 전달
      if (searchQuery.trim()) params.set("keyword", searchQuery.trim())
      if (category !== "전체") params.set("category", category)
      params.set("page", String(reset ? 1 : page))
      params.set("limit", String(limit))
      if (selectedRegion !== "모두") {
        params.set("region", selectedRegion)
      }
      const url = `http://localhost:3001/api/clubs?${params.toString()}`
      const res = await fetch(url)
      const json = await res.json().catch(() => ({ success: false, message: `서버 응답 파싱 실패 (${res.status})` }))
      if (!res.ok || json?.success === false) {
        const msg = json?.message || `서버 오류 (${res.status})`
        throw new Error(msg)
      }
      // UX를 위한 인위적 지연: 초기 로드/검색 리셋 시에는 지연 없음, 무한 스크롤 추가 로드 때만 지연
      if (!reset) {
        await new Promise((r) => setTimeout(r, 650))
      }
      const newData: Club[] = (json.data || []).map((c: any) => ({
        id: c.id,
        clubName: c.clubName,
        sidoName: c.sidoName,
        sigunguName: c.sigunguName,
        itemName: c.itemName,
        itemClassName: c.itemClassName,
        genderType: c.genderType,
        memberCount: c.memberCount,
        foundedDate: c.foundedDate,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }))
      setHasNextPage(Boolean(json.hasNextPage))
      setPage(json.page || (reset ? 1 : page))
      if (reset) {
        setClubs(newData)
      } else {
        // 페이징 추가 시 렌더링 끊김 완화: requestAnimationFrame로 프레임에 맞춰 업데이트
        requestAnimationFrame(() => {
          setClubs((prev) => [...prev, ...newData])
        })
      }
    } catch (e: any) {
      setError(e.message || "데이터를 불러오지 못했습니다")
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedRegion, category, page, limit, isLoading])

  // 초기 로드
  useEffect(() => {
    fetchClubs(true)
  }, [])

  // 대시보드 통계 초기 로드
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsError(null)
        const res = await fetch("http://localhost:3001/api/clubs/stats")
        const json = await res.json().catch(() => ({ success: false, message: `서버 응답 파싱 실패 (${res.status})` }))
        if (!res.ok || json?.success === false) {
          throw new Error(json?.message || `서버 오류 (${res.status})`)
        }
        setStats(json.data || null)
      } catch (e: any) {
        setStatsError(e.message || "통계 정보를 불러오지 못했습니다")
      }
    }
    loadStats()
  }, [])

  // 지역/카테고리 변경 시 즉시 리셋 후 재호출 (서버에서 새 18개)
  useEffect(() => {
    setPage(1)
    fetchClubs(true)
  }, [selectedRegion, category])

  // 검색어 변경 시 디바운스 후 서버 재호출 (클라이언트 필터 아님)
  useEffect(() => {
    const id = setTimeout(() => {
      setPage(1)
      fetchClubs(true)
    }, 350)
    return () => clearTimeout(id)
  }, [searchQuery])

  // IntersectionObserver로 다음 페이지 로드
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasNextPage) {
          setPage((p) => p + 1)
        }
      },
      { threshold: 0.15 },
    )
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [isLoading, hasNextPage])

  // 페이지 변경 시 추가 데이터 로드
  useEffect(() => {
    if (page > 1) fetchClubs(false)
  }, [page])

  const formatFondDe = (fondDe: string) => {
    // Expecting YYYYMMDD
    if (!fondDe || fondDe.length !== 8) return fondDe
    const year = fondDe.slice(0, 4)
    const month = fondDe.slice(4, 6).replace(/^0/, "")
    const day = fondDe.slice(6, 8).replace(/^0/, "")
    return `${year}년 ${month}월 ${day}일`
  }

  const formatMemberCount = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(val)
    if (!Number.isFinite(num)) return val
    return Math.round(num)
  }

  // 클라이언트 필터 제거: 지역/카테고리는 서버에서 처리
  const filteredClubs = clubs

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <SiteHeader />

      <HeroSection
        badgeIcon={Users}
        badgeText="함께하는 운동"
        title="관심사가 맞는"
        highlight="동호회를 찾아보세요"
        description="혼자 운동하기 힘드신가요? 같은 목표를 가진 사람들과 함께 운동하세요"
        centered={false}
        className="py-16"
      >
        <div className="mx-auto max-w-3xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={() => fetchClubs(true)}
            placeholder="동호회 이름, 관심 운동 검색..."
            prepend={(
              <div className="relative w-40 sm:w-48 shrink-0">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="h-14 w-full appearance-none rounded-full border-2 border-gray-200 bg-white px-5 pr-10 text-sm font-medium text-gray-700 focus:border-[#0074B7] focus:outline-none focus-visible:ring-[#0074B7]"
                >
                  <option value="모두">모두</option>
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
              </div>
            )}
          />
        </div>
        <CategoryFilter
          className="mt-6"
          categories={["전체", ...TOP_CATEGORY_NAMES]}
          active={category}
          onChange={setCategory}
        />
      </HeroSection>

      {/* Stats Section */}
      <section className="border-y bg-white py-12">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {(() => {
              const items = [
                { icon: Users, label: "활성 동호회", value: stats ? `${stats.activeClubs.toLocaleString()}개` : "—" },
                { icon: User2, label: "전체 회원", value: stats ? `${stats.totalMembers.toLocaleString()}명` : "—" },
                // 신규 동호회: 2025년 설립 기준
                { icon: TrendingUp, label: "신규 동호회(2025)", value: stats ? `+${stats.newClubs.toLocaleString()}개` : "—" },
              ]
              return items.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                      <Icon className="h-7 w-7 text-[#0074B7]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                )
              })
            })()}
            {statsError && (
              <div className="md:col-span-3 mt-2 text-center text-sm text-red-600">{statsError}</div>
            )}
          </div>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">추천 동호회</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClubs.map((club, index) => (
              <Card
                key={`${club.id}-${index}`}
                className="group overflow-hidden rounded-2xl border-2 transition-all hover:border-[#0074B7] hover:shadow-xl py-0"
              >
                <CardHeader className="px-6 pt-6">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className="bg-[#0074B7] hover:bg-[#005a91]">{club.itemName}</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{club.clubName}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 space-y-3 pb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {club.sigunguName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    설립일자 {formatFondDe(club.foundedDate)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-gray-400" />
                    회원 {formatMemberCount(club.memberCount)}명
                  </div>
                  <div className="pt-3 space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      성별 구분: {club.genderType}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      지역: {club.sigunguName}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      체력 항목: {club.itemName}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div ref={observerTarget} className="mt-12 text-center">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {filteredClubs.length === 0 && !isLoading && !error && (
              <EmptyState message="조건에 맞는 동호회가 없습니다" />
            )}
            {!isLoading && !error && !hasNextPage && clubs.length > 0 && (
              <p className="text-m text-gray-600">모든 페이지를 불러왔습니다</p>
            )}
            {isLoading && <LoadingState message="동호회를 불러오는 중..." />}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
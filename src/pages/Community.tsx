"use client"

import { Users } from "lucide-react"
import { MapPin, Calendar, TrendingUp, User2 } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/common/HeroSection"
import { getApiBase, apiFetch } from "@/lib/utils"
import { LoginModal } from "@/components/login-modal"
import { isAuthenticated } from "@/lib/auth"
import { FiltersBar } from "@/components/community/FiltersBar"
import { StatsSection } from "@/components/community/StatsSection"
import { ClubsGrid } from "@/components/community/ClubsGrid"
import type { Club } from "@/components/community/ClubCard"

export default function ClubsPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  useEffect(() => {
    if (!isAuthenticated()) {
      setLoginModalOpen(true)
    }
  }, [])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // API 기반 상태 관리

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
      let json: any
      try {
        json = await apiFetch<any>(`/api/clubs?${params.toString()}`)
        if (json?.success === false) throw new Error(json?.message || '서버 오류')
      } catch (e: any) {
        throw new Error(e?.body?.message || e.message || '서버 오류')
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
        try {
          const json = await apiFetch<any>(`/api/clubs/stats`)
          if (json?.success === false) throw new Error(json?.message || '서버 오류')
          setStats(json.data || null)
        } catch (e: any) {
          throw new Error(e?.body?.message || e.message || '서버 오류')
        }
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

  const formatFoundedDate = (fondDe: string) => {
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

  if (loginModalOpen && !isAuthenticated()) {
    return (
      <>
        <SiteHeader />
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => {
            setLoginModalOpen(false)
            window.history.back()
          }}
          onLoginSuccess={() => setLoginModalOpen(false)}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <SiteHeader />

      <HeroSection
        badgeIcon={Users}
        badgeText="함께하는 운동"
        title="검증된 데이터로"
        highlight="동호회를 추천받아 보세요"
        description="체력 등급·관심사·지역 기반으로 딱 맞는 모임을 추천합니다"
        centered={false}
        className="py-16"
      >
        <FiltersBar
          regions={REGIONS}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={() => fetchClubs(true)}
          category={category}
          onCategoryChange={setCategory}
          topCategoryNames={TOP_CATEGORY_NAMES}
        />
      </HeroSection>

      <StatsSection stats={stats} error={statsError} />

      <ClubsGrid
        clubs={filteredClubs}
        isLoading={isLoading}
        error={error}
        hasNextPage={hasNextPage}
        observerRef={observerTarget}
        formatFoundedDate={formatFoundedDate}
        formatMemberCount={formatMemberCount}
      />

      <SiteFooter />
    </div>
  )
}
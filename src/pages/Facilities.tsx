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
  Activity,
  Flag,
  CircleDot,
  Footprints,
  Trophy,
  Building2,
  Trees,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

declare global {
  interface Window {
    kakao: any
  }
}
import { SiteHeader } from "@/components/site-header"

// 주요 카테고리(빈도 높은 종목)와 기타 처리용 목록
const MAJOR_FACILITY_TYPES = [
  "간이운동장",
  "체력단련장",
  "골프",
  "당구장",
  "태권도",
  "축구장",
  "실내",
  "실외",
]

const MINOR_FACILITY_TYPES = ["수영장", "종합체육시설", "생활체육관", "헬스장", "테니스장", "요가"]

const generateMockFacilities = (startIndex: number, count: number) => {
  // 혼합: 주요 + 일부 기타
  const types = [...MAJOR_FACILITY_TYPES, ...MINOR_FACILITY_TYPES]
  const areas = ["강남", "역삼", "선릉", "대치", "삼성", "논현", "신사", "압구정", "청담", "도곡"]

  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i
    const area = areas[index % areas.length]

    return {
      id: index,
      FCLTY_NM: `${area} ${types[index % types.length]}`,
      FCLTY_TY_NM: types[index % types.length],
      FCLTY_STATE_VALUE: Math.random() > 0.2 ? "운영중" : "휴무",
      ROAD_NM_ZIP_NO: `06${Math.floor(Math.random() * 900 + 100)}`,
      RDNMADR_ONE_NM: `서울 강남구 ${area}로 ${Math.floor(Math.random() * 200 + 1)}`,
      RDNMADR_TWO_NM: `${Math.floor(Math.random() * 10 + 1)}층`,
      FCLTY_LO: 127.027621 + (Math.random() - 0.5) * 0.02,
      FCLTY_LA: 37.497942 + (Math.random() - 0.5) * 0.02,
      FCLTY_TEL_NO: `02-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      POSESN_MBY_CTPRVN_NM: "서울",
      POSESN_MBY_SIGNGU_NM: "강남구",
      DEL_AT: "N",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const clustererRef = useRef<any>(null)
  const infoWindowRef = useRef<any>(null)

  const KAKAO_APP_KEY = (import.meta.env.VITE_KAKAO_APP_KEY as string) || ""
  if (!KAKAO_APP_KEY) {
    console.warn("[KakaoMaps] VITE_KAKAO_APP_KEY 가 설정되지 않았습니다. .env.local 파일을 확인하세요.")
  }

  const loadKakaoMaps = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) {
        resolve()
        return
      }
      const script = document.createElement("script")
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=clusterer`
      script.async = true
      script.onerror = () => reject(new Error("Failed to load Kakao Maps SDK"))
      script.onload = () => {
        window.kakao.maps.load(() => resolve())
      }
      document.head.appendChild(script)
    })

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

  useEffect(() => {
    let canceled = false
    ;(async () => {
      try {
        await loadKakaoMaps()
        if (canceled || !mapContainerRef.current) return
        const { kakao } = window
        const center = new kakao.maps.LatLng(37.497942, 127.027621)
        const map = new kakao.maps.Map(mapContainerRef.current, { center, level: 5 })
        mapRef.current = map
        // clusterer & info window
        clustererRef.current = new kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 6,
        })
        infoWindowRef.current = new kakao.maps.InfoWindow({ zIndex: 2 })
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      canceled = true
    }
  }, [])

  const clearMarkers = () => {
    if (clustererRef.current && typeof clustererRef.current.clear === 'function') {
      clustererRef.current.clear()
    } else if (clustererRef.current && typeof clustererRef.current.removeMarkers === 'function') {
      // Fallback: remove existing markers if tracked
      if (markersRef.current.length) {
        clustererRef.current.removeMarkers(markersRef.current)
      }
    }
    if (markersRef.current.length) {
      markersRef.current.forEach((m) => m.setMap && m.setMap(null))
      markersRef.current = []
    }
  }

  const matchesCategory = (f: any, category: string | null): boolean => {
    if (!category) return true
    if (category === '기타') return !MAJOR_FACILITY_TYPES.includes(f.FCLTY_TY_NM)
    return f.FCLTY_TY_NM === category
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map || !window.kakao || !window.kakao.maps) return
    const { kakao } = window
    clearMarkers()
    const bounds = new kakao.maps.LatLngBounds()
    const filtered = facilities.filter((f) => matchesCategory(f, activeCategory))
    const newMarkers = filtered.map((f) => {
      const pos = new kakao.maps.LatLng(f.FCLTY_LA, f.FCLTY_LO)
      const marker = new kakao.maps.Marker({ position: pos })
      kakao.maps.event.addListener(marker, 'click', () => {
        const phone = f.FCLTY_TEL_NO ? `<br/><span style="color:#555">${f.FCLTY_TEL_NO}</span>` : ''
        const content = `<div style="padding:8px 10px;white-space:nowrap"><b>${f.FCLTY_NM}</b>${phone}</div>`
        infoWindowRef.current?.setContent(content)
        infoWindowRef.current?.open(map, marker)
      })
      bounds.extend(pos)
      return marker
    })
    markersRef.current = newMarkers
    if (clustererRef.current) {
      if (typeof clustererRef.current.clear === 'function') clustererRef.current.clear()
      if (typeof clustererRef.current.addMarkers === 'function') clustererRef.current.addMarkers(newMarkers)
    } else {
      newMarkers.forEach((m) => m.setMap && m.setMap(map))
    }
    if (newMarkers.length > 0) {
      map.setBounds(bounds)
    }
  }, [facilities, activeCategory])

  const handleLocateMe = () => {
    const map = mapRef.current
    if (!map || !navigator.geolocation || !window.kakao) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { kakao } = window
        const latlng = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
        const marker = new kakao.maps.Marker({ position: latlng })
        marker.setMap(map)
        markersRef.current.push(marker)
        map.panTo(latlng)
      },
      () => {
        console.warn("Geolocation not permitted")
      },
    )
  }

  const openDirections = (f: any) => {
    if (!f || !f.FCLTY_LA || !f.FCLTY_LO) return
    const name = encodeURIComponent(f.FCLTY_NM || '목적지')
    const url = `https://map.kakao.com/link/to/${name},${f.FCLTY_LA},${f.FCLTY_LO}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }


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
              <Button size="lg" className="h-12 rounded-full bg-[#0074B7] px-6 hover:bg-[#005a91]" onClick={handleLocateMe}>
                <Navigation className="mr-2 h-4 w-4" />내 위치
              </Button>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: '모두' },
              ...MAJOR_FACILITY_TYPES.map((t) => ({ label: t })),
              { label: '기타' },
            ].map((category, index) => {
                // 카테고리별 고유 아이콘 매핑 (중복 없음)
                const iconMap: Record<string, any> = {
                  모두: MapPin,
                  간이운동장: Flag,
                  체력단련장: Dumbbell,
                  골프: Mountain,
                  당구장: CircleDot,
                  태권도: Footprints,
                  축구장: Trophy,
                  실내: Building2,
                  실외: Trees,
                  기타: ExternalLink,
                }
                const Icon = iconMap[category.label] || Activity
              const isActive = category.label === '모두' ? activeCategory === null : activeCategory === category.label
              return (
                <button
                  key={category.label}
                  onClick={() => setActiveCategory(category.label === '모두' ? null : category.label)}
                  className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all hover:scale-105 animate-fade-in-up stagger-${index + 1} ${
                    isActive
                      ? 'border-[#0074B7] bg-[#0074B7] text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#0074B7] hover:text-[#0074B7]'
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
            {/* Left: Map (give explicit height on small screens so map is visible) */}
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] h-72 sm:h-96">
              <div className="h-full overflow-hidden rounded-3xl border-2 border-gray-200 shadow-lg">
                <div ref={mapContainerRef} className="h-full w-full" />
              </div>
            </div>

            {/* Right: Facilities List */}
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">내 주변 운동 시설</h2>
                <p className="text-gray-600">강남구 기준 {facilities.length}개 시설</p>
              </div>

              {(() => {
                const filtered = facilities.filter((f) => matchesCategory(f, activeCategory))
                if (filtered.length === 0) {
                  return (
                    <div className="rounded-2xl border-2 border-dashed border-gray-300 p-10 text-center text-sm text-gray-600">
                      선택한 카테고리에 해당하는 시설이 없습니다.
                    </div>
                  )
                }
                return filtered.map((facility) => (
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
                        <Badge className={facility.FCLTY_STATE_VALUE === '운영중' ? 'bg-green-500' : 'bg-gray-500'}>
                          {facility.FCLTY_STATE_VALUE}
                        </Badge>
                      </div>
                      <div className="mb-4 space-y-2 text-sm">
                        <div className="flex items-start gap-2 text-gray-700">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                          <div>
                            <p>{facility.RDNMADR_ONE_NM}</p>
                            {facility.RDNMADR_TWO_NM && <p className="text-gray-600">{facility.RDNMADR_TWO_NM}</p>}
                            {facility.ROAD_NM_ZIP_NO && (
                              <p className="text-xs text-gray-500">우편번호: {facility.ROAD_NM_ZIP_NO}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{facility.FCLTY_TEL_NO ?? '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>
                            {facility.POSESN_MBY_CTPRVN_NM} {facility.POSESN_MBY_SIGNGU_NM}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 h-10 rounded-xl bg-[#0074B7] hover:bg-[#005a91]"
                          onClick={() => openDirections(facility)}
                          title="카카오맵 길찾기 열기"
                        >
                          <Navigation className="mr-2 h-4 w-4" />
                          길찾기
                        </Button>
                        {facility.FCLTY_TEL_NO ? (
                          <Button variant="outline" className="flex-1 h-10 rounded-xl border-2 bg-transparent" asChild>
                            <a href={`tel:${facility.FCLTY_TEL_NO}`} title="전화걸기">
                              <Phone className="mr-2 h-4 w-4" />전화
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" className="flex-1 h-10 rounded-xl border-2 bg-transparent" disabled>
                            <Phone className="mr-2 h-4 w-4" />전화
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              })()}
              {isLoading && (
                <div className="py-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0074B7] border-r-transparent" />
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
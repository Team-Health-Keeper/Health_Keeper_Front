"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Navigation, Phone, Clock } from "lucide-react"
import { useState, useEffect, useRef } from "react"

declare global {
  interface Window {
    kakao: any
  }
}
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SearchBar } from "@/components/common/SearchBar"
import { CategoryFilter } from "@/components/common/CategoryFilter"
import { EmptyState } from "@/components/common/EmptyState"
import { LoadingState } from "@/components/common/LoadingState"
import { HeroSection } from "@/components/common/HeroSection"

// 인기 카테고리 (응답 빈도 기반)
const MAJOR_FACILITY_TYPES = [
  "체력단련장",
  "당구장",
  "태권도",
  "골프",
  "스크린",
  "실내",
  "실외",
  "축구",
  "축구장",
  "합기도",
  "테니스장",
  "생활체육관",
]

interface FacilityApiItem {
  id: number
  facilityName: string
  facilityType: string
  stateValue: string | null
  zipCode: string | null
  addressMain: string | null
  addressDetail: string | null
  telNo: string | null
  sidoName: string | null
  sigunguName: string | null
  latitude: number | null
  longitude: number | null
  distance?: number | null
  createdAt?: string
  updatedAt?: string
}

interface NearbyRawItem {
  id?: number
  FCLTY_NM?: string | null
  FCLTY_TY_NM?: string | null
  FCLTY_STATE_VALUE?: string | null
  ROAD_NM_ZIP_NO?: string | null
  RDNMADR_ONE_NM?: string | null
  RDNMADR_TWO_NM?: string | null
  FCLTY_TEL_NO?: string | null
  POSESN_MBY_CTPRVN_NM?: string | null
  POSESN_MBY_SIGNGU_NM?: string | null
  FCLTY_LA?: string | number | null
  FCLTY_LO?: string | number | null
  distance?: number | null
}

interface NearbyApiResponse {
  success: boolean
  count?: number
  data: NearbyRawItem[]
  message?: string
  meta?: {
    centerLat?: number
    centerLng?: number
    radius?: number
    totalCount?: number
    page?: number
    limit?: number
  }
}

export default function FacilitiesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [facilities, setFacilities] = useState<FacilityApiItem[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [committedQuery, setCommittedQuery] = useState("")
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
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

  // hero animation handled inside HeroSection component

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

  const matchesCategory = (f: FacilityApiItem, category: string | null): boolean => {
    if (!category) return true
    return f.facilityType === category
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map || !window.kakao || !window.kakao.maps) return
    const { kakao } = window
    clearMarkers()
    const bounds = new kakao.maps.LatLngBounds()
    const filtered = facilities.filter((f) => matchesCategory(f, activeCategory) && f.latitude != null && f.longitude != null)
    const newMarkers = filtered.map((f) => {
      const pos = new kakao.maps.LatLng(f.latitude, f.longitude)
      const marker = new kakao.maps.Marker({ position: pos })
      kakao.maps.event.addListener(marker, 'click', () => {
        const phone = f.telNo ? `<br/><span style=\"color:#555\">${f.telNo}</span>` : ''
        const content = `<div style=\"padding:8px 10px;white-space:nowrap\"><b>${f.facilityName}</b>${phone}</div>`
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
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
      },
      () => {
        setError("위치 권한을 허용하면 주변 시설을 볼 수 있어요")
        console.warn("Geolocation not permitted")
      },
    )
  }

  // 페이지 진입 시 즉시 내 위치 요청
  useEffect(() => {
    handleLocateMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 내 위치가 잡히면 지도 중심을 내 위치로 이동
  useEffect(() => {
    const map = mapRef.current
    if (!map || userLat == null || userLng == null || !window.kakao || !window.kakao.maps) return
    const { kakao } = window
    const center = new kakao.maps.LatLng(userLat, userLng)
    map.setCenter(center)
  }, [userLat, userLng])

  const openDirections = (f: { facilityName?: string; latitude?: number | null; longitude?: number | null }) => {
    if (!f || f.latitude == null || f.longitude == null) return
    const name = encodeURIComponent(f.facilityName || '목적지')
    const url = `https://map.kakao.com/link/to/${name},${f.latitude},${f.longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180
    const R = 6371
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // 우편번호 형식 정리: "21674.0" → "21674"
  const formatZip = (zip?: string | null): string | null => {
    if (!zip) return null
    const z = String(zip).trim()
    const m = z.match(/^(\d+)(?:\.0+)?$/)
    return m ? m[1] : z
  }

  const fetchFacilities = async (_targetPage: number, _append: boolean) => {
    try {
      setIsLoading(true)
      setError(null)

      if (userLat == null || userLng == null) {
        setFacilities([])
        setHasMore(false)
        setError("내 위치를 설정하면 주변 시설을 볼 수 있어요. 상단의 '내 위치'를 눌러주세요.")
        return
      }

      const params = new URLSearchParams()
      params.append('lat', String(userLat))
      params.append('lng', String(userLng))
      params.append('limit', String(limit))
      params.append('radius', String(5)) // 5km 반경 (km 단위)
      params.append('page', String(_targetPage))
      if (activeCategory && activeCategory !== '전체') params.append('facilityType', activeCategory)

      const url = `http://localhost:3001/api/sports-facilities/nearby${params.toString() ? `?${params.toString()}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('서버 응답이 올바르지 않습니다.')
      const json: NearbyApiResponse = await res.json()
      if (!json.success) throw new Error(json.message || '요청 실패')

      const normalized: FacilityApiItem[] = (json.data || []).map((item, idx) => {
        const latRaw = item.FCLTY_LA
        const lngRaw = item.FCLTY_LO
        const lat = typeof latRaw === 'string' ? parseFloat(latRaw) : (latRaw ?? null as any)
        const lng = typeof lngRaw === 'string' ? parseFloat(lngRaw) : (lngRaw ?? null as any)
        const dist = item.distance != null ? item.distance : (lat != null && lng != null ? haversineKm(userLat, userLng, lat, lng) : null)
        return {
          id: item.id ?? idx,
          facilityName: item.FCLTY_NM ?? '이름 없음',
          facilityType: item.FCLTY_TY_NM ?? '기타',
          stateValue: item.FCLTY_STATE_VALUE ?? null,
          zipCode: item.ROAD_NM_ZIP_NO ?? null,
          addressMain: item.RDNMADR_ONE_NM ?? null,
          addressDetail: item.RDNMADR_TWO_NM ?? null,
          telNo: item.FCLTY_TEL_NO ?? null,
          sidoName: item.POSESN_MBY_CTPRVN_NM ?? null,
          sigunguName: item.POSESN_MBY_SIGNGU_NM ?? null,
          latitude: Number.isFinite(lat as any) ? (lat as number) : null,
          longitude: Number.isFinite(lng as any) ? (lng as number) : null,
          distance: dist,
        }
      })

      const withCoords = normalized.filter(d => d.latitude != null && d.longitude != null)

      // 클라이언트 키워드 필터
      const keyword = committedQuery.trim()
      const filtered = keyword
        ? withCoords.filter(d =>
            (d.facilityName && d.facilityName.includes(keyword)) ||
            (d.addressMain && d.addressMain.includes(keyword))
          )
        : withCoords

      // 카테고리는 상단 UI에서 별도 필터링되지만 혹시 모를 서버 미적용 대비
      const byCategory = activeCategory ? filtered.filter(f => f.facilityType === activeCategory) : filtered

      setFacilities(prev => (_append ? [...prev, ...byCategory] : byCategory))
      const total = json.meta?.totalCount
      const curPage = json.meta?.page ?? _targetPage
      const curLimit = json.meta?.limit ?? limit
      const more = total != null ? (curPage * curLimit < total) : ((json.data?.length || 0) === limit)
      setHasMore(more)
    } catch (e: any) {
      setError(e.message || '데이터를 불러오지 못했습니다.')
      setFacilities([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreFacilities = () => {
    if (isLoading || !hasMore) return
    const next = page + 1
    setPage(next)
    fetchFacilities(next, true)
  }

  // 초기에는 위치 설정 이후에만 데이터를 불러옵니다.

  useEffect(() => {
    setPage(1)
    fetchFacilities(1, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committedQuery, activeCategory, userLat, userLng])

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <HeroSection
        badgeIcon={MapPin}
        badgeText="위치 기반 추천"
        title="내 주변"
        highlight="운동 시설을 찾아보세요"
        description="가까운 체육관, 수영장, 헬스장 정보와 운영 시간을 확인하세요"
      >
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={() => setCommittedQuery(searchQuery)}
            placeholder="지역명 또는 시설명 검색..."
            append={(
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-2 border-[#0074B7] bg-white px-8 text-[#0074B7] hover:bg-gray-100 hover:text-[#0074B7] hover:border-[#005a91] focus-visible:ring-2 focus-visible:ring-[#0074B7]/40 focus-visible:ring-offset-2 transition-colors duration-150"
                onClick={handleLocateMe}
                title="현재 위치로 검색"
              >
                <Navigation className="mr-2 h-4 w-4" />내 위치
              </Button>
            )}
          />
        </div>
        <CategoryFilter
          categories={["전체", ...MAJOR_FACILITY_TYPES]}
          active={activeCategory ?? "전체"}
          onChange={(c) => setActiveCategory(c === "전체" ? null : c)}
          className="mt-2"
        />
      </HeroSection>

      <section className="bg-white py-6">
        <div className="container mx-auto max-w-6xl px-6">
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
                <p className="text-gray-600">총 {facilities.length}개 시설</p>
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
              </div>

              {(() => {
                if (!facilities.length && !isLoading && !error) {
                  const hasLocation = userLat != null && userLng != null
                  const hasFilter = !!committedQuery.trim() || !!activeCategory
                  return (
                    <EmptyState
                      message={
                        !hasLocation
                          ? "내 위치를 설정하면 주변 시설을 볼 수 있어요"
                          : hasFilter
                            ? "조건에 맞는 시설이 없습니다"
                            : "불러올 시설이 없습니다"
                      }
                    />
                  )
                }
                return facilities.map((facility) => {
                  const one = (facility.addressMain || '').trim()
                  const two = (facility.addressDetail || '').trim()
                  const zip = formatZip(facility.zipCode)
                  let addressLine = ''
                  if (one || two) {
                    addressLine = one
                    if (two && (!one || !one.includes(two))) {
                      addressLine = addressLine ? `${addressLine}, ${two}` : two
                    }
                    if (zip) {
                      addressLine = addressLine ? `${addressLine} [${zip}]` : `[${zip}]`
                    }
                  }

                  return (
                    <Card
                      key={facility.id}
                      className="group overflow-hidden rounded-2xl border-2 border-gray-200 transition-all duration-300 hover:border-[#0074B7] hover:shadow-lg"
                    >
                      <div className="p-5">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2 text-xs">
                              {facility.facilityType}
                            </Badge>
                            <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-[#0074B7]">
                              {facility.facilityName}
                            </h3>
                          </div>
                          <Badge className={(facility.stateValue === '정상운영' || facility.stateValue === '운영중') ? 'bg-green-500' : 'bg-gray-500'}>
                            {facility.stateValue || '정보없음'}
                          </Badge>
                        </div>
                        <div className="mb-4 space-y-2 text-sm">
                          <div className="flex items-start gap-2 text-gray-700">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                            <div>
                              {addressLine ? (
                                <p>{addressLine}</p>
                              ) : (
                                <p className="text-gray-500">주소 정보 없음</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{facility.telNo ?? '-'}</span>
                          </div>
                          {facility.distance != null && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>
                                예상 소요: 도보 {Math.max(1, Math.round((facility.distance ?? 0) * 12))}분 · 차량 {Math.max(1, Math.round((facility.distance ?? 0) * 2))}분
                              </span>
                            </div>
                          )}
                          {facility.distance != null && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <span className="text-xs text-gray-500">거리: {facility.distance?.toFixed(2)} km</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 h-10 rounded-xl bg-[#0074B7] hover:bg-[#005a91]"
                            onClick={() => openDirections({ facilityName: facility.facilityName, latitude: facility.latitude, longitude: facility.longitude })}
                            title="카카오맵 길찾기 열기"
                            disabled={facility.latitude == null || facility.longitude == null}
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            길찾기
                          </Button>
                          {facility.telNo ? (
                            <Button variant="outline" className="flex-1 h-10 rounded-xl border-2 bg-transparent" asChild>
                              <a href={`tel:${facility.telNo}`} title="전화걸기">
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
                  )
                })
              })()}
              {isLoading && (
                <div className="py-8 text-center">
                  <LoadingState message="더 많은 시설을 불러오는 중..." />
                </div>
              )}

              {hasMore && <div ref={observerTarget} className="h-10" />}

              {!hasMore && facilities.length > 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500">모든 시설을 불러왔습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
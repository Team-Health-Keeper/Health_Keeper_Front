"use client"

import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { useState, useEffect, useRef } from "react"

declare global {
  interface Window {
    kakao: any
  }
}
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getApiBase, apiFetch } from "@/lib/utils"
import { haversineKm, formatZip } from "@/utils/facilities"
import { HeroSection } from "@/components/common/HeroSection"
import { FiltersBar as FacilitiesFiltersBar } from "@/components/facilities/FiltersBar"
import { MapPane } from "@/components/facilities/MapPane"
import { FacilitiesList } from "@/components/facilities/FacilitiesList"
import { LoginModal } from "@/components/login-modal"
import { isAuthenticated } from "@/lib/auth"

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
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  useEffect(() => {
    if (!isAuthenticated()) {
      setLoginModalOpen(true)
    }
  }, [])
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
    if (!navigator.geolocation) {
      setError("이 브라우저에서는 위치 기능을 사용할 수 없어요. 임시로 서울역 기준으로 보여드릴게요.")
      // 임시 위치(서울역)로 설정
      setUserLat(37.554722)
      setUserLng(126.970833)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setError(null)
      },
      (err) => {
        // Provide actionable guidance, especially for Safari
        let msg = "위치 권한을 허용하면 주변 시설을 볼 수 있어요"
        if (err && typeof err.code === 'number') {
          switch (err.code) {
            case 1:
              msg = "권한이 거부되었어요. 설정에서 이 사이트의 위치 권한을 '허용' 또는 '묻기'로 변경해주세요. 임시로 서울역 기준으로 보여드릴게요."
              break
            case 2:
              msg = "위치를 가져오지 못했어요. 네트워크 상태를 확인하고 다시 시도해주세요. 임시로 서울역 기준으로 보여드릴게요."
              break
            case 3:
              msg = "위치 요청이 시간 초과됐어요. 주변 환경이 실내면 정확도가 낮을 수 있어요. 임시로 서울역 기준으로 보여드릴게요."
              break
          }
        }
        setError(msg)
        // 임시 위치(서울역)로 설정
        setUserLat(37.554722)
        setUserLng(126.970833)
        console.warn("Geolocation error:", err)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // 페이지 진입 시 즉시 내 위치 요청 (요청사항: 자동 호출)
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

  // 거리/우편번호 포맷 유틸은 utils/facilities.ts에서 import

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

      let json: NearbyApiResponse
      try {
        json = await apiFetch<NearbyApiResponse>(`/api/sports-facilities/nearby${params.toString() ? `?${params.toString()}` : ''}`)
        if (!json.success) throw new Error(json.message || '요청 실패')
      } catch (e: any) {
        throw new Error(e?.body?.message || e.message || '요청 실패')
      }

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
      <SiteHeader />

      <HeroSection
        badgeIcon={MapPin}
        badgeText="위치 기반 추천"
        title="내 주변"
        highlight="운동 시설을 찾아보세요"
        description="가까운 체육관, 수영장, 헬스장 정보와 운영 시간을 확인하세요"
      >
        <FacilitiesFiltersBar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={() => setCommittedQuery(searchQuery)}
          onLocate={handleLocateMe}
          categories={["전체", ...MAJOR_FACILITY_TYPES]}
          activeCategory={activeCategory ?? "전체"}
          onCategoryChange={(c) => setActiveCategory(c === "전체" ? null : c)}
        />
      </HeroSection>

      <section className="bg-white py-6">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Map (give explicit height on small screens so map is visible) */}
            <MapPane containerRef={mapContainerRef} />

            {/* Right: Facilities List */}
            <FacilitiesList
              facilities={facilities}
              error={error}
              isLoading={isLoading}
              hasMore={hasMore}
              observerRef={observerTarget}
              userHasLocation={userLat != null && userLng != null}
              hasFilter={!!committedQuery.trim() || !!activeCategory}
              formatZip={formatZip}
              onDirections={openDirections}
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}